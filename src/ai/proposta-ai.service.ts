import { Injectable, Logger } from '@nestjs/common';
import { Response } from 'express';
import { AiService } from './ai.service';
import { MensagemBreveDto } from './dto/mensagem-breve.dto';
import { SugerirBlocoDto } from './dto/sugerir-bloco.dto';
import { SugerirAtividadesDiaDto } from './dto/sugerir-atividades-dia.dto';

export interface AiBlockData {
  title?: string;
  location?: string;
  bodyMd?: string;
  operator?: string;
  vehicleType?: string;
  includes?: string;
  airline?: string;
  phone?: string;
  cancelPolicy?: string;
  hotelCategory?: number;
  roomType?: string;
  mealPlan?: string;
  supplier?: string;
  [key: string]: unknown;
}

export interface AiBlockSuggestion {
  blockType: string;
  blockData: AiBlockData;
}

// ─── URL stripping (defesa em profundidade — prompts já instruem a não incluir) ──

const URL_PATTERNS: RegExp[] = [
  /\bhttps?:\/\/\S+/gi,
  /\bwww\.[a-z0-9.-]+\.[a-z]{2,}(?:\/\S*)?/gi,
  /\b[a-z0-9-]+(?:\.[a-z0-9-]+)+\.(?:com|com\.br|net|org|io|co|app|gov|edu)(?:\/\S*)?\b/gi,
];

function sanitizeText(input: string): string {
  let out = input;
  for (const re of URL_PATTERNS) out = out.replace(re, '');
  out = out
    .replace(/\(\s*\)/g, '')              // parênteses vazios
    .replace(/\[\s*\]/g, '')              // colchetes vazios (rasto de markdown link)
    .replace(/[ \t]+([.,;:!?])/g, '$1')   // espaço antes de pontuação
    .replace(/[ \t]{2,}/g, ' ')           // múltiplos espaços
    .replace(/\n{3,}/g, '\n\n')           // limita quebras
    .trim();
  return out;
}

function sanitizeAiOutput<T>(value: T): T {
  if (value == null) return value;
  if (typeof value === 'string') return sanitizeText(value) as unknown as T;
  if (Array.isArray(value)) return value.map(v => sanitizeAiOutput(v)) as unknown as T;
  if (typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = sanitizeAiOutput(v);
    }
    return out as T;
  }
  return value;
}

// ─── Prompts base ──────────────────────────────────────────────────────────────

const SYSTEM_BASE = `Você é um consultor sênior de uma agência de viagens premium brasileira.
Retorne APENAS JSON válido, sem blocos de markdown ao redor do JSON, sem texto fora do JSON.
Todos os textos em Português do Brasil.
Omita campos que não puder preencher com informação real ou confiável.

REGRAS DE CONTEÚDO (obrigatórias):
- NÃO inclua URLs, links, domínios (ex: "site.com", "www.…"), nem frases do tipo "veja em…", "acesse o site", "mais informações em…". Use apenas texto descritivo.
- Em campos de texto longo (bodyMd, cancelPolicy, includes), use markdown leve:
  • parágrafos separados por uma linha em branco;
  • **negrito** para destaques pontuais (1–3 por parágrafo);
  • listas com "- " quando houver itens enumeráveis (inclusões, dicas, o que levar);
  • sem títulos (#), sem tabelas, sem código.
- Frases curtas e diretas. Sem repetir o título do bloco no início do bodyMd.`;

const BLOCK_TYPES_WITH_WEB_SEARCH = new Set(['hospedagem', 'restaurante', 'experiencia']);

