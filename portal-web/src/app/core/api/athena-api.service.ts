import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  AthenaQueryTemplateRequest,
  AthenaQueryTemplateResponse,
} from './models/athena.model';

@Injectable({ providedIn: 'root' })
export class AthenaApiService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiBaseUrl.replace(/\/$/, '');

  queryTemplate(body: AthenaQueryTemplateRequest): Observable<AthenaQueryTemplateResponse> {
    return this.http.post<AthenaQueryTemplateResponse>(`${this.base}/athena/query-template`, body);
  }
}
