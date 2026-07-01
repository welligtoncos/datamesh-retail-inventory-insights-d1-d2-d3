import {
  buildD2InsightText,
  filterRupturasFromRows,
  mapEnriquecidoRowToRupturaInput,
} from './d2-filter.util';
import {
  getMockEnriquecidoRows,
  MOCK_ENRIQ_DT_A,
  MOCK_ENRIQ_DT_B,
} from './data/enriquecido-mock.data';
import { buildMockInsightsD2 } from './data/insights-d2-mock.data';

describe('d2-filter.util', () => {
  it('filters rupturas where stockout=1 and lost>0', () => {
    const inputs = [
      {
        storeId: 'S1',
        productId: 'P1',
        category: 'A',
        inventoryLevel: 0,
        unitsSold: 5,
        demandForecast: 10,
        stockout: 1,
        lost: 3.5,
      },
      {
        storeId: 'S2',
        productId: 'P2',
        category: 'B',
        inventoryLevel: 10,
        unitsSold: 2,
        demandForecast: 5,
        stockout: 0,
        lost: 0,
      },
    ];

    const result = filterRupturasFromRows(inputs, '2022-01-02', true);
    expect(result.rupturas_count).toBe(1);
    expect(result.rows[0].product_id).toBe('P1');
    expect(result.total_lost).toBe(3.5);
  });

  it('sorts rupturas by lost descending', () => {
    const inputs = [
      {
        storeId: 'S1',
        productId: 'P1',
        category: 'A',
        inventoryLevel: 0,
        unitsSold: 1,
        demandForecast: 5,
        stockout: 1,
        lost: 1,
      },
      {
        storeId: 'S2',
        productId: 'P2',
        category: 'B',
        inventoryLevel: 0,
        unitsSold: 1,
        demandForecast: 5,
        stockout: 1,
        lost: 5,
      },
    ];

    const result = filterRupturasFromRows(inputs, '2022-01-02', true);
    expect(result.rows[0].lost).toBeGreaterThanOrEqual(result.rows[1].lost);
  });

  it('returns zero rupturas for mock dt without stockouts', () => {
    const result = buildMockInsightsD2(MOCK_ENRIQ_DT_A);
    expect(result.partition_exists).toBe(true);
    expect(result.rupturas_count).toBe(0);
    expect(result.insight_text).toContain('nenhuma ruptura');
  });

  it('returns rupturas for mock dt with stockouts', () => {
    const result = buildMockInsightsD2(MOCK_ENRIQ_DT_B);
    expect(result.partition_exists).toBe(true);
    expect(result.rupturas_count).toBeGreaterThan(0);
    expect(result.top_impact).not.toBeNull();
  });

  it('builds insight text with top impact', () => {
    const text = buildD2InsightText('2022-01-02', 2, 8.5, {
      store_id: 'S1',
      product_id: 'P9',
      lost: 5.2,
    });
    expect(text).toContain('2 rupturas');
    expect(text).toContain('S1');
    expect(text).toContain('P9');
  });

  it('property: total_lost equals sum of row lost values', () => {
    const rows = getMockEnriquecidoRows(MOCK_ENRIQ_DT_B).map(mapEnriquecidoRowToRupturaInput);
    const result = filterRupturasFromRows(rows, MOCK_ENRIQ_DT_B, true);
    const sum = result.rows.reduce((acc, row) => acc + row.lost, 0);
    expect(result.total_lost).toBeCloseTo(sum, 5);
  });
});
