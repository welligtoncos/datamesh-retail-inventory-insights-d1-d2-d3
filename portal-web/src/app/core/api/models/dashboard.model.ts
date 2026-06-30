import { EnriquecidoKpis } from './enriquecido.model';
import { HealthStatusValue } from './health.model';

export type DashboardDataSource = 'api' | 'mock' | 'partial';

export interface DashboardSummary {
  ultimo_dt: string | null;
  kpis: EnriquecidoKpis | null;
  data_source: DashboardDataSource;
  health: HealthStatusValue;
}
