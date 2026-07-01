import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { MOCK_ORIGEM_DT } from './data/origem-mock.data';
import { OrigemFacadeService } from './origem-facade.service';
import { PREVIEW_PAGE_SIZE } from './origem-preview.util';
import { environment } from '../../../environments/environment';

describe('OrigemFacadeService', () => {
  let service: OrigemFacadeService;
  let http: HttpTestingController;
  const baseUrl = `${environment.apiBaseUrl.replace(/\/$/, '')}/origem`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(OrigemFacadeService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('falls back to mock when partitions API returns 404', () => {
    service.loadPartitions().subscribe((result) => {
      expect(result.data_source).toBe('mock');
      expect(result.partitions.some((p) => p.dt === MOCK_ORIGEM_DT && p.status === 'available')).toBeTrue();
      expect(result.partitions.some((p) => p.status === 'missing')).toBeTrue();
    });

    const req = http.expectOne(`${baseUrl}/partitions`);
    req.flush('not found', { status: 404, statusText: 'Not Found' });
  });

  it('uses api partitions when GET succeeds', () => {
    service.loadPartitions().subscribe((result) => {
      expect(result.data_source).toBe('api');
      expect(result.partitions[0].dt).toBe('2023-06-01');
    });

    http.expectOne(`${baseUrl}/partitions`).flush({
      partitions: ['2023-06-01'],
      missing_dates: [],
    });
  });

  it('falls back to mock preview on 404 for mock dt', () => {
    service.loadPreview(MOCK_ORIGEM_DT, 2, PREVIEW_PAGE_SIZE).subscribe((result) => {
      expect(result.data_source).toBe('mock');
      expect(result.preview.page).toBe(2);
      expect(result.preview.rows.length).toBeLessThanOrEqual(PREVIEW_PAGE_SIZE);
      expect(result.preview.total_rows).toBeLessThanOrEqual(500);
    });

    const req = http.expectOne(
      (r) => r.url === `${baseUrl}/${MOCK_ORIGEM_DT}/preview` && r.params.get('page') === '2',
    );
    req.flush('not found', { status: 404, statusText: 'Not Found' });
  });

  it('uses api preview when GET succeeds', () => {
    service.loadPreview('2023-06-01', 1, 50).subscribe((result) => {
      expect(result.data_source).toBe('api');
      expect(result.preview.row_count).toBe(42);
    });

    http.expectOne(`${baseUrl}/2023-06-01/preview?page=1&page_size=50`).flush({
      dt: '2023-06-01',
      row_count: 42,
      stores_count: 5,
      products_count: 20,
      columns: ['Date'],
      rows: [{ Date: '2023-06-01' }],
      page: 1,
      page_size: 50,
      total_pages: 1,
      total_rows: 42,
    });
  });
});
