export interface InsumoItem {
  key: string;
  name: string;
  size_bytes: number;
  last_modified: string;
}

export interface InsumosListResponse {
  items: InsumoItem[];
  prefix?: string;
}

export type InsumosDataSource = 'api' | 'mock';

export interface InsumosListResult {
  items: InsumoItem[];
  prefix: string;
  data_source: InsumosDataSource;
  loaded_at: Date;
}
