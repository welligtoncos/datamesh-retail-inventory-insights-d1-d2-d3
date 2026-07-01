import { Component, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router } from '@angular/router';

import { listMockD1Partitions } from '../../../core/api/data/insights-d1-mock.data';
import { MOCK_ENRIQUECIDO_PARTITIONS } from '../../../core/api/data/enriquecido-mock.data';
import { defaultD1Dt, normalizeD1Dt } from '../../../core/api/d1-date.util';
import { EnriquecidoFacadeService } from '../../../core/api/enriquecido-facade.service';
import { InsightsD2FacadeService } from '../../../core/api/insights-d2-facade.service';
import { InsightsD2Response } from '../../../core/api/models/insights-d2.model';
import { ApiErrorBannerComponent } from '../../../shared/components/api-error-banner/api-error-banner.component';
import { InsightDateSelectorComponent } from '../shared/insight-date-selector.component';
import { InsightDownloadButtonComponent } from '../shared/insight-download-button.component';
import { InsightMissingPartitionBannerComponent } from '../shared/insight-missing-partition-banner.component';
import { InsightPanelComponent } from '../shared/insight-panel.component';
import { D2RupturasTableComponent } from './d2-rupturas-table.component';

@Component({
  selector: 'app-insights-d2-page',
  standalone: true,
  imports: [
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    ApiErrorBannerComponent,
    InsightDateSelectorComponent,
    InsightPanelComponent,
    D2RupturasTableComponent,
    InsightDownloadButtonComponent,
    InsightMissingPartitionBannerComponent,
  ],
  template: `
    <header class="page-header">
      <div class="title-row">
        <h1>Insight D-2 · Ruptura</h1>
        @if (showMockChip()) {
          <mat-chip-set>
            <mat-chip highlighted>Dados de demonstração</mat-chip>
          </mat-chip-set>
        }
      </div>

      <div class="toolbar">
        <app-insight-date-selector
          [partitions]="partitions()"
          [selectedDt]="selectedDt()"
          [dataExecucao]="insight()?.data_execucao ?? null"
          [loading]="loading()"
          (dtChange)="onDtChange($event)"
        />
        <app-insight-download-button
          [dt]="selectedDt() ?? ''"
          [disabled]="!canDownload()"
          [downloadLoader]="d2DownloadLoader"
          (downloadError)="onDownloadError($event)"
        />
      </div>
    </header>

    <app-api-error-banner [message]="bannerMessage()" [severity]="bannerSeverity()" />

    @if (loading()) {
      <div class="loading-wrap" aria-live="polite">
        <mat-spinner diameter="40" />
        <p>Carregando insight D-2…</p>
      </div>
    } @else if (insight()) {
      @if (!insight()!.partition_exists) {
        <app-insight-missing-partition-banner [dt]="insight()!.dt" insightCode="D-2" />
      } @else {
        <app-insight-panel [insightText]="insight()!.insight_text" theme="red" />
        <app-d2-rupturas-table [rows]="insight()!.rows" [totalLost]="insight()!.total_lost" />
      }
    }

    <div class="actions">
      <button mat-stroked-button type="button" class="refresh-btn" (click)="refresh()">
        <mat-icon aria-hidden="true">refresh</mat-icon>
        <span>Tentar novamente</span>
      </button>
    </div>
  `,
  styles: `
    .page-header {
      min-width: 0;
    }
    .title-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.75rem;
    }
    .title-row h1 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 500;
    }
    .toolbar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      min-width: 0;
    }
    .loading-wrap {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
      margin: 2rem 0;
      color: rgba(0, 0, 0, 0.6);
    }
    .actions {
      margin-top: 1.25rem;
    }
    .refresh-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
    }
    .refresh-btn mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }
    @media (max-width: 959px) {
      .toolbar {
        flex-direction: column;
        align-items: stretch;
      }
    }
  `,
})
export class InsightsD2PageComponent implements OnInit {
  private readonly facade = inject(InsightsD2FacadeService);
  private readonly enriquecidoFacade = inject(EnriquecidoFacadeService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly loading = signal(true);
  readonly insight = signal<InsightsD2Response | null>(null);
  readonly selectedDt = signal<string | null>(null);
  readonly partitions = signal<string[]>(listMockD1Partitions());
  readonly dataSource = signal<'api' | 'mock'>('mock');
  readonly bannerMessage = signal<string | null>(null);
  readonly bannerSeverity = signal<'error' | 'info'>('info');

  readonly d2DownloadLoader = (dt: string) => this.facade.getDownload(dt);

  ngOnInit(): void {
    this.refresh();
  }

  showMockChip(): boolean {
    return this.dataSource() === 'mock';
  }

  canDownload(): boolean {
    const data = this.insight();
    return Boolean(data?.partition_exists && this.selectedDt());
  }

  refresh(): void {
    this.bannerMessage.set(null);
    this.loading.set(true);

    this.enriquecidoFacade.loadPartitions().subscribe({
      next: (result) => {
        const parts =
          result.partitions.length > 0 ? result.partitions : listMockD1Partitions();
        this.partitions.set(parts);

        const queryDt = this.route.snapshot.queryParamMap.get('dt');
        const latest = result.latest ?? MOCK_ENRIQUECIDO_PARTITIONS.latest;
        const initial =
          queryDt && parts.includes(normalizeD1Dt(queryDt))
            ? normalizeD1Dt(queryDt)
            : defaultD1Dt(parts, latest);

        if (initial) {
          this.loadInsight(initial);
        } else {
          this.loading.set(false);
          this.insight.set(null);
        }
      },
      error: () => {
        this.partitions.set(listMockD1Partitions());
        const initial = defaultD1Dt(listMockD1Partitions(), MOCK_ENRIQUECIDO_PARTITIONS.latest);
        if (initial) {
          this.loadInsight(initial);
        } else {
          this.loading.set(false);
        }
      },
    });
  }

  onDtChange(dt: string): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { dt },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
    this.loadInsight(dt);
  }

  onDownloadError(message: string): void {
    this.bannerSeverity.set('error');
    this.bannerMessage.set(message);
  }

  private loadInsight(dt: string): void {
    const normalized = normalizeD1Dt(dt);
    this.selectedDt.set(normalized);
    this.loading.set(true);

    this.facade.loadInsight(normalized).subscribe({
      next: (result) => {
        this.insight.set(result.insight);
        this.dataSource.set(result.data_source);
        this.loading.set(false);
        if (result.data_source === 'mock') {
          this.setMockBanner();
        }
      },
      error: () => {
        this.bannerSeverity.set('error');
        this.bannerMessage.set('Não foi possível carregar o insight D-2.');
        this.loading.set(false);
      },
    });
  }

  private setMockBanner(): void {
    this.bannerSeverity.set('info');
    this.bannerMessage.set('Exibindo dados de demonstração até o BFF estar disponível.');
  }
}
