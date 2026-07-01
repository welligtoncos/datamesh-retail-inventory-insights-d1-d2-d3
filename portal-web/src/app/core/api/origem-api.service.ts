import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  OrigemPartitionsResponse,
  OrigemPreviewResponse,
} from './models/origem.model';

@Injectable({ providedIn: 'root' })
export class OrigemApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl.replace(/\/$/, '')}/origem`;

  getPartitions(): Observable<OrigemPartitionsResponse> {
    return this.http.get<OrigemPartitionsResponse>(`${this.baseUrl}/partitions`);
  }

  getPreview(
    dt: string,
    page = 1,
    pageSize = 50,
  ): Observable<OrigemPreviewResponse> {
    const params = new HttpParams()
      .set('page', String(page))
      .set('page_size', String(pageSize));
    return this.http.get<OrigemPreviewResponse>(
      `${this.baseUrl}/${encodeURIComponent(dt)}/preview`,
      { params },
    );
  }
}
