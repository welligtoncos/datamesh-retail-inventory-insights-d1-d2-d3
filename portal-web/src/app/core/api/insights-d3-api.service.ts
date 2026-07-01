import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { InsightsD3DownloadResponse, InsightsD3Response } from './models/insights-d3.model';

@Injectable({ providedIn: 'root' })
export class InsightsD3ApiService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiBaseUrl.replace(/\/$/, '');

  getInsight(dt: string, windowDays: number): Observable<InsightsD3Response> {
    const params = new HttpParams().set('dt', dt).set('window', String(windowDays));
    return this.http.get<InsightsD3Response>(`${this.base}/insights/d3`, { params });
  }

  getDownload(dt: string, windowDays: number): Observable<InsightsD3DownloadResponse> {
    const params = new HttpParams().set('dt', dt).set('window', String(windowDays));
    return this.http.get<InsightsD3DownloadResponse>(`${this.base}/insights/d3/download`, {
      params,
    });
  }
}
