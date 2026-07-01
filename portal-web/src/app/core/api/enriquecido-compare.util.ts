import { EnriquecidoCompareRow, EnriquecidoKpis } from './models/enriquecido.model';

interface MetricDef {
  label: string;
  pick: (k: EnriquecidoKpis) => number;
  deltaPct: boolean;
}

const METRICS: MetricDef[] = [
  { label: 'Receita total', pick: (k) => k.revenue_total, deltaPct: true },
  { label: 'Rupturas', pick: (k) => k.stockout_count ?? 0, deltaPct: false },
  { label: 'Venda perdida', pick: (k) => k.lost_total ?? 0, deltaPct: true },
  { label: 'Linhas', pick: (k) => k.row_count, deltaPct: false },
  { label: '% ruptura', pick: (k) => k.stockout_pct, deltaPct: false },
];

export function buildKpiCompareRows(
  kpisA: EnriquecidoKpis,
  kpisB: EnriquecidoKpis,
): EnriquecidoCompareRow[] {
  return METRICS.map((metric) => {
    const value_a = metric.pick(kpisA);
    const value_b = metric.pick(kpisB);
    const delta = Number((value_b - value_a).toFixed(2));
    const delta_pct =
      metric.deltaPct && value_a !== 0
        ? Number((((value_b - value_a) / value_a) * 100).toFixed(1))
        : null;
    return { label: metric.label, value_a, value_b, delta, delta_pct };
  });
}
