import { buildMockEnriquecidoKpis, MOCK_ENRIQ_DT_A, MOCK_ENRIQ_DT_B } from './data/enriquecido-mock.data';
import { buildKpiCompareRows } from './enriquecido-compare.util';

describe('enriquecido-compare.util', () => {
  it('computes delta as value B minus value A', () => {
    const kpisA = buildMockEnriquecidoKpis(MOCK_ENRIQ_DT_A);
    const kpisB = buildMockEnriquecidoKpis(MOCK_ENRIQ_DT_B);
    const rows = buildKpiCompareRows(kpisA, kpisB);
    const revenue = rows.find((r) => r.label === 'Receita total');
    expect(revenue).toBeDefined();
    expect(revenue!.delta).toBe(
      Number((kpisB.revenue_total - kpisA.revenue_total).toFixed(2)),
    );
  });
});
