import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';

import { buildMockOpsAlarmsResponse } from './data/ops-alarms-mock.data';
import { OpsAlarmsResult } from './models/ops-alarms.model';
import { OpsAlarmsApiService } from './ops-alarms-api.service';

@Injectable({ providedIn: 'root' })
export class OpsAlarmsFacadeService {
  private readonly api = inject(OpsAlarmsApiService);

  loadAlarms(forceDemoAlarm = false): Observable<OpsAlarmsResult> {
    return this.api.getAlarms().pipe(
      map((response) => ({
        response,
        data_source: 'api' as const,
        loaded_at: new Date(),
      })),
      catchError(() => of(this.mockResult(forceDemoAlarm))),
    );
  }

  private mockResult(forceDemoAlarm: boolean): OpsAlarmsResult {
    return {
      response: buildMockOpsAlarmsResponse(forceDemoAlarm),
      data_source: 'mock',
      loaded_at: new Date(),
    };
  }
}
