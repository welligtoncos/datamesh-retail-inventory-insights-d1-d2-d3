import { Injectable, inject } from '@angular/core';
import { Observable, catchError, forkJoin, map, of, throwError } from 'rxjs';

import {
  MOCK_ENRIQUECIDO_PARTITIONS,
  buildMockEnriquecidoKpis,
  buildMockEnriquecidoPreview,
  isMockEnriquecidoDt,
} from './data/enriquecido-mock.data';
import { buildKpiCompareRows } from './enriquecido-compare.util';
import { EnriquecidoApiService } from './enriquecido-api.service';
import { normalizeEnriquecidoDt, sortEnriquecidoPartitionsDesc } from './enriquecido-partition.util';
import { PREVIEW_PAGE_SIZE, clampPreviewTotalRows } from './origem-preview.util';
import {
  EnriquecidoCompareResult,
  EnriquecidoKpisResult,
  EnriquecidoPartitionsResult,
  EnriquecidoPreviewResponse,
  EnriquecidoPreviewResult,
  PartitionListResponse,
} from './models/enriquecido.model';

@Injectable({ providedIn: 'root' })
export class EnriquecidoFacadeService {
  private readonly api = inject(EnriquecidoApiService);

  loadPartitions(): Observable<EnriquecidoPartitionsResult> {
    return this.api.getPartitions().pipe(
      map((response) => this.toPartitionsResult(response, 'api')),
      catchError(() => of(this.mockPartitionsResult())),
    );
  }

  loadKpis(dt: string): Observable<EnriquecidoKpisResult> {
    const normalized = normalizeEnriquecidoDt(dt);
    return this.api.getKpis(normalized).pipe(
      map((kpis) => ({ kpis, data_source: 'api' as const, loaded_at: new Date() })),
      catchError(() => {
        if (isMockEnriquecidoDt(normalized)) {
          return of(this.mockKpisResult(normalized));
        }
        return throwError(() => new Error(`KPIs indisponíveis para dt=${normalized}`));
      }),
    );
  }

  loadPreview(
    dt: string,
    page = 1,
    pageSize = PREVIEW_PAGE_SIZE,
  ): Observable<EnriquecidoPreviewResult> {
    const normalized = normalizeEnriquecidoDt(dt);
    return this.api.getPreview(normalized, page, pageSize).pipe(
      map((preview) => this.toPreviewResult(this.clampPreview(preview), 'api')),
      catchError(() => {
        if (isMockEnriquecidoDt(normalized)) {
          return of(this.mockPreviewResult(normalized, page, pageSize));
        }
        return throwError(() => new Error(`Preview indisponível para dt=${normalized}`));
      }),
    );
  }

  loadCompare(dtA: string, dtB: string): Observable<EnriquecidoCompareResult> {
    const a = normalizeEnriquecidoDt(dtA);
    const b = normalizeEnriquecidoDt(dtB);
    if (a === b) {
      return throwError(() => new Error('Selecione duas partições diferentes.'));
    }
    return forkJoin({
      kpisA: this.loadKpis(a),
      kpisB: this.loadKpis(b),
    }).pipe(
      map(({ kpisA, kpisB }) => {
        const data_source =
          kpisA.data_source === 'mock' || kpisB.data_source === 'mock' ? 'mock' : 'api';
        return {
          dt_a: a,
          dt_b: b,
          rows: buildKpiCompareRows(kpisA.kpis, kpisB.kpis),
          data_source,
          loaded_at: new Date(),
        };
      }),
    );
  }

  mockPartitionsResult(): EnriquecidoPartitionsResult {
    return this.toPartitionsResult(MOCK_ENRIQUECIDO_PARTITIONS, 'mock');
  }

  mockKpisResult(dt: string): EnriquecidoKpisResult {
    return {
      kpis: buildMockEnriquecidoKpis(dt),
      data_source: 'mock',
      loaded_at: new Date(),
    };
  }

  mockPreviewResult(
    dt: string,
    page = 1,
    pageSize = PREVIEW_PAGE_SIZE,
  ): EnriquecidoPreviewResult {
    return this.toPreviewResult(buildMockEnriquecidoPreview(dt, page, pageSize), 'mock');
  }

  private toPartitionsResult(
    response: PartitionListResponse,
    data_source: 'api' | 'mock',
  ): EnriquecidoPartitionsResult {
    return {
      partitions: sortEnriquecidoPartitionsDesc(response.partitions ?? []),
      latest: response.latest,
      data_source,
      loaded_at: new Date(),
    };
  }

  private toPreviewResult(
    preview: EnriquecidoPreviewResponse,
    data_source: 'api' | 'mock',
  ): EnriquecidoPreviewResult {
    return {
      preview: this.clampPreview(preview),
      data_source,
      loaded_at: new Date(),
    };
  }

  private clampPreview(preview: EnriquecidoPreviewResponse): EnriquecidoPreviewResponse {
    return { ...preview, total_rows: clampPreviewTotalRows(preview.total_rows) };
  }
}
