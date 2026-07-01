import { PipelineAuditEntry, PipelineExecutionsListResponse } from '../models/pipeline.model';
import { PipelineExecutionMockStore } from './pipeline-execution-mock.store';

export const DEFAULT_PIPELINE_HISTORY_LIMIT = 20;

export function buildMockAudit(claims: Record<string, string> | null): PipelineAuditEntry {
  return {
    sub: claims?.['sub'] ?? 'mock-sub',
    email: claims?.['email'],
    timestamp: new Date().toISOString(),
  };
}

export function buildMockExecutionsList(
  store: PipelineExecutionMockStore,
  limit = DEFAULT_PIPELINE_HISTORY_LIMIT,
): PipelineExecutionsListResponse {
  return {
    executions: store.listExecutions(limit),
    limit,
  };
}
