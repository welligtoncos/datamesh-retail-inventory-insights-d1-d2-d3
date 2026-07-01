import { buildCloudWatchAlarmConsoleUrl } from './cloudwatch-console-url.util';
import {
  EsteiraStatusLevel,
  EsteiraStatusViewModel,
} from './models/esteira-status.model';
import { HealthStatusValue } from './models/health.model';
import {
  OpsAlarmItem,
  PRIMARY_SFN_ALARM_NAME,
} from './models/ops-alarms.model';

const LABELS: Record<EsteiraStatusLevel, { label: string; detail: string }> = {
  operational: {
    label: 'Esteira operacional',
    detail: 'API e alarme SFN em OK',
  },
  alarm: {
    label: 'Esteira em alarme',
    detail: 'Falha detectada na Step Function',
  },
  insufficient_data: {
    label: 'Dados insuficientes',
    detail: 'Alarme sem métricas recentes',
  },
  api_degraded: {
    label: 'API degradada',
    detail: 'BFF degradado; verifique logs',
  },
  api_offline: {
    label: 'API indisponível',
    detail: 'Não foi possível contactar o BFF',
  },
};

export function pickPrimaryAlarm(alarms: OpsAlarmItem[]): OpsAlarmItem | null {
  if (alarms.length === 0) {
    return null;
  }
  return (
    alarms.find((a) => a.alarm_name === PRIMARY_SFN_ALARM_NAME) ?? alarms[0]
  );
}

export function deriveEsteiraStatus(
  health: HealthStatusValue,
  primaryAlarm: OpsAlarmItem | null,
): EsteiraStatusViewModel {
  const checked_at = new Date();
  const state = primaryAlarm?.state ?? null;

  if (health === 'offline') {
    return buildVm('api_offline', health, state, false, checked_at, primaryAlarm);
  }
  if (state === 'ALARM') {
    return buildVm('alarm', health, state, false, checked_at, primaryAlarm);
  }
  if (state === 'INSUFFICIENT_DATA') {
    return buildVm('insufficient_data', health, state, false, checked_at, primaryAlarm);
  }
  if (health === 'degraded') {
    return buildVm('api_degraded', health, state, false, checked_at, primaryAlarm);
  }
  return buildVm('operational', health, state, true, checked_at, primaryAlarm);
}

function buildVm(
  level: EsteiraStatusLevel,
  health: HealthStatusValue,
  primary_alarm_state: OpsAlarmItem['state'] | null,
  pipeline_operational: boolean,
  checked_at: Date,
  primaryAlarm: OpsAlarmItem | null,
): EsteiraStatusViewModel {
  const copy = LABELS[level];
  return {
    level,
    label: copy.label,
    detail: copy.detail,
    health,
    primary_alarm_state,
    pipeline_operational,
    checked_at,
    console_alarm_url: primaryAlarm?.alarm_name
      ? buildCloudWatchAlarmConsoleUrl(primaryAlarm.alarm_name)
      : undefined,
  };
}
