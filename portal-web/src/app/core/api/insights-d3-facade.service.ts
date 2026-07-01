import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';

import {
  buildMockInsightsD3,
  buildMockInsightsD3Download,
} from './data/insights-d3-mock.data';
import { DEFAULT_D3_WINDOW } from './d3-trend.util';
import { normalizeD1Dt } from './d1-date.util';
import { InsightsD3ApiService } from './insights-d3-api.service';
import { InsightsD3DownloadResult, InsightsD3Result } from './models/insights-d3.model';

@Injectable({ providedIn: 'root' })
export class InsightsD3FacadeService {
  private readonly api = inject(InsightsD3ApiService);

  loadInsight(dt: string, windowDays = DEFAULT_D3_WINDOW): Observable<InsightsD3Result> {
    const normalized = normalizeD1Dt(dt);
    const window = Math.max(1, windowDays);
    return this.api.getInsight(normalized, window).pipe(
      map((insight) => ({
        insight,
        data_source: 'api' as const,
        loaded_at: new Date(),
      })),
      catchError(() => of(this.mockInsightResult(normalized, window))),
    );
  }

  getDownload(dt: string, windowDays = DEFAULT_D3_WINDOW): Observable<InsightsD3DownloadResult> {
    const normalized = normalizeD1Dt(dt);
    const window = Math.max(1, windowDays);
    return this.api.getDownload(normalized, window).pipe(
      map((download) => ({
        download,
        data_source: 'api' as const,
        loaded_at: new Date(),
      })),
      catchError(() => of(this.mockDownloadResult(normalized, window))),
    );
  }

  mockInsightResult(dt: string, windowDays: number): InsightsD3Result {
    return {
      insight: buildMockInsightsD3(dt, windowDays),
      data_source: 'mock',
      loaded_at: new Date(),
    };
  }

  mockDownloadResult(dt: string, windowDays: number): InsightsD3DownloadResult {
    return {
      download: buildMockInsightsD3Download(dt, windowDays),
      data_source: 'mock',
      loaded_at: new Date(),
    };
  }
}
