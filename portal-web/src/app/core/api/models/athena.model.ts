export type AthenaTemplateCategory = 'smoke' | 'sanity' | 'd1' | 'd2' | 'd3' | 'quality';

export type AthenaQueryStatus =
  | 'QUEUED'
  | 'RUNNING'
  | 'SUCCEEDED'
  | 'FAILED'
  | 'CANCELLED';

export interface AthenaQueryParams {
  dt?: string;
  dts?: string[];
  limit?: number;
}

export interface AthenaTemplateParamField {
  required: boolean;
  label: string;
}

export interface AthenaTemplateDtsField extends AthenaTemplateParamField {
  min_items: number;
  max_items: number;
}

export interface AthenaTemplateLimitField extends AthenaTemplateParamField {
  default: number;
  max: number;
}

export interface AthenaTemplateParamsSchema {
  dt?: AthenaTemplateParamField;
  dts?: AthenaTemplateDtsField;
  limit?: AthenaTemplateLimitField;
}

export interface AthenaTemplateDefinition {
  template_id: string;
  title: string;
  description: string;
  category: AthenaTemplateCategory;
  params_schema: AthenaTemplateParamsSchema;
}

export interface AthenaQueryTemplateRequest {
  template_id: string;
  params?: AthenaQueryParams;
}

export interface AthenaQueryTemplateResponse {
  query_execution_id: string;
  template_id: string;
  status: AthenaQueryStatus;
  columns: string[];
  rows: Record<string, string | number | null>[];
  row_count: number;
  truncated: boolean;
  data_scan_bytes?: number;
  execution_time_ms?: number;
  state_reason?: string;
}

export interface AthenaQueryResult {
  response: AthenaQueryTemplateResponse;
  data_source: 'api' | 'mock';
  loaded_at: Date;
}
