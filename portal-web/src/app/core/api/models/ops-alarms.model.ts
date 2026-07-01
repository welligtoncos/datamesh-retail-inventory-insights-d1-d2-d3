export type CloudWatchAlarmState = 'OK' | 'ALARM' | 'INSUFFICIENT_DATA';

export const PRIMARY_SFN_ALARM_NAME =
  'retail-inventory-insights-processar-dia-failed-dev';

export interface OpsAlarmItem {
  alarm_name: string;
  state: CloudWatchAlarmState;
  state_reason?: string;
  updated_at?: string;
  metric?: string;
  resource_arn?: string;
}

export interface OpsAlarmsResponse {
  alarms: OpsAlarmItem[];
  pipeline_operational: boolean;
}

export interface OpsAlarmsResult {
  response: OpsAlarmsResponse;
  data_source: 'api' | 'mock';
  loaded_at: Date;
}
