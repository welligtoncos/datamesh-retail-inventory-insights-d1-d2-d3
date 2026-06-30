import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of, switchMap } from 'rxjs';

import { DashboardSummary } from './models/dashboard.model';
import { EnriquecidoKpis } from './models/enriquecido.model';
import { HealthStatusValue } from './models/health.model';
import { EnriquecidoApiService } from './enriquecido-api.service';
import { HealthService } from './health.service';

export const MOCK_DT = '2022-01-01';

export const MOCK_KPIS: EnriquecidoKpis = {
  dt: MOCK_DT,
  row_count: 100,
  revenue_total: 879_026.03,
  stockout_pct: 0,
  products_stockout: 0,
  stores_count: 10,
};

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly healthService = inject(HealthService);
  private readonly enriquecidoApi = inject(EnriquecidoApiService);

  loadSummary(): Observable<DashboardSummary> {
    return this.healthService.checkOnce().pipe(
      switchMap((health) =>
        this.enriquecidoApi.getPartitions().pipe(
          switchMap((partitions) => {
            const dt =
              partitions.latest ??
              (partitions.partitions.length > 0
                ? partitions.partitions[partitions.partitions.length - 1]
                : null);
            if (!dt) {
              return of(this.mockSummary(health.status));
            }
            return this.enriquecidoApi.getKpis(dt).pipe(
              map(
                (kpis): DashboardSummary => ({
                  ultimo_dt: dt,
                  kpis,
                  data_source: 'api',
                  health: health.status,
                }),
              ),
              catchError(() => of(this.mockSummary(health.status))),
            );
          }),
          catchError(() => of(this.mockSummary(health.status))),
        ),
      ),
      catchError(() => of(this.mockSummary('offline'))),
    );
  }

  mockSummary(health: HealthStatusValue): DashboardSummary {
    return {
      ultimo_dt: MOCK_DT,
      kpis: { ...MOCK_KPIS },
      data_source: 'mock',
      health,
    };
  }
}
