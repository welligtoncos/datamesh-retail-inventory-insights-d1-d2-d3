import { sortInsumosByLastModifiedDesc } from './insumos-sort.util';
import { InsumoItem } from './models/insumo.model';

describe('sortInsumosByLastModifiedDesc', () => {
  const items: InsumoItem[] = [
    {
      key: 'insumo/a.csv',
      name: 'a.csv',
      size_bytes: 100,
      last_modified: '2022-01-01T00:00:00Z',
    },
    {
      key: 'insumo/b.csv',
      name: 'b.csv',
      size_bytes: 200,
      last_modified: '2022-06-15T00:00:00Z',
    },
  ];

  it('orders by last_modified descending', () => {
    const sorted = sortInsumosByLastModifiedDesc(items);
    expect(sorted[0].name).toBe('b.csv');
    expect(new Date(sorted[0].last_modified).getTime()).toBeGreaterThanOrEqual(
      new Date(sorted[1].last_modified).getTime(),
    );
  });
});
