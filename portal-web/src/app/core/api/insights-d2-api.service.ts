import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { InsightsD2DownloadResponse, InsightsD2Response } from './models/insights-d2.model';

@Injectable({ providedIn: 'root' })
export class InsightsD2ApiService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiBaseUrl.replace(/\/$/, '');

  getInsight(dt: string): Observable<InsightsD2Response> {
    const params = new HttpParams().set('dt', dt);
    return this.http.get<InsightsD2Response>(`${this.base}/insights/d2`, { params });
  }

  getDownload(dt: string): Observable<InsightsD2DownloadResponse> {
    const params = new HttpParams().set('dt', dt);
    return this.http.get<InsightsD2DownloadResponse>(`${this.base}/insights/d2/download`, {
      params,
    });
  }
}
