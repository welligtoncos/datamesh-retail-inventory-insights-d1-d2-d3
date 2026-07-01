import { CloudWatchAlarmState } from './ops-alarms.model';
import { HealthStatusValue } from './health.model';

export type EsteiraStatusLevel =
  | 'operational'
  | 'alarm'
  | 'insufficient_data'
  | 'api_offline'
  | 'api_degraded';

export interface EsteiraStatusViewModel {
  level: EsteiraStatusLevel;
  label: string;
  detail: string;
  health: HealthStatusValue;
  primary_alarm_state: CloudWatchAlarmState | null;
  pipeline_operational: boolean;
  checked_at: Date;
  console_alarm_url?: string;
}

export interface EsteiraStatusResult {
  status: EsteiraStatusViewModel;
  data_source: 'api' | 'mock';
  loaded_at: Date;
}
