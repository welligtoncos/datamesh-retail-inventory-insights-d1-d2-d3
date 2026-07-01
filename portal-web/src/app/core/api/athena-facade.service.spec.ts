import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { AthenaFacadeService } from './athena-facade.service';
import { MOCK_ENRIQ_DT_A } from './data/enriquecido-mock.data';
import { environment } from '../../../environments/environment';

describe('AthenaFacadeService', () => {
  let service: AthenaFacadeService;
  let http: HttpTestingController;
  const base = environment.apiBaseUrl.replace(/\/$/, '');

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(AthenaFacadeService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('returns api data when POST succeeds', () => {
    service.runTemplate('partition_sanity', { dt: MOCK_ENRIQ_DT_A }).subscribe((result) => {
      expect(result.data_source).toBe('api');
      expect(result.response.status).toBe('SUCCEEDED');
    });

    const req = http.expectOne(`${base}/athena/query-template`);
    expect(req.request.body).toEqual({
      template_id: 'partition_sanity',
      params: { dt: MOCK_ENRIQ_DT_A },
    });
    req.flush({
      query_execution_id: 'q-1',
      template_id: 'partition_sanity',
      status: 'SUCCEEDED',
      columns: ['dt'],
      rows: [{ dt: MOCK_ENRIQ_DT_A }],
      row_count: 1,
      truncated: false,
    });
  });

  it('falls back to mock partition_sanity on 404', () => {
    service.runTemplate('partition_sanity', { dt: MOCK_ENRIQ_DT_A }).subscribe((result) => {
      expect(result.data_source).toBe('mock');
      expect(result.response.status).toBe('SUCCEEDED');
      const row = result.response.rows[0];
      expect(row['linhas']).toBe(100);
      expect(row['receita_total']).toBe(879026.03);
    });

    http.expectOne(`${base}/athena/query-template`).flush('not found', {
      status: 404,
      statusText: 'Not Found',
    });
  });

  it('mock d1_totals matches expected totals', () => {
    service.runTemplate('d1_totals', { dt: MOCK_ENRIQ_DT_A }).subscribe((result) => {
      expect(result.data_source).toBe('mock');
      const row = result.response.rows[0];
      expect(row['total_unidades']).toBe(14484);
      expect(row['total_receita']).toBe(879026.03);
    });

    http.expectOne(`${base}/athena/query-template`).flush('x', {
      status: 404,
      statusText: 'Not Found',
    });
  });

  it('rejects unknown template_id', () => {
    let error: string | undefined;
    service.runTemplate('free_sql', { dt: MOCK_ENRIQ_DT_A }).subscribe({
      error: (err: Error) => {
        error = err.message;
      },
    });
    expect(error).toContain('não encontrado');
    http.expectNone(`${base}/athena/query-template`);
  });
});
