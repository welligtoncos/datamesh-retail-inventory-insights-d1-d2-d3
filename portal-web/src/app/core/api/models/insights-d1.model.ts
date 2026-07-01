export interface D1RankingRow {
  product_id: string;
  category: string;
  unidades: number;
  receita: number;
  pct_total: number;
}

export interface D1Leader {
  product_id: string;
  category: string;
  unidades: number;
  receita: number;
}

export interface InsightsD1Response {
  dt: string;
  data_execucao: string;
  partition_exists: boolean;
  insight_text: string;
  leader: D1Leader;
  top3_concentration_pct: number;
  total_unidades: number;
  total_receita: number;
  ranking: D1RankingRow[];
}

export interface InsightsD1DownloadResponse {
  presigned_url: string;
  expires_in_seconds: number;
  s3_key: string;
  filename: string;
}

export interface InsightsD1Result {
  insight: InsightsD1Response;
  data_source: 'api' | 'mock';
  loaded_at: Date;
}

export interface InsightsD1DownloadResult {
  download: InsightsD1DownloadResponse;
  data_source: 'api' | 'mock';
  loaded_at: Date;
}
