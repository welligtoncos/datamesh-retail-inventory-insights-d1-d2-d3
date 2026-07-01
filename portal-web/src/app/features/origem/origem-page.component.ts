import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';

import { OrigemFacadeService } from '../../core/api/origem-facade.service';
import {
  firstAvailableDt,
  normalizeDt,
} from '../../core/api/origem-partition.util';
import { PREVIEW_PAGE_SIZE } from '../../core/api/origem-preview.util';
import {
  OrigemPartitionsResult,
  OrigemPreviewResult,
} from '../../core/api/models/origem.model';
import { ApiErrorBannerComponent } from '../../shared/components/api-error-banner/api-error-banner.component';
import { OrigemPartitionDetailComponent } from './origem-partition-detail.component';
import { OrigemPartitionsPanelComponent } from './origem-partitions-panel.component';
import { OrigemPreviewTableComponent } from './origem-preview-table.component';

@Component({
  selector: 'app-origem-page',
  standalone: true,
  imports: [
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    ApiErrorBannerComponent,
    OrigemPartitionsPanelComponent,
    OrigemPartitionDetailComponent,
    OrigemPreviewTableComponent,
  ],
  template: `
    <header class="page-header">
      <h1>Origem · extração diária</h1>
      @if (showMockChip()) {
        <mat-chip-set>
          <mat-chip highlighted>Dados de demonstração</mat-chip>
        </mat-chip-set>
      }
    </header>

    <app-api-error-banner [message]="bannerMessage()" [severity]="bannerSeverity()" />

    <div class="origem-layout">
      <aside class="origem-aside">
        <app-origem-partitions-panel
          [partitions]="partitionsResult()?.partitions ?? []"
          [selectedDt]="selectedDt()"
          [loading]="loadingPartitions()"
          (selectDt)="onSelectDt($event)"
        />
      </aside>

      <main class="origem-main">
        @if (!loadingPartitions() && !selectedDt()) {
          <p class="empty-main">Nenhuma partição origem encontrada.</p>
        } @else if (selectedDt()) {
          <app-origem-partition-detail
            [dt]="selectedDt()!"
            [rowCount]="previewKpis().rowCount"
            [storesCount]="previewKpis().storesCount"
            [productsCount]="previewKpis().productsCount"
            [loading]="loadingPreview()"
          />

          @if (!loadingPreview() && previewResult()) {
            <app-origem-preview-table
              [preview]="previewResult()!.preview"
              (pageChange)="onPageChange($event)"
            />
          }
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
    .origem-layout {
      display: grid;
      grid-template-columns: minmax(220px, 280px) 1fr;
      gap: 1.5rem;
      align-items: start;
      margin-top: 1rem;
    }
    .origem-aside {
      border-right: 1px solid rgba(0, 0, 0, 0.08);
      padding-right: 1rem;
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
      .origem-layout {
        grid-template-columns: 1fr;
      }
      .origem-aside {
        border-right: none;
        border-bottom: 1px solid rgba(0, 0, 0, 0.08);
        padding-right: 0;
        padding-bottom: 1rem;
      }
    }
  `,
})
export class OrigemPageComponent implements OnInit {
  private readonly facade = inject(OrigemFacadeService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly loadingPartitions = signal(true);
  readonly loadingPreview = signal(false);
  readonly partitionsResult = signal<OrigemPartitionsResult | null>(null);
  readonly previewResult = signal<OrigemPreviewResult | null>(null);
  readonly previewKpis = computed(() => {
    const preview = this.previewResult()?.preview;
    return {
      rowCount: preview?.row_count ?? 0,
      storesCount: preview?.stores_count ?? 0,
      productsCount: preview?.products_count ?? 0,
    };
  });
  readonly selectedDt = signal<string | null>(null);
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
    return parts?.data_source === 'mock' || preview?.data_source === 'mock';
  }

  refresh(): void {
    this.bannerMessage.set(null);
    this.loadingPartitions.set(true);
    this.facade.loadPartitions().subscribe({
      next: (result) => {
        this.partitionsResult.set(result);
        this.loadingPartitions.set(false);
        if (result.data_source === 'mock') {
          this.bannerSeverity.set('info');
          this.bannerMessage.set(
            'Exibindo dados de demonstração até o BFF estar disponível.',
          );
        }
        const queryDt = this.route.snapshot.queryParamMap.get('dt');
        const initial =
          queryDt && result.partitions.some((p) => p.dt === normalizeDt(queryDt) && p.status === 'available')
            ? normalizeDt(queryDt)
            : firstAvailableDt(result.partitions);
        if (initial) {
          this.selectPartition(initial, 1, this.currentPageSize);
        } else {
          this.selectedDt.set(null);
        }
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

  private selectPartition(dt: string, page: number, pageSize: number): void {
    this.selectedDt.set(normalizeDt(dt));
    this.currentPage = page;
    this.currentPageSize = pageSize;
    this.loadingPreview.set(true);
    this.facade.loadPreview(dt, page, pageSize).subscribe({
      next: (result) => {
        this.previewResult.set(result);
        if (result.data_source === 'mock') {
          this.bannerSeverity.set('info');
          this.bannerMessage.set(
            'Exibindo dados de demonstração até o BFF estar disponível.',
          );
        }
        this.loadingPreview.set(false);
      },
      error: () => {
        this.bannerSeverity.set('error');
        this.bannerMessage.set('Não foi possível carregar o preview desta partição.');
        this.loadingPreview.set(false);
      },
    });
  }
}
