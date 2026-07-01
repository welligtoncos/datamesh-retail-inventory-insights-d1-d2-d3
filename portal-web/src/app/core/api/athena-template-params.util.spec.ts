import { getAthenaTemplateById, listAthenaTemplates } from './athena-templates.catalog';
import {
  ATHENA_MAX_DTS,
  ATHENA_MAX_ROWS,
  ATHENA_MIN_DTS,
  normalizeAthenaDts,
  validateAthenaParams,
  validateAthenaTemplateRequest,
} from './athena-template-params.util';

describe('athena-template-params.util', () => {
  it('lists 9 whitelist templates', () => {
    expect(listAthenaTemplates().length).toBe(9);
  });

  it('normalizeAthenaDts sorts asc and deduplicates', () => {
    expect(normalizeAthenaDts(['2022-01-02', '2022-01-01', '2022-01-02'])).toEqual([
      '2022-01-01',
      '2022-01-02',
    ]);
  });

  it('validateAthenaParams caps limit at 100', () => {
    const template = getAthenaTemplateById('d1_top_products')!;
    const result = validateAthenaParams(template, { dt: '2022-01-01', limit: 500 });
    expect(result.valid).toBe(true);
    expect(result.normalized.limit).toBe(ATHENA_MAX_ROWS);
  });

  it('validateAthenaParams rejects single dt for multi-dt template', () => {
    const template = getAthenaTemplateById('multi_dt_coverage')!;
    const result = validateAthenaParams(template, { dts: ['2022-01-01'] });
    expect(result.valid).toBe(false);
  });

  it('validateAthenaParams accepts 2 dts for d3_weekend_trend', () => {
    const template = getAthenaTemplateById('d3_weekend_trend')!;
    const result = validateAthenaParams(template, {
      dts: ['2022-01-02', '2022-01-01'],
    });
    expect(result.valid).toBe(true);
    expect(result.normalized.dts?.length).toBe(2);
  });

  it('validateAthenaTemplateRequest rejects unknown template', () => {
    const result = validateAthenaTemplateRequest('sql_injection', { dt: '2022-01-01' });
    expect(result.valid).toBe(false);
  });

  it('property: normalizeAthenaDts length <= input length', () => {
    const input = ['2022-01-01', '2022-01-01', '2022-01-02'];
    const out = normalizeAthenaDts(input);
    expect(out.length).toBeLessThanOrEqual(input.length);
    expect(out.length).toBeGreaterThanOrEqual(ATHENA_MIN_DTS - 1);
    expect(out.length).toBeLessThanOrEqual(ATHENA_MAX_DTS);
  });
});