const BLOCK_SYSTEM_PROMPTS: Record<string, string> = {
  hospedagem: `${SYSTEM_BASE}
Pesquise na internet e sugira dados reais para um bloco de HOSPEDAGEM.
Retorne JSON com os campos disponíveis:
{
  "title": "nome real do hotel",
  "location": "endereço ou bairro",
  "hotelCategory": 5,
  "roomType": "tipo de quarto sugerido (ex: Deluxe Double, Suite Vista Mar)",
  "time": "HH:MM do check-in padrão (ex: 14:00)",
  "endTime": "HH:MM do check-out padrão (ex: 12:00)",
  "nights": 3,
  "people": 2,
  "mealPlan": "RO | BB | HB | FB | AI",
  "supplier": "site ou canal de reserva sugerido",
  "bookingRef": "",
  "bodyMd": "descrição envolvente do hotel (2-3 frases destacando diferenciais)"
}`,

  restaurante: `${SYSTEM_BASE}
Pesquise na internet e sugira dados reais para um bloco de RESTAURANTE.
Retorne JSON com os campos disponíveis:
{
  "title": "nome real do restaurante",
  "location": "endereço completo",
  "time": "HH:MM sugerido para a reserva (ex: 20:00)",
  "endTime": "HH:MM previsto de saída (ex: 22:30)",
  "people": 2,
  "phone": "telefone para reserva (com código do país)",
  "bookingRef": "",
  "cancelPolicy": "política de cancelamento se conhecida",
  "bodyMd": "descrição: culinária, ambiente, pratos destaque, dicas"
}`,

  experiencia: `${SYSTEM_BASE}
Pesquise na internet e sugira dados reais para um bloco de EXPERIÊNCIA / ATIVIDADE.
Retorne JSON com os campos disponíveis:
{
  "title": "nome da experiência ou atração",
  "location": "endereço ou ponto de encontro",
  "time": "HH:MM sugerido para início (ex: 09:00)",
  "endTime": "HH:MM previsto de encerramento (ex: 12:00)",
  "people": 2,
  "bookingRef": "",
  "bodyMd": "detalhes: o que está incluído, o que levar, dicas práticas"
}`,

  transporte: `${SYSTEM_BASE}
Sugira dados para um bloco de TRANSPORTE / TRASLADO.
Retorne JSON com os campos disponíveis:
{
  "title": "descrição do traslado (ex: Transfer Aeroporto → Hotel Centro)",
  "transportType": "tipo (ex: Transfer privativo, Ônibus, Trem, Ferry)",
  "operator": "operadora local sugerida",
  "time": "HH:MM de saída (ex: 10:30)",
  "endTime": "HH:MM previsto de chegada (ex: 11:45)",
  "origin": "local de partida",
  "destination": "local de chegada",
  "vehicleType": "tipo de veículo adequado ao número de passageiros",
  "driverContact": "",
  "people": 2,
  "bookingRef": "",
  "includes": "o que está incluso (ex: encontro no aeroporto, água, Wi-Fi, gorjeta)",
  "bodyMd": "observações relevantes sobre o traslado"
}`,

  aereo: `${SYSTEM_BASE}
Sugira informações para um bloco de VOO / AÉREO.
NÃO invente números de voo reais nem horários exatos — use apenas informações gerais.
Retorne JSON com os campos disponíveis:
{
  "airline": "nome da companhia aérea mais indicada para esta rota",
  "cabinClass": "economy | premium | business | first",
  "origin": "código IATA do aeroporto de origem (ex: GRU)",
  "destination": "código IATA do aeroporto de destino (ex: FCO)",
  "flightNumber": "",
  "time": "",
  "arrivalTime": "",
  "gate": "",
  "bookingRef": "",
  "bodyMd": "dicas úteis: franquia de bagagem padrão desta companhia, check-in online, recomendações gerais para esta rota"
}`,
};

const DAY_ACTIVITIES_SYSTEM = `${SYSTEM_BASE}
Pesquise na internet e sugira atividades e refeições para o dia descrito.
IMPORTANT: retorne APENAS blockTypes "experiencia" ou "restaurante". Nunca sugira transfers, hospedagem ou voos.
Retorne JSON no formato:
{
  "suggestions": [
    {
      "blockType": "experiencia | restaurante",
      "blockData": {
        "title": "nome real",
        "location": "endereço ou local",
        "time": "HH:MM sugerido",
        "endTime": "HH:MM previsto",
        "people": 2,
        "bodyMd": "descrição breve e útil"
      }
    }
  ]
}
Retorne entre 3 e 5 sugestões alternando entre experiências locais autênticas e restaurantes típicos da região.`;

// ─── Service ───────────────────────────────────────────────────────────────────

