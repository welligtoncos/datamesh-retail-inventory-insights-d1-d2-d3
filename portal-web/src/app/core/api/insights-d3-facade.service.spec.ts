import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { MOCK_ENRIQ_DT_B } from './data/enriquecido-mock.data';
import { DEFAULT_D3_WINDOW } from './d3-trend.util';
import { InsightsD3FacadeService } from './insights-d3-facade.service';
import { environment } from '../../../environments/environment';

describe('InsightsD3FacadeService', () => {
  let service: InsightsD3FacadeService;
  let http: HttpTestingController;
  const base = environment.apiBaseUrl.replace(/\/$/, '');

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(InsightsD3FacadeService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('falls back to mock trend insight on 404', () => {
    service.loadInsight(MOCK_ENRIQ_DT_B, DEFAULT_D3_WINDOW).subscribe((result) => {
      expect(result.data_source).toBe('mock');
      expect(result.insight.partition_exists).toBe(true);
      expect(result.insight.window_days).toBe(DEFAULT_D3_WINDOW);
      expect(result.insight.rows.length).toBeGreaterThan(0);
    });

    const req = http.expectOne(
      (r) =>
        r.url === `${base}/insights/d3` &&
        r.params.get('dt') === MOCK_ENRIQ_DT_B &&
        r.params.get('window') === String(DEFAULT_D3_WINDOW),
    );
    req.flush('not found', { status: 404, statusText: 'Not Found' });
  });

  it('falls back to mock download metadata on 404', () => {
    service.getDownload(MOCK_ENRIQ_DT_B, 7).subscribe((result) => {
      expect(result.data_source).toBe('mock');
      expect(result.download.s3_key).toContain('relatorios/D3/');
      expect(result.download.filename).toContain('relatorio_D3_exec');
    });

    const req = http.expectOne(
      (r) =>
        r.url === `${base}/insights/d3/download` &&
        r.params.get('dt') === MOCK_ENRIQ_DT_B &&
        r.params.get('window') === '7',
    );
    req.flush('not found', { status: 404, statusText: 'Not Found' });
  });
});
