import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { DashboardService } from './dashboard.service';
import { environment } from '../../../environments/environment';

describe('DashboardService', () => {
  let service: DashboardService;
  let http: HttpTestingController;
  const base = environment.apiBaseUrl.replace(/\/$/, '');

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(DashboardService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('falls back to mock when partitions returns 404', () => {
    service.loadSummary().subscribe((summary) => {
      expect(summary.data_source).toBe('mock');
      expect(summary.ultimo_dt).toBe('2022-01-01');
      expect(summary.kpis?.revenue_total).toBe(879_026.03);
    });

    const health = http.expectOne(`${base}/health`);
    health.flush('ok', { status: 200, statusText: 'OK' });

    const partitions = http.expectOne(`${base}/enriquecido/partitions`);
    partitions.flush('not found', { status: 404, statusText: 'Not Found' });
  });

  it('uses api data when partitions and kpis succeed', () => {
    service.loadSummary().subscribe((summary) => {
      expect(summary.data_source).toBe('api');
      expect(summary.ultimo_dt).toBe('2022-01-02');
      expect(summary.kpis?.row_count).toBe(50);
    });

    http.expectOne(`${base}/health`).flush('ok', { status: 200, statusText: 'OK' });
    http
      .expectOne(`${base}/enriquecido/partitions`)
      .flush({ partitions: ['2022-01-01', '2022-01-02'], latest: '2022-01-02' });
    http.expectOne(`${base}/enriquecido/2022-01-02/kpis`).flush({
      dt: '2022-01-02',
      row_count: 50,
      revenue_total: 100,
      stockout_pct: 1.5,
      products_stockout: 2,
      stores_count: 5,
    });
  });
});
