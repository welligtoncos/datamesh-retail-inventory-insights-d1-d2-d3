export type PipelineExecutionStatus =
  | 'RUNNING'
  | 'SUCCEEDED'
  | 'FAILED'
  | 'TIMED_OUT'
  | 'ABORTED';

export interface PipelineAuditEntry {
  sub: string;
  email?: string;
  timestamp: string;
}

export interface ProcessarDiaRequest {
  dt: string;
}

export interface ProcessarDiaResponse {
  execution_arn: string;
  execution_id: string;
  dt: string;
  status: PipelineExecutionStatus;
  started_at: string;
  audit: PipelineAuditEntry;
}

export interface PipelineExecutionSummary {
  execution_id: string;
  execution_arn: string;
  dt: string;
  status: PipelineExecutionStatus;
  started_at: string;
  stopped_at: string | null;
  duration_seconds: number | null;
  audit?: PipelineAuditEntry;
}

export interface PipelineExecutionsListResponse {
  executions: PipelineExecutionSummary[];
  limit: number;
}

export interface PipelineExecutionsResult {
  list: PipelineExecutionsListResponse;
  data_source: 'api' | 'mock';
  loaded_at: Date;
}

export interface ProcessarDiaResult {
  response: ProcessarDiaResponse;
  data_source: 'api' | 'mock';
  loaded_at: Date;
}

export interface PipelineExecutionResult {
  execution: PipelineExecutionSummary;
  data_source: 'api' | 'mock';
  loaded_at: Date;
}

export function isTerminalPipelineStatus(status: PipelineExecutionStatus): boolean {
  return status !== 'RUNNING';
}

export function displayPipelineStatus(status: PipelineExecutionStatus): string {
  if (status === 'TIMED_OUT' || status === 'ABORTED') {
    return 'FAILED';
  }
  return status;
}
