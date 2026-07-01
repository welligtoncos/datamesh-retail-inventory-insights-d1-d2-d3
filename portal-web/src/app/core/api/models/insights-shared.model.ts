export interface InsightsDownloadResponse {
  presigned_url: string;
  expires_in_seconds: number;
  s3_key: string;
  filename: string;
}

export interface InsightsDownloadResult {
  download: InsightsDownloadResponse;
  data_source: 'api' | 'mock';
  loaded_at: Date;
}
