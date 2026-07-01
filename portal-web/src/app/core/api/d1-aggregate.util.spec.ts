import {
  aggregateD1FromEnriquecidoRows,
  buildD1InsightText,
  EnriquecidoRowInput,
  mapEnriquecidoRowToInput,
} from './d1-aggregate.util';
import { getMockEnriquecidoRows, MOCK_ENRIQ_DT_A } from './data/enriquecido-mock.data';

describe('d1-aggregate.util', () => {
  it('aggregates mock enriquecido rows with product grain', () => {
    const rows = getMockEnriquecidoRows(MOCK_ENRIQ_DT_A).map(mapEnriquecidoRowToInput);
    const result = aggregateD1FromEnriquecidoRows(rows, MOCK_ENRIQ_DT_A, true);

    expect(result.partition_exists).toBe(true);
    expect(result.ranking.length).toBeGreaterThan(0);
    expect(result.total_unidades).toBe(
      result.ranking.reduce((sum, row) => sum + row.unidades, 0),
    );
  });

  it('sorts ranking by unidades descending', () => {
    const rows = getMockEnriquecidoRows(MOCK_ENRIQ_DT_A).map(mapEnriquecidoRowToInput);
    const result = aggregateD1FromEnriquecidoRows(rows, MOCK_ENRIQ_DT_A, true);

    for (let i = 1; i < result.ranking.length; i += 1) {
      expect(result.ranking[i - 1].unidades).toBeGreaterThanOrEqual(result.ranking[i].unidades);
    }
  });

  it('computes top3 concentration in valid range', () => {
    const rows = getMockEnriquecidoRows(MOCK_ENRIQ_DT_A).map(mapEnriquecidoRowToInput);
    const result = aggregateD1FromEnriquecidoRows(rows, MOCK_ENRIQ_DT_A, true);

    expect(result.top3_concentration_pct).toBeGreaterThanOrEqual(0);
    expect(result.top3_concentration_pct).toBeLessThanOrEqual(100);

    const expected =
      (result.ranking.slice(0, 3).reduce((sum, row) => sum + row.unidades, 0) /
        result.total_unidades) *
      100;
    expect(result.top3_concentration_pct).toBeCloseTo(expected, 5);
  });

  it('builds insight text with leader and top3 percent', () => {
    const rows = getMockEnriquecidoRows(MOCK_ENRIQ_DT_A).map(mapEnriquecidoRowToInput);
    const result = aggregateD1FromEnriquecidoRows(rows, MOCK_ENRIQ_DT_A, true);

    expect(result.insight_text).toContain(MOCK_ENRIQ_DT_A);
    expect(result.insight_text).toContain(result.leader.product_id);
    expect(result.insight_text).toContain(`${Math.round(result.top3_concentration_pct)}%`);
  });

  it('property: sum of ranking unidades equals total for synthetic rows', () => {
    const synthetic: EnriquecidoRowInput[] = [
      { productId: 'P001', category: 'A', unitsSold: 10, revenue: 100 },
      { productId: 'P001', category: 'A', unitsSold: 5, revenue: 50 },
      { productId: 'P002', category: 'B', unitsSold: 3, revenue: 30 },
    ];
    const result = aggregateD1FromEnriquecidoRows(synthetic, '2022-01-01', true);
    expect(result.total_unidades).toBe(18);
    expect(result.ranking.length).toBe(2);
  });

  it('returns empty sales message when no rows', () => {
    const text = buildD1InsightText('2022-01-01', {
      product_id: '',
      category: '',
      unidades: 0,
      receita: 0,
    }, 0, 0);
    expect(text).toContain('Não há vendas');
  });
});