@Injectable()
export class PropostaAiService {
  private readonly logger = new Logger(PropostaAiService.name);

  constructor(private readonly aiService: AiService) {}

  async gerarMensagemBreveStream(dto: MensagemBreveDto, res: Response): Promise<void> {
    const prompt = this.buildMensagemBrevePrompt(dto);
    await this.aiService.generateStream(prompt, res);
  }

  async gerarMensagemBreve(dto: MensagemBreveDto): Promise<{ text: string }> {
    const { reply } = await this.aiService.generate(this.buildMensagemBrevePrompt(dto));
    return { text: sanitizeText(reply) };
  }

  private buildMensagemBrevePrompt(dto: MensagemBreveDto): string {
    const lines: string[] = [
      'Escreva uma "Mensagem breve" personalizada para uma proposta de viagem premium.',
      'Tom: acolhedor, profissional e entusiasmado. Extensão: 2 a 4 frases. Responda APENAS com o texto, sem aspas, sem prefixo.',
      'NÃO inclua URLs, links nem domínios (ex: site.com). Apenas texto.',
      '',
    ];
    if (dto.propostaTitle) lines.push(`Destino / proposta: ${dto.propostaTitle}`);
    if (dto.startDate && dto.endDate) lines.push(`Período: ${dto.startDate} a ${dto.endDate}`);
    if (dto.totalNights) lines.push(`Total de noites: ${dto.totalNights}`);
    if (dto.passengerName) lines.push(`Passageiro: ${dto.passengerName}`);
    return lines.join('\n');
  }

  async sugerirBloco(dto: SugerirBlocoDto): Promise<{ blockData: AiBlockData }> {
    const systemPrompt = BLOCK_SYSTEM_PROMPTS[dto.blockType] ?? BLOCK_SYSTEM_PROMPTS['experiencia'];
    const fullPrompt = `${systemPrompt}\n\n---\n\n${this.buildContextLines(dto, 'Data do bloco').join('\n')}`;

    const { reply } = BLOCK_TYPES_WITH_WEB_SEARCH.has(dto.blockType)
      ? await this.aiService.generateWithWebSearch(fullPrompt)
      : await this.aiService.generate(fullPrompt);
    const blockData = this.parseJson<AiBlockData>(reply, {});
    return { blockData: sanitizeAiOutput(blockData) };
  }

  async sugerirAtividadesDia(dto: SugerirAtividadesDiaDto): Promise<{ suggestions: AiBlockSuggestion[] }> {
    const fullPrompt = `${DAY_ACTIVITIES_SYSTEM}\n\n---\n\n${this.buildContextLines(dto, 'Data do dia').join('\n')}`;

    const { reply } = await this.aiService.generateWithWebSearch(fullPrompt);
    const parsed = this.parseJson<{ suggestions: AiBlockSuggestion[] }>(reply, { suggestions: [] });
    return { suggestions: sanitizeAiOutput(parsed.suggestions ?? []) };
  }

  private buildContextLines(dto: SugerirBlocoDto | SugerirAtividadesDiaDto, dateLabel: string): string[] {
    const lines: string[] = [];
    if (dto.propostaTitle)  lines.push(`Proposta / destino: ${dto.propostaTitle}`);
    if (dto.hint)           lines.push(`Instrução adicional: ${dto.hint}`);
    if (dto.date)           lines.push(`${dateLabel}: ${dto.date}`);
    if (dto.passengers)     lines.push(`Passageiros: ${dto.passengers}`);
    if (dto.endDate)        lines.push(`Período da viagem: ${dto.date ?? ''} a ${dto.endDate}`);
    if (dto.totalNights)    lines.push(`Total de noites da viagem: ${dto.totalNights}`);
    if (dto.contextSummary) lines.push(`Itinerário atual:\n${dto.contextSummary}`);
    return lines;
  }

  private parseJson<T>(reply: string, fallback: T): T {
    const cleaned = reply
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```\s*$/i, '')
      .trim();
    try {
      return JSON.parse(cleaned) as T;
    } catch {
      this.logger.warn('Não foi possível parsear JSON da IA, usando fallback');
      return fallback;
    }
  }
}
