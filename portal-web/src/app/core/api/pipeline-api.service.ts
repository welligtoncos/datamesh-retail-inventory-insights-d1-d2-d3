import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  PipelineExecutionSummary,
  PipelineExecutionsListResponse,
  ProcessarDiaRequest,
  ProcessarDiaResponse,
} from './models/pipeline.model';

@Injectable({ providedIn: 'root' })
export class PipelineApiService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiBaseUrl.replace(/\/$/, '');

  startProcessarDia(dt: string): Observable<ProcessarDiaResponse> {
    const body: ProcessarDiaRequest = { dt };
    return this.http.post<ProcessarDiaResponse>(`${this.base}/pipeline/processar-dia`, body);
  }

  listExecutions(limit: number): Observable<PipelineExecutionsListResponse> {
    const params = new HttpParams().set('limit', String(limit));
    return this.http.get<PipelineExecutionsListResponse>(`${this.base}/pipeline/executions`, {
      params,
    });
  }

  getExecution(executionId: string): Observable<PipelineExecutionSummary> {
    return this.http.get<PipelineExecutionSummary>(
      `${this.base}/pipeline/executions/${encodeURIComponent(executionId)}`,
    );
  }
}
