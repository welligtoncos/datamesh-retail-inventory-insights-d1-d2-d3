import { Injectable, inject, OnDestroy } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';

import { AuthService } from '../auth/auth.service';
import {
  buildMockAudit,
  buildMockExecutionsList,
  DEFAULT_PIPELINE_HISTORY_LIMIT,
} from './data/pipeline-mock.data';
import { PipelineExecutionMockStore } from './data/pipeline-execution-mock.store';
import { normalizePipelineDt } from './pipeline-date.util';
import { PipelineApiService } from './pipeline-api.service';
import {
  PipelineExecutionResult,
  PipelineExecutionSummary,
  PipelineExecutionsResult,
  ProcessarDiaResult,
} from './models/pipeline.model';

@Injectable({ providedIn: 'root' })
export class PipelineFacadeService implements OnDestroy {
  private readonly api = inject(PipelineApiService);
  private readonly mockStore = inject(PipelineExecutionMockStore);
  private readonly auth = inject(AuthService);

  private pollTimer: ReturnType<typeof setInterval> | null = null;

  ngOnDestroy(): void {
    this.stopPolling();
  }

  loadExecutions(limit = DEFAULT_PIPELINE_HISTORY_LIMIT): Observable<PipelineExecutionsResult> {
    return this.api.listExecutions(limit).pipe(
      map((list) => ({
        list,
        data_source: 'api' as const,
        loaded_at: new Date(),
      })),
      catchError(() => of(this.mockExecutionsResult(limit))),
    );
  }

  startProcessarDia(dt: string): Observable<ProcessarDiaResult> {
    const normalized = normalizePipelineDt(dt);
    return this.api.startProcessarDia(normalized).pipe(
      map((response) => ({
        response,
        data_source: 'api' as const,
        loaded_at: new Date(),
      })),
      catchError(() => of(this.mockStartResult(normalized))),
    );
  }

  getExecution(executionId: string): Observable<PipelineExecutionResult> {
    return this.api.getExecution(executionId).pipe(
      map((execution) => ({
        execution,
        data_source: 'api' as const,
        loaded_at: new Date(),
      })),
      catchError(() => {
        const execution = this.mockStore.getExecution(executionId);
        if (!execution) {
          throw new Error('Execução não encontrada');
        }
        return of({
          execution,
          data_source: 'mock' as const,
          loaded_at: new Date(),
        });
      }),
    );
  }

  hasRunningInMock(): boolean {
    return this.mockStore.hasRunningExecution();
  }

  startPolling(
    executionId: string,
    onUpdate: (execution: PipelineExecutionSummary) => void,
    intervalMs = 15_000,
  ): void {
    this.stopPolling();
    this.pollTimer = setInterval(() => {
      this.getExecution(executionId).subscribe({
        next: (result) => onUpdate(result.execution),
      });
    }, intervalMs);
  }

  stopPolling(): void {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
  }

  private mockExecutionsResult(limit: number): PipelineExecutionsResult {
    return {
      list: buildMockExecutionsList(this.mockStore, limit),
      data_source: 'mock',
      loaded_at: new Date(),
    };
  }

  private mockStartResult(dt: string): ProcessarDiaResult {
    const claims = this.auth.getIdentityClaims();
    const response = this.mockStore.startExecution(dt, buildMockAudit(claims));
    return {
      response,
      data_source: 'mock',
      loaded_at: new Date(),
    };
  }
}
