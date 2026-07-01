import {
  OpsAlarmItem,
  OpsAlarmsResponse,
  PRIMARY_SFN_ALARM_NAME,
} from '../models/ops-alarms.model';

export function buildMockOpsAlarmsResponse(forceAlarm = false): OpsAlarmsResponse {
  const state = forceAlarm ? 'ALARM' : 'OK';
  const alarm: OpsAlarmItem = {
    alarm_name: PRIMARY_SFN_ALARM_NAME,
    state,
    metric: 'ExecutionsFailed',
    updated_at: new Date().toISOString(),
    state_reason: forceAlarm
      ? 'Threshold crossed: 1 datapoint was greater than 0'
      : 'Threshold not crossed',
  };
  return {
    alarms: [alarm],
    pipeline_operational: state === 'OK',
  };
}
