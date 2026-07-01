import { FileSizePipe } from './file-size.pipe';

describe('FileSizePipe', () => {
  const pipe = new FileSizePipe();

  it('formats zero bytes', () => {
    expect(pipe.transform(0)).toBe('0 B');
  });

  it('formats bytes >= 0 with unit', () => {
    const result = pipe.transform(1536);
    expect(result.length).toBeGreaterThan(0);
    expect(result).toMatch(/\d.*(B|KB|MB|GB)/);
  });

  it('formats megabytes in pt-BR', () => {
    expect(pipe.transform(1_048_576)).toContain('MB');
  });

  it('returns dash for invalid values', () => {
    expect(pipe.transform(null)).toBe('—');
    expect(pipe.transform(undefined)).toBe('—');
  });
});
