import { Injectable } from '@angular/core';

import { buildSfnExecutionArn, PROCESSAR_DIA_SFN_ARN } from '../pipeline-console-url.util';
import { computeDurationSeconds } from '../pipeline-duration.util';
import {
  PipelineAuditEntry,
  PipelineExecutionStatus,
  PipelineExecutionSummary,
  ProcessarDiaResponse,
} from '../models/pipeline.model';

const MOCK_SFN_ARN = PROCESSAR_DIA_SFN_ARN;

const MOCK_COMPLETE_MS = 8_000;

function mockExecutionArn(executionId: string): string {
  return buildSfnExecutionArn(MOCK_SFN_ARN, executionId);
}

interface MockExecutionRecord extends PipelineExecutionSummary {
  completeTimer?: ReturnType<typeof setTimeout>;
}

@Injectable({ providedIn: 'root' })
export class PipelineExecutionMockStore {
  private readonly executions = new Map<string, MockExecutionRecord>();
  private seq = 0;
  private seeded = false;

  ensureSeed(): void {
    if (this.seeded) {
      return;
    }
    this.seeded = true;

    const now = Date.now();
    this.insertRecord({
      execution_id: 'mock-exec-001',
      execution_arn: mockExecutionArn('mock-exec-001'),
      dt: '2022-01-02',
      status: 'SUCCEEDED',
      started_at: new Date(now - 3600_000).toISOString(),
      stopped_at: new Date(now - 3500_000).toISOString(),
      duration_seconds: 100,
      audit: { sub: 'mock-seed', timestamp: new Date(now - 3600_000).toISOString() },
    });
    this.insertRecord({
      execution_id: 'mock-exec-002',
      execution_arn: mockExecutionArn('mock-exec-002'),
      dt: '2022-01-01',
      status: 'FAILED',
      started_at: new Date(now - 7200_000).toISOString(),
      stopped_at: new Date(now - 7100_000).toISOString(),
      duration_seconds: 100,
      audit: { sub: 'mock-seed', timestamp: new Date(now - 7200_000).toISOString() },
    });
  }

  listExecutions(limit: number): PipelineExecutionSummary[] {
    this.ensureSeed();
    return [...this.executions.values()]
      .sort((a, b) => b.started_at.localeCompare(a.started_at))
      .slice(0, limit)
      .map((row) => this.toSummary(row));
  }

  getExecution(executionId: string): PipelineExecutionSummary | null {
    this.ensureSeed();
    const row = this.executions.get(executionId);
    return row ? this.toSummary(row) : null;
  }

  startExecution(dt: string, audit: PipelineAuditEntry): ProcessarDiaResponse {
    this.ensureSeed();
    this.seq += 1;
    const execution_id = `mock-exec-${String(this.seq).padStart(3, '0')}`;
    const started_at = new Date().toISOString();
    const execution_arn = mockExecutionArn(execution_id);

    const record: MockExecutionRecord = {
      execution_id,
      execution_arn,
      dt,
      status: 'RUNNING',
      started_at,
      stopped_at: null,
      duration_seconds: null,
      audit,
    };

    record.completeTimer = setTimeout(() => {
      this.completeExecution(execution_id, dt);
    }, MOCK_COMPLETE_MS);

    this.executions.set(execution_id, record);

    return {
      execution_arn,
      execution_id,
      dt,
      status: 'RUNNING',
      started_at,
      audit,
    };
  }

  /** Test helper: complete RUNNING execution immediately */
  forceComplete(executionId: string, success = true): void {
    const row = this.executions.get(executionId);
    if (!row || row.status !== 'RUNNING') {
      return;
    }
    if (row.completeTimer) {
      clearTimeout(row.completeTimer);
    }
    this.completeExecution(executionId, row.dt, success);
  }

  hasRunningExecution(): boolean {
    return [...this.executions.values()].some((row) => row.status === 'RUNNING');
  }

  private completeExecution(executionId: string, dt: string, success?: boolean): void {
    const row = this.executions.get(executionId);
    if (!row || row.status !== 'RUNNING') {
      return;
    }

    const mockSuccess =
      success ?? (dt === '2022-01-01' || dt === '2022-01-02');
    const stopped_at = new Date().toISOString();
    row.status = mockSuccess ? 'SUCCEEDED' : 'FAILED';
    row.stopped_at = stopped_at;
    row.duration_seconds = computeDurationSeconds(row.started_at, stopped_at);
    row.completeTimer = undefined;
  }

  private insertRecord(row: PipelineExecutionSummary): void {
    this.executions.set(row.execution_id, { ...row });
  }

  private toSummary(row: MockExecutionRecord): PipelineExecutionSummary {
    return {
      execution_id: row.execution_id,
      execution_arn: row.execution_arn,
      dt: row.dt,
      status: row.status,
      started_at: row.started_at,
      stopped_at: row.stopped_at,
      duration_seconds: row.duration_seconds,
      audit: row.audit,
    };
  }
}
