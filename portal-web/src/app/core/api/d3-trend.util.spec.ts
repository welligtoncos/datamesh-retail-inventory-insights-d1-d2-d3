import {
  computeTrendsFromEnrichedRows,
  DEFAULT_D3_WINDOW,
  insightDateRange,
} from './d3-trend.util';
import { buildMockInsightsD3 } from './data/insights-d3-mock.data';
import { MOCK_ENRIQ_DT_B, MOCK_ENRIQ_DT_A } from './data/enriquecido-mock.data';

describe('d3-trend.util', () => {
  it('builds date range of N days ending at dt', () => {
    const range = insightDateRange('2022-01-07', 7);
    expect(range.length).toBe(7);
    expect(range[0]).toBe('2022-01-01');
    expect(range[6]).toBe('2022-01-07');
  });

  it('classifies trends from mock enriquecido window', () => {
    const result = buildMockInsightsD3(MOCK_ENRIQ_DT_B, DEFAULT_D3_WINDOW);
    expect(result.partition_exists).toBe(true);
    expect(result.rows.length).toBeGreaterThan(0);
    expect(result.subindo_count + result.caindo_count + result.estavel_count).toBe(
      result.rows.length,
    );
  });

  it('returns empty when partition missing', () => {
    const result = buildMockInsightsD3('2022-01-03', 7);
    expect(result.partition_exists).toBe(false);
    expect(result.rows.length).toBe(0);
  });

  it('property: trend counts sum to row count for synthetic data', () => {
    const synthetic = [
      {
        'Store ID': 'S1',
        'Product ID': 'P1',
        Category: 'A',
        'Units Sold': 10,
        _is_weekend: 0,
        dt: MOCK_ENRIQ_DT_A,
      },
      {
        'Store ID': 'S1',
        'Product ID': 'P1',
        Category: 'A',
        'Units Sold': 20,
        _is_weekend: 1,
        dt: MOCK_ENRIQ_DT_B,
      },
    ];
    const result = computeTrendsFromEnrichedRows(synthetic, MOCK_ENRIQ_DT_B, 7, true);
    expect(result.subindo_count + result.caindo_count + result.estavel_count).toBe(
      result.rows.length,
    );
  });

  it('sorts rows by absolute trend_pct descending', () => {
    const result = buildMockInsightsD3(MOCK_ENRIQ_DT_B, 3);
    for (let i = 1; i < result.rows.length; i += 1) {
      expect(Math.abs(result.rows[i - 1].trend_pct)).toBeGreaterThanOrEqual(
        Math.abs(result.rows[i].trend_pct),
      );
    }
  });
});
