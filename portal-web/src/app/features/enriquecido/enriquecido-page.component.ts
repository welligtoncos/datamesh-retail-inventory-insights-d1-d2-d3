import { Component, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { EnriquecidoFacadeService } from '../../core/api/enriquecido-facade.service';
import {
  defaultComparePair,
  firstEnriquecidoDt,
  normalizeEnriquecidoDt,
} from '../../core/api/enriquecido-partition.util';
import { PREVIEW_PAGE_SIZE } from '../../core/api/origem-preview.util';
import {
  EnriquecidoCompareResult,
  EnriquecidoKpis,
  EnriquecidoPartitionsResult,
  EnriquecidoPreviewResult,
} from '../../core/api/models/enriquecido.model';
import { ApiErrorBannerComponent } from '../../shared/components/api-error-banner/api-error-banner.component';
import { EnriquecidoComparePanelComponent } from './enriquecido-compare-panel.component';
import { EnriquecidoKpiPanelComponent } from './enriquecido-kpi-panel.component';
import { EnriquecidoPartitionsPanelComponent } from './enriquecido-partitions-panel.component';
import { EnriquecidoPreviewTableComponent } from './enriquecido-preview-table.component';

@Component({
  selector: 'app-enriquecido-page',
  standalone: true,
  imports: [
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    RouterLink,
    ApiErrorBannerComponent,
    EnriquecidoPartitionsPanelComponent,
    EnriquecidoKpiPanelComponent,
    EnriquecidoPreviewTableComponent,
    EnriquecidoComparePanelComponent,
  ],
  template: `
    <header class="page-header">
      <div class="title-row">
        <h1>Enriquecido · métricas derivadas</h1>
        @if (showMockChip()) {
          <mat-chip-set>
            <mat-chip highlighted>Dados de demonstração</mat-chip>
          </mat-chip-set>
        }
        @if (selectedDt()) {
          <a
            mat-stroked-button
            routerLink="/enriquecido/athena"
            [queryParams]="{ dt: selectedDt() }"
            class="athena-link"
          >
            Consultas Athena
          </a>
        }
      </div>
    </header>

    <app-api-error-banner [message]="bannerMessage()" [severity]="bannerSeverity()" />

    <div class="enr-layout">
      <aside class="enr-aside">
        <app-enriquecido-partitions-panel
          [partitions]="partitionsResult()?.partitions ?? []"
          [selectedDt]="selectedDt()"
          [loading]="loadingPartitions()"
          (selectDt)="onSelectDt($event)"
        />
      </aside>

      <main class="enr-main">
        @if (!loadingPartitions() && !selectedDt()) {
          <p class="empty-main">Nenhuma partição enriquecida encontrada.</p>
        } @else if (selectedDt()) {
          <app-enriquecido-kpi-panel
            [dt]="selectedDt()!"
            [kpis]="kpis()"
            [loading]="loadingDetail()"
          />

          @if (!loadingDetail() && previewResult()) {
            <app-enriquecido-preview-table
              [preview]="previewResult()!.preview"
              (pageChange)="onPageChange($event)"
            />
          }

          <app-enriquecido-compare-panel
            [partitions]="partitionsResult()?.partitions ?? []"
            [dtA]="compareDtA()"
            [dtB]="compareDtB()"
            [rows]="compareResult()?.rows ?? []"
            [loading]="loadingCompare()"
            (compareChange)="onCompareChange($event)"
          />
        }
      </main>
    </div>

    <div class="actions">
      <button mat-stroked-button type="button" class="refresh-btn" (click)="refresh()">
        <mat-icon aria-hidden="true">refresh</mat-icon>
        <span>Tentar novamente</span>
      </button>
    </div>
  `,
  styles: `
    .page-header h1 {
      margin: 0 0 0.5rem;
      font-size: 1.5rem;
      font-weight: 500;
    }
    .title-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.75rem;
    }
    .title-row h1 {
      margin: 0;
    }
    .athena-link {
      margin-left: auto;
    }
    .enr-layout {
      display: grid;
      grid-template-columns: minmax(200px, 280px) minmax(0, 1fr);
      gap: 1.5rem;
      align-items: start;
      margin-top: 1rem;
      width: 100%;
      min-width: 0;
    }
    .enr-aside {
      border-right: 1px solid rgba(0, 0, 0, 0.08);
      padding-right: 1rem;
      min-width: 0;
    }
    .enr-main {
      min-width: 0;
      overflow: hidden;
    }
    .empty-main {
      color: rgba(0, 0, 0, 0.6);
      margin: 1rem 0;
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
      .enr-layout {
        grid-template-columns: 1fr;
      }
      .enr-aside {
        border-right: none;
        border-bottom: 1px solid rgba(0, 0, 0, 0.08);
        padding-right: 0;
        padding-bottom: 1rem;
      }
    }
  `,
})
export class EnriquecidoPageComponent implements OnInit {
  private readonly facade = inject(EnriquecidoFacadeService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly loadingPartitions = signal(true);
  readonly loadingDetail = signal(false);
  readonly loadingCompare = signal(false);
  readonly partitionsResult = signal<EnriquecidoPartitionsResult | null>(null);
  readonly kpis = signal<EnriquecidoKpis | null>(null);
  readonly previewResult = signal<EnriquecidoPreviewResult | null>(null);
  readonly compareResult = signal<EnriquecidoCompareResult | null>(null);
  readonly selectedDt = signal<string | null>(null);
  readonly compareDtA = signal<string | null>(null);
  readonly compareDtB = signal<string | null>(null);
  readonly bannerMessage = signal<string | null>(null);
  readonly bannerSeverity = signal<'error' | 'info'>('info');

  private currentPage = 1;
  private currentPageSize = PREVIEW_PAGE_SIZE;

  ngOnInit(): void {
    this.refresh();
  }

  showMockChip(): boolean {
    const parts = this.partitionsResult();
    const preview = this.previewResult();
    const compare = this.compareResult();
    return (
      parts?.data_source === 'mock' ||
      preview?.data_source === 'mock' ||
      compare?.data_source === 'mock'
    );
  }

  refresh(): void {
    this.bannerMessage.set(null);
    this.loadingPartitions.set(true);
    this.facade.loadPartitions().subscribe({
      next: (result) => {
        this.partitionsResult.set(result);
        this.loadingPartitions.set(false);
        if (result.data_source === 'mock') {
          this.setMockBanner();
        }

        const queryDt = this.route.snapshot.queryParamMap.get('dt');
        const initial =
          queryDt && result.partitions.includes(normalizeEnriquecidoDt(queryDt))
            ? normalizeEnriquecidoDt(queryDt)
            : firstEnriquecidoDt(result.partitions);

        const compareA = this.route.snapshot.queryParamMap.get('compare_a');
        const compareB = this.route.snapshot.queryParamMap.get('compare_b');
        const pair = defaultComparePair(result.partitions);
        this.compareDtA.set(
          compareA && result.partitions.includes(compareA) ? compareA : pair.dt_a,
        );
        this.compareDtB.set(
          compareB && result.partitions.includes(compareB) ? compareB : pair.dt_b,
        );

        if (initial) {
          this.selectPartition(initial, 1, this.currentPageSize);
        } else {
          this.selectedDt.set(null);
        }

        this.loadCompareIfReady();
      },
      error: () => {
        this.bannerSeverity.set('error');
        this.bannerMessage.set('Ocorreu um erro inesperado. Tente novamente.');
        this.loadingPartitions.set(false);
      },
    });
  }

  onSelectDt(dt: string): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { dt },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
    this.selectPartition(dt, 1, this.currentPageSize);
  }

  onPageChange(event: { page: number; pageSize: number }): void {
    const dt = this.selectedDt();
    if (!dt) {
      return;
    }
    this.selectPartition(dt, event.page, event.pageSize);
  }

  onCompareChange(event: { dt_a: string; dt_b: string }): void {
    this.compareDtA.set(event.dt_a);
    this.compareDtB.set(event.dt_b);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { compare_a: event.dt_a, compare_b: event.dt_b },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
    this.loadCompare(event.dt_a, event.dt_b);
  }

  private selectPartition(dt: string, page: number, pageSize: number): void {
    const normalized = normalizeEnriquecidoDt(dt);
    this.selectedDt.set(normalized);
    this.currentPage = page;
    this.currentPageSize = pageSize;
    this.loadingDetail.set(true);

    forkJoin({
      kpis: this.facade.loadKpis(normalized),
      preview: this.facade.loadPreview(normalized, page, pageSize),
    }).subscribe({
      next: ({ kpis, preview }) => {
        this.kpis.set(kpis.kpis);
        this.previewResult.set(preview);
        if (kpis.data_source === 'mock' || preview.data_source === 'mock') {
          this.setMockBanner();
        }
        this.loadingDetail.set(false);
      },
      error: () => {
        this.bannerSeverity.set('error');
        this.bannerMessage.set('Não foi possível carregar os dados desta partição.');
        this.loadingDetail.set(false);
      },
    });
  }

  private loadCompareIfReady(): void {
    const a = this.compareDtA();
    const b = this.compareDtB();
    if (a && b && a !== b) {
      this.loadCompare(a, b);
    }
  }

  private loadCompare(dtA: string, dtB: string): void {
    this.loadingCompare.set(true);
    this.facade.loadCompare(dtA, dtB).subscribe({
      next: (result) => {
        this.compareResult.set(result);
        if (result.data_source === 'mock') {
          this.setMockBanner();
        }
        this.loadingCompare.set(false);
      },
      error: () => {
        this.bannerSeverity.set('error');
        this.bannerMessage.set('Não foi possível carregar o comparativo.');
        this.loadingCompare.set(false);
      },
    });
  }

  private setMockBanner(): void {
    this.bannerSeverity.set('info');
    this.bannerMessage.set('Exibindo dados de demonstração até o BFF estar disponível.');
  }
}
