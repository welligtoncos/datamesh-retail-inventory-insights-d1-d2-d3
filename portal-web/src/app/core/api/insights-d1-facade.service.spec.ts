import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { MOCK_ENRIQ_DT_A } from './data/enriquecido-mock.data';
import { InsightsD1FacadeService } from './insights-d1-facade.service';
import { environment } from '../../../environments/environment';

describe('InsightsD1FacadeService', () => {
  let service: InsightsD1FacadeService;
  let http: HttpTestingController;
  const base = environment.apiBaseUrl.replace(/\/$/, '');

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(InsightsD1FacadeService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('falls back to mock insight when API returns 404', () => {
    service.loadInsight(MOCK_ENRIQ_DT_A).subscribe((result) => {
      expect(result.data_source).toBe('mock');
      expect(result.insight.partition_exists).toBe(true);
      expect(result.insight.ranking.length).toBeGreaterThan(0);
      expect(result.insight.insight_text).toContain('produto líder');
    });

    const req = http.expectOne(
      (r) => r.url === `${base}/insights/d1` && r.params.get('dt') === MOCK_ENRIQ_DT_A,
    );
    req.flush('not found', { status: 404, statusText: 'Not Found' });
  });

  it('marks partition missing for unknown mock dt', () => {
    service.loadInsight('2022-01-03').subscribe((result) => {
      expect(result.data_source).toBe('mock');
      expect(result.insight.partition_exists).toBe(false);
    });

    const req = http.expectOne(
      (r) => r.url === `${base}/insights/d1` && r.params.get('dt') === '2022-01-03',
    );
    req.flush('not found', { status: 404, statusText: 'Not Found' });
  });

  it('falls back to mock download metadata on 404', () => {
    service.getDownload(MOCK_ENRIQ_DT_A).subscribe((result) => {
      expect(result.data_source).toBe('mock');
      expect(result.download.s3_key).toContain('relatorios/D1/');
      expect(result.download.filename).toContain('relatorio_D1_exec');
      expect(result.download.presigned_url).toBe('');
    });

    const req = http.expectOne(
      (r) =>
        r.url === `${base}/insights/d1/download` && r.params.get('dt') === MOCK_ENRIQ_DT_A,
    );
    req.flush('not found', { status: 404, statusText: 'Not Found' });
  });
});
