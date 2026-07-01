export interface OrigemPartitionsResponse {
  partitions: string[];
  latest?: string;
  missing_dates?: string[];
}

export interface OrigemPreviewResponse {
  dt: string;
  row_count: number;
  stores_count: number;
  products_count: number;
  columns: string[];
  rows: Record<string, unknown>[];
  page: number;
  page_size: number;
  total_pages: number;
  total_rows: number;
}

export type OrigemDataSource = 'api' | 'mock';

export interface OrigemPartition {
  dt: string;
  status: 'available' | 'missing';
}

export interface OrigemPartitionsResult {
  partitions: OrigemPartition[];
  latest?: string;
  data_source: OrigemDataSource;
  loaded_at: Date;
}

export interface OrigemPreviewResult {
  preview: OrigemPreviewResponse;
  data_source: OrigemDataSource;
  loaded_at: Date;
}
