import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { MOCK_ENRIQ_DT_A, MOCK_ENRIQ_DT_B } from './data/enriquecido-mock.data';
import { EnriquecidoFacadeService } from './enriquecido-facade.service';
import { PREVIEW_PAGE_SIZE } from './origem-preview.util';
import { environment } from '../../../environments/environment';

describe('EnriquecidoFacadeService', () => {
  let service: EnriquecidoFacadeService;
  let http: HttpTestingController;
  const base = environment.apiBaseUrl.replace(/\/$/, '');

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(EnriquecidoFacadeService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('falls back to mock when partitions API returns 404', () => {
    service.loadPartitions().subscribe((result) => {
      expect(result.data_source).toBe('mock');
      expect(result.partitions).toContain(MOCK_ENRIQ_DT_A);
      expect(result.partitions).toContain(MOCK_ENRIQ_DT_B);
    });

    http.expectOne(`${base}/enriquecido/partitions`).flush('not found', {
      status: 404,
      statusText: 'Not Found',
    });
  });

  it('falls back to mock preview on 404 for mock dt', () => {
    service.loadPreview(MOCK_ENRIQ_DT_A, 2, PREVIEW_PAGE_SIZE).subscribe((result) => {
      expect(result.data_source).toBe('mock');
      expect(result.preview.page).toBe(2);
      expect(result.preview.rows.length).toBeLessThanOrEqual(PREVIEW_PAGE_SIZE);
      expect(result.preview.total_rows).toBeLessThanOrEqual(500);
      expect(result.preview.columns.length).toBe(20);
    });

    const req = http.expectOne(
      (r) =>
        r.url === `${base}/enriquecido/${MOCK_ENRIQ_DT_A}/preview` &&
        r.params.get('page') === '2',
    );
    req.flush('not found', { status: 404, statusText: 'Not Found' });
  });

  it('loads compare deltas from mock when API fails', () => {
    service.loadCompare(MOCK_ENRIQ_DT_A, MOCK_ENRIQ_DT_B).subscribe((result) => {
      expect(result.rows.length).toBeGreaterThan(0);
      const revenue = result.rows.find((r) => r.label === 'Receita total');
      expect(revenue).toBeDefined();
      expect(revenue!.value_b - revenue!.value_a).toBeCloseTo(revenue!.delta, 5);
    });

    http.expectOne(`${base}/enriquecido/${MOCK_ENRIQ_DT_A}/kpis`).flush('x', {
      status: 404,
      statusText: 'Not Found',
    });
    http.expectOne(`${base}/enriquecido/${MOCK_ENRIQ_DT_B}/kpis`).flush('x', {
      status: 404,
      statusText: 'Not Found',
    });
  });

  it('mock kpis for 2022-01-01 align with dashboard MOCK_KPIS', () => {
    service.loadKpis(MOCK_ENRIQ_DT_A).subscribe((result) => {
      expect(result.data_source).toBe('mock');
      expect(result.kpis.revenue_total).toBe(879_026.03);
      expect(result.kpis.row_count).toBe(100);
    });

    http.expectOne(`${base}/enriquecido/${MOCK_ENRIQ_DT_A}/kpis`).flush('x', {
      status: 404,
      statusText: 'Not Found',
    });
  });
});
