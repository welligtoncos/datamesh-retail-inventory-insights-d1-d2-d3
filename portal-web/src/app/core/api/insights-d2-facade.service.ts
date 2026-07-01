import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';

import {
  buildMockInsightsD2,
  buildMockInsightsD2Download,
} from './data/insights-d2-mock.data';
import { normalizeD1Dt } from './d1-date.util';
import { InsightsD2ApiService } from './insights-d2-api.service';
import { InsightsD2DownloadResult, InsightsD2Result } from './models/insights-d2.model';

@Injectable({ providedIn: 'root' })
export class InsightsD2FacadeService {
  private readonly api = inject(InsightsD2ApiService);

  loadInsight(dt: string): Observable<InsightsD2Result> {
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

  getDownload(dt: string): Observable<InsightsD2DownloadResult> {
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

  mockInsightResult(dt: string): InsightsD2Result {
    return {
      insight: buildMockInsightsD2(dt),
      data_source: 'mock',
      loaded_at: new Date(),
    };
  }

  mockDownloadResult(dt: string): InsightsD2DownloadResult {
    return {
      download: buildMockInsightsD2Download(dt),
      data_source: 'mock',
      loaded_at: new Date(),
    };
  }
}
