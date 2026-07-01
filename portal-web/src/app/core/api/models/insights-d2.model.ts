import { InsightsDownloadResponse, InsightsDownloadResult } from './insights-shared.model';

export interface D2RupturaRow {
  store_id: string;
  product_id: string;
  category: string;
  inventory_level: number;
  units_sold: number;
  demand_forecast: number;
  lost: number;
}

export interface D2TopImpact {
  store_id: string;
  product_id: string;
  lost: number;
}

export interface InsightsD2Response {
  dt: string;
  data_execucao: string;
  partition_exists: boolean;
  insight_text: string;
  rupturas_count: number;
  total_lost: number;
  top_impact: D2TopImpact | null;
  rows: D2RupturaRow[];
}

export interface InsightsD2Result {
  insight: InsightsD2Response;
  data_source: 'api' | 'mock';
  loaded_at: Date;
}

export type InsightsD2DownloadResponse = InsightsDownloadResponse;
export type InsightsD2DownloadResult = InsightsDownloadResult;
