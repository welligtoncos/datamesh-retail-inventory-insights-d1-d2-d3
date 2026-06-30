export interface PartitionListResponse {
  partitions: string[];
  latest?: string;
}

export interface EnriquecidoKpis {
  dt: string;
  row_count: number;
  revenue_total: number;
  stockout_pct: number;
  products_stockout: number;
  stores_count: number;
}
