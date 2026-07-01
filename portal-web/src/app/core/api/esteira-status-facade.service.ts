import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, map } from 'rxjs';

import { deriveEsteiraStatus, pickPrimaryAlarm } from './esteira-status.util';
import { EsteiraStatusResult } from './models/esteira-status.model';
import { HealthService } from './health.service';
import { OpsAlarmsFacadeService } from './ops-alarms-facade.service';

@Injectable({ providedIn: 'root' })
export class EsteiraStatusFacadeService {
  private readonly healthService = inject(HealthService);
  private readonly opsAlarmsFacade = inject(OpsAlarmsFacadeService);

  loadStatus(options?: { demoAlarm?: boolean }): Observable<EsteiraStatusResult> {
    const demoAlarm = options?.demoAlarm ?? false;
    return forkJoin({
      health: this.healthService.checkOnce(),
      alarms: this.opsAlarmsFacade.loadAlarms(demoAlarm),
    }).pipe(
      map(({ health, alarms }) => {
        const primary = pickPrimaryAlarm(alarms.response.alarms);
        return {
          status: deriveEsteiraStatus(health.status, primary),
          data_source: alarms.data_source,
          loaded_at: new Date(),
        };
      }),
    );
  }
}
