import * as mongoose from 'mongoose';
import * as path from 'path';
import * as dotenv from 'dotenv';

// ─── Env ──────────────────────────────────────────────────────────────────────

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('❌  MONGODB_URI não encontrado em .env');
  process.exit(1);
}

// ─── Minimal schemas ──────────────────────────────────────────────────────────

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
  name: 'Briefing de Viagem — Particular',
  description: 'Template simplificado para capturar os dados essenciais de uma viagem particular.',
  isGlobal: true,
  isActive: true,
  sections: [
    // ── 1. Sobre a viagem ──────────────────────────────────────────────────
    {
      id: 'sec_sobre_viagem',
      title: 'Sobre a viagem',
      description: 'Conte-nos o essencial: destino, datas e duração.',
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
            { value: 'casal',       label: 'Casal / Lua de mel' },
            { value: 'familia',     label: 'Família com crianças' },
            { value: 'amigos',      label: 'Grupo de amigos' },
            { value: 'solo',        label: 'Solo' },
            { value: 'corporativo', label: 'Corporativo / Negócios' },
          ],
        },
      ],
    },

    // ── 3. Preferências essenciais ─────────────────────────────────────────
    {
      id: 'sec_preferencias',
      title: 'Preferências essenciais',
      description: 'Nos ajude a calibrar as melhores opções para você.',
      fields: [
        {
          id: 'fld_faixa_orcamento',
          label: 'Qual é a faixa de orçamento total para a viagem?',
          type: 'select',
          required: true,
          options: [
            { value: 'ate_5k',     label: 'Até R$ 5.000 por pessoa' },
            { value: '5k_10k',     label: 'R$ 5.000 a R$ 10.000 por pessoa' },
            { value: '10k_20k',    label: 'R$ 10.000 a R$ 20.000 por pessoa' },
            { value: '20k_40k',    label: 'R$ 20.000 a R$ 40.000 por pessoa' },
            { value: 'acima_40k',  label: 'Acima de R$ 40.000 por pessoa' },
            { value: 'sem_limite', label: 'Prefiro não limitar — quero a melhor experiência' },
          ],
        },
        {
          id: 'fld_inclui_aereo',
          label: 'Deseja incluir voos na proposta?',
          type: 'radio',
          required: true,
          options: [
            { value: 'sim',      label: 'Sim, incluir voos' },
            { value: 'nao',      label: 'Não, já tenho os voos' },
            { value: 'verificar', label: 'Verificar — quero ver as opções' },
          ],
        },
        {
          id: 'fld_categoria_hotel',
          label: 'Categoria de hospedagem desejada',
          type: 'select',
          required: true,
          options: [
            { value: '3',        label: '⭐⭐⭐ — Confortável e bem localizado' },
            { value: '4',        label: '⭐⭐⭐⭐ — Superior com boas amenidades' },
            { value: '5',        label: '⭐⭐⭐⭐⭐ — Luxo e serviço premium' },
            { value: 'boutique', label: 'Boutique / Design — charme e exclusividade' },
            { value: 'resort',   label: 'Resort all-inclusive' },
          ],
        },
        {
          id: 'fld_estilo_viagem',
          label: 'Como você definiria seu estilo de viagem?',
          type: 'checkbox-group',
          required: false,
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
      ],
    },

    // ── 4. Observações ─────────────────────────────────────────────────────
    {
      id: 'sec_observacoes',
      title: 'Observações',
      description: 'Qualquer detalhe adicional que julgue importante compartilhar.',
      fields: [
        {
          id: 'fld_ocasiao_especial',
          label: 'A viagem coincide com alguma ocasião especial?',
          type: 'checkbox-group',
          required: false,
          options: [
            { value: 'aniversario',   label: 'Aniversário' },
            { value: 'lua_de_mel',    label: 'Lua de mel / Pedido de casamento' },
            { value: 'bodas',         label: 'Bodas (prata, ouro, etc.)' },
            { value: 'formatura',     label: 'Formatura' },
            { value: 'aposentadoria', label: 'Aposentadoria' },
            { value: 'nenhuma',       label: 'Nenhuma ocasião especial' },
          ],
        },
        {
          id: 'fld_observacoes',
          label: 'Alguma observação ou pedido especial?',
          type: 'textarea',
          required: false,
          placeholder: 'Este é o seu espaço livre — conte o que quiser!',
        },
      ],
    },
  ],
};

// ─── Main ─────────────────────────────────────────────────────────────────────

async function seed() {
  await mongoose.connect(MONGODB_URI!);
  console.log('✅  MongoDB conectado\n');

  const BriefingTemplateModel = mongoose.model('BriefingTemplate', BriefingTemplateSchema);

  const existing = await BriefingTemplateModel.findOne({
    name: TEMPLATE.name,
    isGlobal: true,
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
      agencyId: null,
    });
    console.log(`📋  Template criado: ${created._id}`);
  }

  const totalFields = TEMPLATE.sections.reduce((acc, s) => acc + s.fields.length, 0);
  console.log(`\n📊  Resumo do template:`);
  console.log(`    Nome      : ${TEMPLATE.name}`);
  console.log(`    Global    : ${TEMPLATE.isGlobal}`);
  console.log(`    Seções    : ${TEMPLATE.sections.length}`);
  console.log(`    Campos    : ${totalFields}`);
  TEMPLATE.sections.forEach((s, i) => {
    console.log(`    ${i + 1}. ${s.title.padEnd(35)} — ${s.fields.length} campo(s)`);
  });

  console.log('\n✅  Seed de briefing template particular concluído!\n');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('❌  Erro no seed:', err);
  process.exit(1);
});
