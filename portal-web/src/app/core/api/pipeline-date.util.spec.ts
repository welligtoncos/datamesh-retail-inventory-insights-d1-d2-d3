import { defaultPipelineDt, isValidPipelineDt, normalizePipelineDt } from './pipeline-date.util';

describe('pipeline-date.util', () => {
  it('normalizes valid ISO date', () => {
    expect(normalizePipelineDt('  2022-01-02  ')).toBe('2022-01-02');
  });

  it('rejects invalid format', () => {
    expect(() => normalizePipelineDt('02-01-2022')).toThrow();
  });

  it('validates ISO dates', () => {
    expect(isValidPipelineDt('2022-01-01')).toBe(true);
    expect(isValidPipelineDt('invalid')).toBe(false);
  });

  it('defaultPipelineDt prefers query when in partitions', () => {
    const parts = ['2022-01-02', '2022-01-01'];
    expect(defaultPipelineDt(parts, '2022-01-01')).toBe('2022-01-01');
  });

  it('property: normalized date matches YYYY-MM-DD pattern', () => {
    const samples = ['2022-01-01', '2022-12-31'];
    for (const sample of samples) {
      expect(normalizePipelineDt(sample)).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});
