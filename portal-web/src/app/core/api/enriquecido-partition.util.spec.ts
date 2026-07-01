import {
  defaultComparePair,
  firstEnriquecidoDt,
  sortEnriquecidoPartitionsDesc,
} from './enriquecido-partition.util';

describe('enriquecido-partition.util', () => {
  it('sorts partitions descending', () => {
    expect(sortEnriquecidoPartitionsDesc(['2022-01-01', '2022-01-03', '2022-01-02'])).toEqual([
      '2022-01-03',
      '2022-01-02',
      '2022-01-01',
    ]);
  });

  it('returns default compare pair as penultimate and latest', () => {
    const pair = defaultComparePair(['2022-01-01', '2022-01-02', '2022-01-03']);
    expect(pair).toEqual({ dt_a: '2022-01-02', dt_b: '2022-01-03' });
  });

  it('returns null pair when fewer than two partitions', () => {
    expect(defaultComparePair(['2022-01-01'])).toEqual({ dt_a: null, dt_b: null });
    expect(firstEnriquecidoDt(['2022-01-01'])).toBe('2022-01-01');
  });
});
