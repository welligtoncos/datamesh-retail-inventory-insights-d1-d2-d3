import { deriveEsteiraStatus, pickPrimaryAlarm } from './esteira-status.util';
import { PRIMARY_SFN_ALARM_NAME } from './models/ops-alarms.model';

describe('esteira-status.util', () => {
  const okAlarm = {
    alarm_name: PRIMARY_SFN_ALARM_NAME,
    state: 'OK' as const,
  };

  const alarmState = {
    alarm_name: PRIMARY_SFN_ALARM_NAME,
    state: 'ALARM' as const,
  };

  it('pickPrimaryAlarm prefers SFN failed alarm', () => {
    const picked = pickPrimaryAlarm([
      { alarm_name: 'other', state: 'OK' },
      okAlarm,
    ]);
    expect(picked?.alarm_name).toBe(PRIMARY_SFN_ALARM_NAME);
  });

  it('deriveEsteiraStatus returns operational when health ok and alarm OK', () => {
    const vm = deriveEsteiraStatus('ok', okAlarm);
    expect(vm.level).toBe('operational');
    expect(vm.pipeline_operational).toBe(true);
    expect(vm.label).toBe('Esteira operacional');
  });

  it('deriveEsteiraStatus returns alarm when primary is ALARM', () => {
    const vm = deriveEsteiraStatus('ok', alarmState);
    expect(vm.level).toBe('alarm');
    expect(vm.pipeline_operational).toBe(false);
  });

  it('deriveEsteiraStatus api_offline always wins over operational', () => {
    const vm = deriveEsteiraStatus('offline', okAlarm);
    expect(vm.level).toBe('api_offline');
    expect(vm.pipeline_operational).toBe(false);
  });

  it('deriveEsteiraStatus returns insufficient_data before degraded', () => {
    const vm = deriveEsteiraStatus('degraded', {
      alarm_name: PRIMARY_SFN_ALARM_NAME,
      state: 'INSUFFICIENT_DATA',
    });
    expect(vm.level).toBe('insufficient_data');
  });

  it('deriveEsteiraStatus returns api_degraded when health degraded and alarm OK', () => {
    const vm = deriveEsteiraStatus('degraded', okAlarm);
    expect(vm.level).toBe('api_degraded');
  });

  it('deriveEsteiraStatus is deterministic for same inputs', () => {
    const a = deriveEsteiraStatus('ok', okAlarm);
    const b = deriveEsteiraStatus('ok', okAlarm);
    expect(a.level).toBe(b.level);
    expect(a.label).toBe(b.label);
    expect(a.pipeline_operational).toBe(b.pipeline_operational);
  });

  it('mock pipeline_operational true iff primary state OK', () => {
    expect(deriveEsteiraStatus('ok', okAlarm).pipeline_operational).toBe(true);
    expect(deriveEsteiraStatus('ok', alarmState).pipeline_operational).toBe(false);
  });
});
