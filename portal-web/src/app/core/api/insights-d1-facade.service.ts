import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';

import {
  buildMockInsightsD1,
  buildMockInsightsD1Download,
} from './data/insights-d1-mock.data';
import { normalizeD1Dt } from './d1-date.util';
import { InsightsD1ApiService } from './insights-d1-api.service';
import {
  InsightsD1DownloadResult,
  InsightsD1Result,
} from './models/insights-d1.model';

@Injectable({ providedIn: 'root' })
export class InsightsD1FacadeService {
  private readonly api = inject(InsightsD1ApiService);

  loadInsight(dt: string): Observable<InsightsD1Result> {
    const normalized = normalizeD1Dt(dt);
    return this.api.getInsight(normalized).pipe(
      map((insight) => ({
        insight,
        data_source: 'api' as const,
        loaded_at: new Date(),
      })),
      catchError(() => of(this.mockInsightResult(normalized))),
    );
  }

  getDownload(dt: string): Observable<InsightsD1DownloadResult> {
    const normalized = normalizeD1Dt(dt);
    return this.api.getDownload(normalized).pipe(
      map((download) => ({
        download,
        data_source: 'api' as const,
        loaded_at: new Date(),
      })),
      catchError(() => of(this.mockDownloadResult(normalized))),
    );
  }

  mockInsightResult(dt: string): InsightsD1Result {
    return {
      insight: buildMockInsightsD1(dt),
      data_source: 'mock',
      loaded_at: new Date(),
    };
  }

  mockDownloadResult(dt: string): InsightsD1DownloadResult {
    return {
      download: buildMockInsightsD1Download(dt),
      data_source: 'mock',
      loaded_at: new Date(),
    };
  }
}
