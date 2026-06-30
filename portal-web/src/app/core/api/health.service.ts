import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of, shareReplay, switchMap, timer } from 'rxjs';

import { environment } from '../../../environments/environment';
import { HealthStatus, HealthStatusValue } from './models/health.model';

const POLL_MS = 60_000;

@Injectable({ providedIn: 'root' })
export class HealthService {
  private readonly http = inject(HttpClient);
  private readonly healthUrl = `${environment.apiBaseUrl.replace(/\/$/, '')}/health`;

  private readonly poll$ = timer(0, POLL_MS).pipe(
    switchMap(() => this.checkOnce()),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  watch(): Observable<HealthStatus> {
    return this.poll$;
  }

  checkOnce(): Observable<HealthStatus> {
    return this.http.get(this.healthUrl, { responseType: 'text', observe: 'response' }).pipe(
      map((res) => {
        const ok = res.status >= 200 && res.status < 300;
        const degraded =
          typeof res.body === 'string' && res.body.toLowerCase().includes('degraded');
        const status: HealthStatusValue = !ok ? 'offline' : degraded ? 'degraded' : 'ok';
        return { status, checked_at: new Date() };
      }),
      catchError(() => of(this.offlineStatus())),
    );
  }

  private offlineStatus(): HealthStatus {
    return { status: 'offline', checked_at: new Date() };
  }
}
