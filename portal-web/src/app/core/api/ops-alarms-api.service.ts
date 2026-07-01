import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { OpsAlarmsResponse } from './models/ops-alarms.model';

@Injectable({ providedIn: 'root' })
export class OpsAlarmsApiService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiBaseUrl.replace(/\/$/, '');

  getAlarms(): Observable<OpsAlarmsResponse> {
    return this.http.get<OpsAlarmsResponse>(`${this.base}/ops/alarms`);
  }
}
