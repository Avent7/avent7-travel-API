import * as mongoose from 'mongoose';
import * as path from 'path';
import * as dotenv from 'dotenv';

// ─── Env ──────────────────────────────────────────────────────────────────────

dotenv.config({ path: path.resolve(__dirname, '../../.env.developer') });

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('❌  MONGODB_URI não encontrado em .env.developer');
  process.exit(1);
}

// ─── Minimal schemas ──────────────────────────────────────────────────────────

const AgencySchema = new mongoose.Schema({ name: String, slug: String }, { timestamps: true });

const BriefingTemplateSchema = new mongoose.Schema(
  {
    agencyId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Agency', default: null },
    name:        { type: String, required: true },
    description: { type: String, default: null },
    isGlobal:    { type: Boolean, default: false },
    isActive:    { type: Boolean, default: true },
    sections:    { type: mongoose.Schema.Types.Mixed, default: [] },
  },
  { timestamps: true },
);

// ─── Template data ────────────────────────────────────────────────────────────

const TEMPLATE = {
  name: 'Briefing de Viagem — Completo',
  description: 'Template padrão para coletar todas as informações necessárias para criar uma proposta de viagem personalizada.',
  isGlobal: false,
  isActive: true,
  sections: [
    // ── 1. Sobre a viagem ──────────────────────────────────────────────────
    {
      id: 'sec_sobre_viagem',
      title: 'Sobre a viagem',
      description: 'Conte-nos o essencial: destino, datas e número de viajantes.',
      fields: [
        {
          id: 'fld_destinos',
          label: 'Quais destinos você tem em mente?',
          type: 'textarea',
          required: true,
          placeholder: 'Ex: Paris, Roma e Barcelona — mas estou aberto a sugestões!',
          hint: 'Pode listar mais de um destino ou mencionar uma região.',
        },
        {
          id: 'fld_data_partida',
          label: 'Data de partida (aproximada)',
          type: 'date',
          required: true,
        },
        {
          id: 'fld_data_retorno',
          label: 'Data de retorno (aproximada)',
          type: 'date',
          required: false,
          hint: 'Deixe em branco se ainda não souber.',
        },
        {
          id: 'fld_flexibilidade_datas',
          label: 'As datas são flexíveis?',
          type: 'radio',
          required: true,
          options: [
            { value: 'sim', label: 'Sim, tenho flexibilidade' },
            { value: 'pouca', label: 'Pouca flexibilidade (± 3 dias)' },
            { value: 'nao', label: 'Não, datas fixas' },
          ],
        },
        {
          id: 'fld_noites',
          label: 'Quantas noites aproximadamente?',
          type: 'number',
          required: false,
          placeholder: 'Ex: 10',
        },
      ],
    },

    // ── 2. Viajantes ───────────────────────────────────────────────────────
    {
      id: 'sec_viajantes',
      title: 'Viajantes',
      description: 'Quem vai embarcar nessa aventura?',
      fields: [
        {
          id: 'fld_adultos',
          label: 'Número de adultos',
          type: 'number',
          required: true,
          placeholder: '2',
        },
        {
          id: 'fld_criancas',
          label: 'Número de crianças',
          type: 'number',
          required: false,
          placeholder: '0',
          hint: 'Inclua crianças de 0 a 12 anos.',
        },
        {
          id: 'fld_tipo_viagem',
          label: 'Tipo de viagem',
          type: 'radio',
          required: true,
          options: [
            { value: 'casal', label: 'Casal / Lua de mel' },
            { value: 'familia', label: 'Família com crianças' },
            { value: 'amigos', label: 'Grupo de amigos' },
            { value: 'solo', label: 'Solo' },
            { value: 'corporativo', label: 'Corporativo / Negócios' },
          ],
        },
        {
          id: 'fld_necessidades_especiais',
          label: 'Algum viajante possui necessidades especiais ou restrições de mobilidade?',
          type: 'textarea',
          required: false,
          placeholder: 'Descreva brevemente para que possamos considerar na montagem do roteiro.',
        },
      ],
    },

    // ── 3. Orçamento ───────────────────────────────────────────────────────
    {
      id: 'sec_orcamento',
      title: 'Orçamento',
      description: 'Isso nos ajuda a calibrar as opções certas para você.',
      fields: [
        {
          id: 'fld_faixa_orcamento',
          label: 'Qual é a faixa de orçamento total para a viagem?',
          type: 'select',
          required: true,
          options: [
            { value: 'ate_5k',    label: 'Até R$ 5.000 por pessoa' },
            { value: '5k_10k',   label: 'R$ 5.000 a R$ 10.000 por pessoa' },
            { value: '10k_20k',  label: 'R$ 10.000 a R$ 20.000 por pessoa' },
            { value: '20k_40k',  label: 'R$ 20.000 a R$ 40.000 por pessoa' },
            { value: 'acima_40k', label: 'Acima de R$ 40.000 por pessoa' },
            { value: 'sem_limite', label: 'Prefiro não limitar — quero a melhor experiência' },
          ],
        },
        {
          id: 'fld_moeda_preferida',
          label: 'Prefere pagar em qual moeda?',
          type: 'radio',
          required: false,
          options: [
            { value: 'brl', label: 'Reais (BRL)' },
            { value: 'usd', label: 'Dólar (USD)' },
            { value: 'eur', label: 'Euro (EUR)' },
          ],
        },
        {
          id: 'fld_inclui_aereo',
          label: 'Deseja incluir voos na proposta?',
          type: 'radio',
          required: true,
          options: [
            { value: 'sim', label: 'Sim, incluir voos' },
            { value: 'nao', label: 'Não, já tenho os voos' },
            { value: 'verificar', label: 'Verificar — quero ver as opções' },
          ],
        },
      ],
    },

    // ── 4. Estilo e preferências ───────────────────────────────────────────
    {
      id: 'sec_estilo',
      title: 'Estilo e preferências',
      description: 'Quanto mais você nos contar, mais personalizado será o roteiro.',
      fields: [
        {
          id: 'fld_estilo_viagem',
          label: 'Como você definiria seu estilo de viagem?',
          type: 'checkbox-group',
          required: true,
          hint: 'Selecione todos que se aplicam.',
          options: [
            { value: 'luxo',        label: 'Luxo e requinte' },
            { value: 'cultura',     label: 'Cultura e história' },
            { value: 'gastronomia', label: 'Gastronomia e vinhos' },
            { value: 'aventura',    label: 'Aventura e natureza' },
            { value: 'relax',       label: 'Relaxamento e bem-estar' },
            { value: 'compras',     label: 'Compras e moda' },
            { value: 'praias',      label: 'Praias e sol' },
          ],
        },
        {
          id: 'fld_ritmo',
          label: 'Qual é o ritmo ideal de viagem?',
          type: 'radio',
          required: true,
          options: [
            { value: 'acelerado',  label: 'Intenso — quero ver o máximo possível' },
            { value: 'moderado',   label: 'Moderado — equilíbrio entre passeios e descanso' },
            { value: 'tranquilo',  label: 'Tranquilo — prefiro mergulhar fundo em poucos lugares' },
          ],
        },
        {
          id: 'fld_categoria_hotel',
          label: 'Categoria de hospedagem desejada',
          type: 'select',
          required: true,
          options: [
            { value: '3',         label: '⭐⭐⭐ — Confortável e bem localizado' },
            { value: '4',         label: '⭐⭐⭐⭐ — Superior com boas amenidades' },
            { value: '5',         label: '⭐⭐⭐⭐⭐ — Luxo e serviço premium' },
            { value: 'boutique',  label: 'Boutique / Design — charme e exclusividade' },
            { value: 'resort',    label: 'Resort all-inclusive' },
          ],
        },
        {
          id: 'fld_tipo_quarto',
          label: 'Tipo de quarto preferido',
          type: 'radio',
          required: false,
          options: [
            { value: 'standard',    label: 'Standard' },
            { value: 'superior',    label: 'Superior / Deluxe' },
            { value: 'suite',       label: 'Suíte' },
            { value: 'villa',       label: 'Villa / Apartamento privativo' },
          ],
        },
      ],
    },

    // ── 5. Refeições e alimentação ─────────────────────────────────────────
    {
      id: 'sec_alimentacao',
      title: 'Refeições e alimentação',
      description: 'Importante para montarmos os melhores restaurantes e o regime da hospedagem.',
      fields: [
        {
          id: 'fld_regime',
          label: 'Regime de refeições na hospedagem',
          type: 'radio',
          required: true,
          options: [
            { value: 'so_cafe',    label: 'Só café da manhã (B&B)' },
            { value: 'meia',       label: 'Meia pensão (café + jantar)' },
            { value: 'completa',   label: 'Pensão completa' },
            { value: 'all_inclusive', label: 'All inclusive' },
            { value: 'sem_refeicoes', label: 'Sem refeições inclusas' },
          ],
        },
        {
          id: 'fld_restricoes_alimentares',
          label: 'Alguma restrição alimentar ou preferência?',
          type: 'checkbox-group',
          required: false,
          options: [
            { value: 'vegetariano',  label: 'Vegetariano' },
            { value: 'vegano',       label: 'Vegano' },
            { value: 'sem_gluten',   label: 'Sem glúten' },
            { value: 'sem_lactose',  label: 'Sem lactose' },
            { value: 'halal',        label: 'Halal' },
            { value: 'kosher',       label: 'Kosher' },
            { value: 'nenhuma',      label: 'Nenhuma restrição' },
          ],
        },
        {
          id: 'fld_gastronomia_local',
          label: 'Tem interesse em experiências gastronômicas locais (restaurantes top, wine tasting, cooking class)?',
          type: 'radio',
          required: false,
          options: [
            { value: 'sim_prioridade', label: 'Sim, é prioridade!' },
            { value: 'sim_casual',     label: 'Sim, se encaixar no roteiro' },
            { value: 'nao',            label: 'Prefiro restaurantes convencionais' },
          ],
        },
      ],
    },

    // ── 6. Transporte e traslados ──────────────────────────────────────────
    {
      id: 'sec_transporte',
      title: 'Transporte e traslados',
      fields: [
        {
          id: 'fld_classe_voo',
          label: 'Classe preferida nos voos',
          type: 'radio',
          required: false,
          dependsOn: { field: 'fld_inclui_aereo', value: ['sim', 'verificar'] },
          options: [
            { value: 'economy',   label: 'Econômica' },
            { value: 'premium',   label: 'Econômica Premium' },
            { value: 'business',  label: 'Executiva (Business)' },
            { value: 'first',     label: 'Primeira classe' },
          ],
        },
        {
          id: 'fld_traslados',
          label: 'Deseja traslados privados (aeroporto ↔ hotel)?',
          type: 'radio',
          required: true,
          options: [
            { value: 'sim_todos',  label: 'Sim, todos os traslados privados' },
            { value: 'sim_alguns', label: 'Sim, apenas chegada e partida' },
            { value: 'nao',        label: 'Não é necessário' },
          ],
        },
        {
          id: 'fld_carro_locado',
          label: 'Quer carro locado no destino?',
          type: 'radio',
          required: false,
          options: [
            { value: 'sim',        label: 'Sim, quero carro locado' },
            { value: 'nao',        label: 'Não, prefiro translados / transfers' },
            { value: 'verificar',  label: 'Dependendo do roteiro' },
          ],
        },
      ],
    },

    // ── 7. Experiências e passeios ─────────────────────────────────────────
    {
      id: 'sec_experiencias',
      title: 'Experiências e passeios',
      description: 'Nos ajude a enriquecer o roteiro com o que realmente importa para você.',
      fields: [
        {
          id: 'fld_experiencias_desejadas',
          label: 'Que tipo de experiências você gostaria de incluir?',
          type: 'checkbox-group',
          required: false,
          options: [
            { value: 'museus',        label: 'Museus e galerias de arte' },
            { value: 'shows',         label: 'Shows, ópera ou teatro' },
            { value: 'passeios_barco', label: 'Passeios de barco ou iate' },
            { value: 'safaris',       label: 'Safáris ou ecoturismo' },
            { value: 'spa',           label: 'Spa e tratamentos de bem-estar' },
            { value: 'esportes',      label: 'Esportes radicais ou aventura' },
            { value: 'golf',          label: 'Golfe' },
            { value: 'compras_guiadas', label: 'Compras com personal shopper' },
            { value: 'vinhedos',      label: 'Visitas a vinhedos e vinícolas' },
          ],
        },
        {
          id: 'fld_guia_local',
          label: 'Quer guia local privativo em algum destino?',
          type: 'radio',
          required: false,
          options: [
            { value: 'sim_todos',  label: 'Sim, em todos os destinos' },
            { value: 'sim_alguns', label: 'Sim, em alguns destinos' },
            { value: 'nao',        label: 'Não é necessário' },
          ],
        },
        {
          id: 'fld_ja_visitou',
          label: 'Já visitou algum dos destinos mencionados?',
          type: 'textarea',
          required: false,
          placeholder: 'Nos conte o que já conhece para evitarmos repetições e focarmos no que é novo para você.',
        },
      ],
    },

    // ── 8. Informações finais ──────────────────────────────────────────────
    {
      id: 'sec_informacoes_finais',
      title: 'Informações finais',
      description: 'Qualquer detalhe adicional que julgue importante compartilhar.',
      fields: [
        {
          id: 'fld_ocasiao_especial',
          label: 'A viagem coincide com alguma ocasião especial?',
          type: 'checkbox-group',
          required: false,
          options: [
            { value: 'aniversario',  label: 'Aniversário' },
            { value: 'lua_de_mel',   label: 'Lua de mel / Pedido de casamento' },
            { value: 'bodas',        label: 'Bodas (prata, ouro, etc.)' },
            { value: 'formatura',    label: 'Formatura' },
            { value: 'aposentadoria', label: 'Aposentadoria' },
            { value: 'nenhuma',      label: 'Nenhuma ocasião especial' },
          ],
        },
        {
          id: 'fld_viagens_anteriores',
          label: 'Cite 2 ou 3 viagens que você já fez e adorou',
          type: 'textarea',
          required: false,
          placeholder: 'Ex: "Adorei a Toscana em 2019 — ritmo tranquilo, gastronomia incrível e hospedagem em fazenda." Isso nos ajuda a entender seu gosto.',
        },
        {
          id: 'fld_observacoes',
          label: 'Alguma observação ou pedido especial que não foi coberto acima?',
          type: 'textarea',
          required: false,
          placeholder: 'Este é o seu espaço livre — conte o que quiser!',
        },
        {
          id: 'fld_como_soube',
          label: 'Como você nos encontrou?',
          type: 'select',
          required: false,
          options: [
            { value: 'indicacao',   label: 'Indicação de amigo / familiar' },
            { value: 'instagram',   label: 'Instagram' },
            { value: 'google',      label: 'Google' },
            { value: 'linkedin',    label: 'LinkedIn' },
            { value: 'evento',      label: 'Evento ou feira de turismo' },
            { value: 'ja_cliente',  label: 'Já sou cliente' },
            { value: 'outro',       label: 'Outro' },
          ],
        },
      ],
    },
  ],
};

