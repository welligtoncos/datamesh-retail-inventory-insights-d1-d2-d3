export interface PartitionListResponse {
  partitions: string[];
  latest?: string;
}

export type EnriquecidoPartitionsResponse = PartitionListResponse;

export interface EnriquecidoKpis {
  dt: string;
  row_count: number;
  revenue_total: number;
  stockout_pct: number;
  products_stockout: number;
  stores_count: number;
  stockout_count?: number;
  lost_total?: number;
  is_weekend?: boolean;
}

export interface EnriquecidoPreviewResponse {
  dt: string;
  columns: string[];
  rows: Record<string, unknown>[];
  page: number;
  page_size: number;
  total_pages: number;
  total_rows: number;
}

export type EnriquecidoDataSource = 'api' | 'mock';

export interface EnriquecidoPartitionsResult {
  partitions: string[];
  latest?: string;
  data_source: EnriquecidoDataSource;
  loaded_at: Date;
}

export interface EnriquecidoKpisResult {
  kpis: EnriquecidoKpis;
  data_source: EnriquecidoDataSource;
  loaded_at: Date;
}

export interface EnriquecidoPreviewResult {
  preview: EnriquecidoPreviewResponse;
  data_source: EnriquecidoDataSource;
  loaded_at: Date;
}

export interface EnriquecidoCompareRow {
  label: string;
  value_a: number;
  value_b: number;
  delta: number;
  delta_pct: number | null;
}

export interface EnriquecidoCompareResult {
  dt_a: string;
  dt_b: string;
  rows: EnriquecidoCompareRow[];
  data_source: EnriquecidoDataSource;
  loaded_at: Date;
}
