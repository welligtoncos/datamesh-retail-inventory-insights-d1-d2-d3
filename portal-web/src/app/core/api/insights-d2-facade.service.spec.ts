import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { MOCK_ENRIQ_DT_A, MOCK_ENRIQ_DT_B } from './data/enriquecido-mock.data';
import { InsightsD2FacadeService } from './insights-d2-facade.service';
import { environment } from '../../../environments/environment';

describe('InsightsD2FacadeService', () => {
  let service: InsightsD2FacadeService;
  let http: HttpTestingController;
  const base = environment.apiBaseUrl.replace(/\/$/, '');

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(InsightsD2FacadeService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('falls back to mock with zero rupturas on dt A', () => {
    service.loadInsight(MOCK_ENRIQ_DT_A).subscribe((result) => {
      expect(result.data_source).toBe('mock');
      expect(result.insight.partition_exists).toBe(true);
      expect(result.insight.rupturas_count).toBe(0);
    });

    const req = http.expectOne(
      (r) => r.url === `${base}/insights/d2` && r.params.get('dt') === MOCK_ENRIQ_DT_A,
    );
    req.flush('not found', { status: 404, statusText: 'Not Found' });
  });

  it('falls back to mock with rupturas on dt B', () => {
    service.loadInsight(MOCK_ENRIQ_DT_B).subscribe((result) => {
      expect(result.data_source).toBe('mock');
      expect(result.insight.rupturas_count).toBeGreaterThan(0);
    });

    const req = http.expectOne(
      (r) => r.url === `${base}/insights/d2` && r.params.get('dt') === MOCK_ENRIQ_DT_B,
    );
    req.flush('not found', { status: 404, statusText: 'Not Found' });
  });

  it('falls back to mock download metadata on 404', () => {
    service.getDownload(MOCK_ENRIQ_DT_B).subscribe((result) => {
      expect(result.data_source).toBe('mock');
      expect(result.download.s3_key).toContain('relatorios/D2/');
      expect(result.download.filename).toContain('relatorio_D2_exec');
    });

    const req = http.expectOne(
      (r) =>
        r.url === `${base}/insights/d2/download` && r.params.get('dt') === MOCK_ENRIQ_DT_B,
    );
    req.flush('not found', { status: 404, statusText: 'Not Found' });
  });
});
