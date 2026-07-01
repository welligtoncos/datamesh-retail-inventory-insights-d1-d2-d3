# NFR Design · U8 Portal Web Ops Alarms + Health (E8-US10)

**Data:** 2026-06-30

---

## esteira-status.util

```typescript
export function deriveEsteiraStatus(
  health: HealthStatusValue,
  primaryAlarm: OpsAlarmItem | null,
): EsteiraStatusViewModel {
  const checked_at = new Date();
  const state = primaryAlarm?.state ?? null;

  if (health === 'offline') {
    return buildVm('api_offline', health, state, false, checked_at);
  }
  if (state === 'ALARM') {
    return buildVm('alarm', health, state, false, checked_at);
  }
  if (state === 'INSUFFICIENT_DATA') {
    return buildVm('insufficient_data', health, state, false, checked_at);
  }
  if (health === 'degraded') {
    return buildVm('api_degraded', health, state, false, checked_at);
  }
  return buildVm('operational', health, state, true, checked_at);
}
```

---

## OpsAlarmsFacadeService

```typescript
loadAlarms(forceDemoAlarm = false): Observable<OpsAlarmsResult> {
  return this.api.getAlarms().pipe(
    map(/* api */),
    catchError(() => of(this.mockResult(forceDemoAlarm))),
  );
}
```

Mock primary alarm:
```typescript
{
  alarm_name: 'retail-inventory-insights-processar-dia-failed-dev',
  state: forceDemoAlarm ? 'ALARM' : 'OK',
  metric: 'ExecutionsFailed',
  updated_at: new Date().toISOString(),
}
```

---

## EsteiraStatusFacadeService

```typescript
loadStatus(options?: { demoAlarm?: boolean }): Observable<EsteiraStatusResult> {
  return forkJoin({
    health: this.healthService.checkOnce(),
    alarms: this.opsAlarmsFacade.loadAlarms(options?.demoAlarm ?? false),
  }).pipe(
    map(({ health, alarms }) => ({
      status: deriveEsteiraStatus(
        health.status,
        pickPrimaryAlarm(alarms.response.alarms),
      ),
      data_source: alarms.data_source === 'api' && health ? 'api' : 'mock',
      loaded_at: new Date(),
    })),
  );
}
```

---

## EsteiraStatusCardComponent

- Input: nenhum (self-contained com facade)
- Poll: `interval(60_000)` + `startWith(0)` após `ngOnInit`
- Query param: `ActivatedRoute.queryParamMap` → `alarm=demo`
- Template: `mat-card` com ícone `check_circle` / `warning` / `cloud_off`
- Link opcional: `buildCloudWatchAlarmConsoleUrl(alarm_name, region)`

---

## cloudwatch-console-url.util

```typescript
export function buildCloudWatchAlarmConsoleUrl(
  alarmName: string,
  region = 'us-east-1',
): string {
  return `https://${region}.console.aws.amazon.com/cloudwatch/home?region=${region}#alarmsV2:alarm/${encodeURIComponent(alarmName)}`;
}
```

---

## HomeDashboardComponent (alteração mínima)

```html
<app-esteira-status-card />
<!-- KPIs e atalhos existentes -->
```

`refresh()` chama `@ViewChild` `esteiraCard.refresh()` ou shared subject — preferir card autônomo com botão próprio “Atualizar status” **ou** `input` trigger do pai.

**Decisão Part 2:** card autônomo com poll; botão “Atualizar” da home também dispara `esteiraCard.refresh()` via `viewChild`.

---

## Extension compliance (design)

| Extension | Implementação |
|-----------|---------------|
| Security | JWT alarms; health público |
| Resiliency | catchError → mock; destroy poll |
| PBT | `esteira-status.util.spec.ts` |
