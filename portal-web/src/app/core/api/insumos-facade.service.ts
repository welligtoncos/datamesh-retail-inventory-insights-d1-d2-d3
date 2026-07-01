import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';

import { InsumosApiService } from './insumos-api.service';
import { sortInsumosByLastModifiedDesc } from './insumos-sort.util';
import { InsumoItem, InsumosListResponse, InsumosListResult } from './models/insumo.model';

export const MOCK_INSUMO_FILE = 'retail_store_inventory.csv';

export const MOCK_INSUMOS_RESPONSE: InsumosListResponse = {
  prefix: 'insumo/',
  items: [
    {
      key: `insumo/${MOCK_INSUMO_FILE}`,
      name: MOCK_INSUMO_FILE,
      size_bytes: 2_097_152,
      last_modified: '2022-01-01T12:00:00.000Z',
    },
  ],
};

@Injectable({ providedIn: 'root' })
export class InsumosFacadeService {
  private readonly api = inject(InsumosApiService);

  loadInsumos(): Observable<InsumosListResult> {
    return this.api.getInsumos().pipe(
      map((response) => this.toResult(response, 'api')),
      catchError(() => of(this.mockResult())),
    );
  }

  mockResult(): InsumosListResult {
    return this.toResult(MOCK_INSUMOS_RESPONSE, 'mock');
  }

  private toResult(response: InsumosListResponse, data_source: 'api' | 'mock'): InsumosListResult {
    const items = sortInsumosByLastModifiedDesc(response.items ?? []);
    return {
      items,
      prefix: response.prefix ?? 'insumo/',
      data_source,
      loaded_at: new Date(),
    };
  }
}
