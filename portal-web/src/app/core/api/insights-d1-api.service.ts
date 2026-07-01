import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  InsightsD1DownloadResponse,
  InsightsD1Response,
} from './models/insights-d1.model';

@Injectable({ providedIn: 'root' })
export class InsightsD1ApiService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiBaseUrl.replace(/\/$/, '');

  getInsight(dt: string): Observable<InsightsD1Response> {
    const params = new HttpParams().set('dt', dt);
    return this.http.get<InsightsD1Response>(`${this.base}/insights/d1`, { params });
  }

  getDownload(dt: string): Observable<InsightsD1DownloadResponse> {
    const params = new HttpParams().set('dt', dt);
    return this.http.get<InsightsD1DownloadResponse>(`${this.base}/insights/d1/download`, {
      params,
    });
  }
}
