import {
  buildPartitionList,
  firstAvailableDt,
  normalizeDt,
  sortPartitionsDesc,
} from './origem-partition.util';

describe('origem-partition.util', () => {
  it('normalizes dt to YYYY-MM-DD', () => {
    expect(normalizeDt(' 2022-01-01T00:00:00Z ')).toBe('2022-01-01');
  });

  it('sorts partitions descending', () => {
    expect(sortPartitionsDesc(['2022-01-01', '2022-03-01', '2022-02-01'])).toEqual([
      '2022-03-01',
      '2022-02-01',
      '2022-01-01',
    ]);
  });

  it('builds available and missing partitions', () => {
    const list = buildPartitionList(['2022-01-01'], ['2022-01-02']);
    expect(list).toEqual([
      { dt: '2022-01-01', status: 'available' },
      { dt: '2022-01-02', status: 'missing' },
    ]);
  });

  it('returns first available dt', () => {
    const list = buildPartitionList(['2022-01-01'], ['2022-01-02']);
    expect(firstAvailableDt(list)).toBe('2022-01-01');
  });
});
