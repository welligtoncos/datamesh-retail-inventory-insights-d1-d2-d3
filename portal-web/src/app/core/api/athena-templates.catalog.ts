import { AthenaTemplateDefinition } from './models/athena.model';

export const ATHENA_TEMPLATES: readonly AthenaTemplateDefinition[] = [
  {
    template_id: 'smoke_preview',
    title: 'Amostra enriquecido',
    description: 'Exibe 5 linhas com colunas derivadas (_revenue, _stockout, etc.).',
    category: 'smoke',
    params_schema: {
      dt: { required: true, label: 'Partição (dt)' },
    },
  },
  {
    template_id: 'partition_sanity',
    title: 'Sanidade da partição',
    description: 'Contagem de linhas, lojas, produtos, receita e % ruptura.',
    category: 'sanity',
    params_schema: {
      dt: { required: true, label: 'Partição (dt)' },
    },
  },
  {
    template_id: 'enriched_null_check',
    title: 'Colunas enriquecidas',
    description: 'Verifica nulos em _revenue, _stockout, _lost e _is_weekend.',
    category: 'sanity',
    params_schema: {
      dt: { required: true, label: 'Partição (dt)' },
    },
  },
  {
    template_id: 'd1_top_products',
    title: 'Top produtos (D-1)',
    description: 'Ranking por unidades vendidas e receita.',
    category: 'd1',
    params_schema: {
      dt: { required: true, label: 'Partição (dt)' },
      limit: { required: false, label: 'Limite', default: 10, max: 100 },
    },
  },
  {
    template_id: 'd1_totals',
    title: 'Totais comerciais (D-1)',
    description: 'Produtos distintos, unidades e receita total.',
    category: 'd1',
    params_schema: {
      dt: { required: true, label: 'Partição (dt)' },
    },
  },
  {
    template_id: 'd2_stockouts',
    title: 'Rupturas (D-2)',
    description: 'Linhas com _stockout = 1 e _lost > 0.',
    category: 'd2',
    params_schema: {
      dt: { required: true, label: 'Partição (dt)' },
    },
  },
  {
    template_id: 'd2_top_lost',
    title: 'Top venda perdida',
    description: 'Soma de _lost por loja e produto.',
    category: 'd2',
    params_schema: {
      dt: { required: true, label: 'Partição (dt)' },
      limit: { required: false, label: 'Limite', default: 10, max: 100 },
    },
  },
  {
    template_id: 'd3_weekend_trend',
    title: 'Tendência úteis vs FDS',
    description: 'Médias de unidades em dias úteis e fim de semana por loja×produto.',
    category: 'd3',
    params_schema: {
      dts: {
        required: true,
        label: 'Partições (dts)',
        min_items: 2,
        max_items: 7,
      },
    },
  },
  {
    template_id: 'multi_dt_coverage',
    title: 'Cobertura multi-dt',
    description: 'Linhas e receita por partição.',
    category: 'quality',
    params_schema: {
      dts: {
        required: true,
        label: 'Partições (dts)',
        min_items: 2,
        max_items: 7,
      },
    },
  },
] as const;

export function getAthenaTemplateById(templateId: string): AthenaTemplateDefinition | undefined {
  return ATHENA_TEMPLATES.find((t) => t.template_id === templateId);
}

export function listAthenaTemplates(): AthenaTemplateDefinition[] {
  return [...ATHENA_TEMPLATES];
}