// ─── Main ─────────────────────────────────────────────────────────────────────

async function seed() {
  await mongoose.connect(MONGODB_URI!);
  console.log('✅  MongoDB conectado\n');

  const AgencyModel = mongoose.model('Agency', AgencySchema);
  const BriefingTemplateModel = mongoose.model('BriefingTemplate', BriefingTemplateSchema);

  // Busca a agência
  const agency = await AgencyModel.findOne({ slug: 'avent7-travel' });
  if (!agency) {
    console.error('❌  Agência "avent7-travel" não encontrada. Execute seed:admin primeiro.');
    await mongoose.disconnect();
    process.exit(1);
  }
  console.log(`🏢  Agência: ${agency.name} (${agency._id})\n`);

  // Verifica se já existe
  const existing = await BriefingTemplateModel.findOne({
    agencyId: agency._id,
    name: TEMPLATE.name,
  });

  if (existing) {
    console.log(`⚠️   Template "${TEMPLATE.name}" já existe — atualizando seções...`);
    await BriefingTemplateModel.findByIdAndUpdate(existing._id, {
      $set: {
        description: TEMPLATE.description,
        sections: TEMPLATE.sections,
        isActive: true,
      },
    });
    console.log(`✏️   Template atualizado: ${existing._id}`);
  } else {
    const created = await BriefingTemplateModel.create({
      ...TEMPLATE,
      agencyId: agency._id,
    });
    console.log(`📋  Template criado: ${created._id}`);
  }

  // Resumo
  const totalFields = TEMPLATE.sections.reduce((acc, s) => acc + s.fields.length, 0);
  console.log(`\n📊  Resumo do template:`);
  console.log(`    Nome      : ${TEMPLATE.name}`);
  console.log(`    Seções    : ${TEMPLATE.sections.length}`);
  console.log(`    Campos    : ${totalFields}`);
  TEMPLATE.sections.forEach((s, i) => {
    console.log(`    ${i + 1}. ${s.title.padEnd(35)} — ${s.fields.length} campo(s)`);
  });

  console.log('\n✅  Seed de briefing template concluído!\n');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('❌  Erro no seed:', err);
  process.exit(1);
});
