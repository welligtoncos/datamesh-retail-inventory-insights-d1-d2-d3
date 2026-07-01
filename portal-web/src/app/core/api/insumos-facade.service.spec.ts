import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { InsumosFacadeService, MOCK_INSUMO_FILE } from './insumos-facade.service';
import { environment } from '../../../environments/environment';

describe('InsumosFacadeService', () => {
  let service: InsumosFacadeService;
  let http: HttpTestingController;
  const url = `${environment.apiBaseUrl.replace(/\/$/, '')}/insumos`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(InsumosFacadeService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('falls back to mock when API returns 404', () => {
    service.loadInsumos().subscribe((result) => {
      expect(result.data_source).toBe('mock');
      expect(result.items.length).toBeGreaterThanOrEqual(1);
      expect(result.items[0].name).toBe(MOCK_INSUMO_FILE);
    });

    const req = http.expectOne(url);
    req.flush('not found', { status: 404, statusText: 'Not Found' });
  });

  it('uses api data when GET succeeds', () => {
    service.loadInsumos().subscribe((result) => {
      expect(result.data_source).toBe('api');
      expect(result.items[0].name).toBe('novo.csv');
    });

    http.expectOne(url).flush({
      prefix: 'insumo/',
      items: [
        {
          key: 'insumo/novo.csv',
          name: 'novo.csv',
          size_bytes: 500,
          last_modified: '2023-05-01T10:00:00Z',
        },
      ],
    });
  });

  it('returns empty list from API without mock', () => {
    service.loadInsumos().subscribe((result) => {
      expect(result.data_source).toBe('api');
      expect(result.items.length).toBe(0);
    });

    http.expectOne(url).flush({ prefix: 'insumo/', items: [] });
  });
});
