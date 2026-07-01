import { InsightsDownloadResponse, InsightsDownloadResult } from './insights-shared.model';

export type TrendLabel = 'Subindo' | 'Caindo' | 'Estável';

export interface D3TrendRow {
  store_id: string;
  product_id: string;
  category: string;
  avg_weekday: number;
  avg_weekend: number;
  trend_pct: number;
  trend_label: TrendLabel;
  dias: number;
}

export interface D3TopTrend {
  store_id: string;
  product_id: string;
  trend_pct: number;
  trend_label: TrendLabel;
}

export interface InsightsD3Response {
  dt: string;
  data_execucao: string;
  window_days: number;
  partitions_read: number;
  partition_exists: boolean;
  insight_text: string;
  subindo_count: number;
  caindo_count: number;
  estavel_count: number;
  top_trend: D3TopTrend | null;
  rows: D3TrendRow[];
}

export interface InsightsD3Result {
  insight: InsightsD3Response;
  data_source: 'api' | 'mock';
  loaded_at: Date;
}

export type InsightsD3DownloadResponse = InsightsDownloadResponse;
export type InsightsD3DownloadResult = InsightsDownloadResult;
