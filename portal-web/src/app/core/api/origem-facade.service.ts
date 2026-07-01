import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of, throwError } from 'rxjs';

import {
  MOCK_ORIGEM_PARTITIONS_RESPONSE,
  buildMockOrigemPreview,
  isMockOrigemDt,
} from './data/origem-mock.data';
import { OrigemApiService } from './origem-api.service';
import { buildPartitionList, normalizeDt } from './origem-partition.util';
import { PREVIEW_PAGE_SIZE, clampPreviewTotalRows } from './origem-preview.util';
import {
  OrigemPartitionsResponse,
  OrigemPartitionsResult,
  OrigemPreviewResponse,
  OrigemPreviewResult,
} from './models/origem.model';

@Injectable({ providedIn: 'root' })
export class OrigemFacadeService {
  private readonly api = inject(OrigemApiService);

  loadPartitions(): Observable<OrigemPartitionsResult> {
    return this.api.getPartitions().pipe(
      map((response) => this.toPartitionsResult(response, 'api')),
      catchError(() => of(this.mockPartitionsResult())),
    );
  }

  loadPreview(
    dt: string,
    page = 1,
    pageSize = PREVIEW_PAGE_SIZE,
  ): Observable<OrigemPreviewResult> {
    const normalized = normalizeDt(dt);
    return this.api.getPreview(normalized, page, pageSize).pipe(
      map((response) => this.toPreviewResult(this.clampPreview(response), 'api')),
      catchError(() => {
        if (isMockOrigemDt(normalized)) {
          return of(this.mockPreviewResult(normalized, page, pageSize));
        }
        return throwError(() => new Error(`Preview indisponível para dt=${normalized}`));
      }),
    );
  }

  mockPartitionsResult(): OrigemPartitionsResult {
    return this.toPartitionsResult(MOCK_ORIGEM_PARTITIONS_RESPONSE, 'mock');
  }

  mockPreviewResult(
    dt: string,
    page = 1,
    pageSize = PREVIEW_PAGE_SIZE,
  ): OrigemPreviewResult {
    return this.toPreviewResult(buildMockOrigemPreview(dt, page, pageSize), 'mock');
  }

  private toPartitionsResult(
    response: OrigemPartitionsResponse,
    data_source: 'api' | 'mock',
  ): OrigemPartitionsResult {
    return {
      partitions: buildPartitionList(
        response.partitions ?? [],
        response.missing_dates ?? [],
      ),
      latest: response.latest,
      data_source,
      loaded_at: new Date(),
    };
  }

  private toPreviewResult(
    preview: OrigemPreviewResponse,
    data_source: 'api' | 'mock',
  ): OrigemPreviewResult {
    return {
      preview: this.clampPreview(preview),
      data_source,
      loaded_at: new Date(),
    };
  }

  private clampPreview(preview: OrigemPreviewResponse): OrigemPreviewResponse {
    const total_rows = clampPreviewTotalRows(preview.total_rows ?? preview.row_count);
    return { ...preview, total_rows };
  }
}
