export type HealthStatusValue = 'ok' | 'degraded' | 'offline';

export interface HealthResponse {
  status?: 'ok' | 'degraded';
  service?: string;
}

export interface HealthStatus {
  status: HealthStatusValue;
  checked_at: Date;
}
