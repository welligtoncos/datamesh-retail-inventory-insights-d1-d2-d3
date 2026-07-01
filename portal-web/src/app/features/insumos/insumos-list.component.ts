import { Component, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { InsumosFacadeService } from '../../core/api/insumos-facade.service';
import { InsumosListResult } from '../../core/api/models/insumo.model';
import { ApiErrorBannerComponent } from '../../shared/components/api-error-banner/api-error-banner.component';
import { InsumosEmptyStateComponent } from './insumos-empty-state.component';
import { InsumosTableComponent } from './insumos-table.component';
import { UploadPhase2NoticeComponent } from './upload-phase2-notice.component';

@Component({
  selector: 'app-insumos-list',
  standalone: true,
  imports: [
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    MatProgressBarModule,
    ApiErrorBannerComponent,
    UploadPhase2NoticeComponent,
    InsumosEmptyStateComponent,
    InsumosTableComponent,
  ],
  template: `
    <header class="page-header">
      <h1>Insumos</h1>
      @if (result(); as r) {
        <p class="count">{{ r.items.length }} arquivo(s) em {{ r.prefix }}</p>
        @if (r.data_source === 'mock') {
          <mat-chip-set>
            <mat-chip highlighted>Dados de demonstração</mat-chip>
          </mat-chip-set>
        }
      }
    </header>

    <app-upload-phase2-notice />

    <app-api-error-banner [message]="bannerMessage()" [severity]="bannerSeverity()" />

    @if (loading()) {
      <mat-progress-bar mode="indeterminate" />
      <p class="loading-text">Carregando insumos…</p>
    } @else {
      @if (result()?.items?.length === 0) {
        <app-insumos-empty-state />
      } @else if (result()?.items?.length) {
        <app-insumos-table [items]="result()!.items" />
      }

      <div class="actions">
        <button mat-stroked-button type="button" class="refresh-btn" (click)="refresh()">
          <mat-icon aria-hidden="true">refresh</mat-icon>
          <span>Tentar novamente</span>
        </button>
      </div>
    }
  `,
  styles: `
    .page-header h1 {
      margin: 0 0 0.35rem;
      font-size: 1.5rem;
      font-weight: 500;
    }
    .count {
      margin: 0 0 0.5rem;
      color: rgba(0, 0, 0, 0.65);
      font-size: 0.9rem;
    }
    .loading-text {
      margin: 1rem 0;
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
  `,
})
export class InsumosListComponent implements OnInit {
  private readonly facade = inject(InsumosFacadeService);

  readonly loading = signal(true);
  readonly result = signal<InsumosListResult | null>(null);
  readonly bannerMessage = signal<string | null>(null);
  readonly bannerSeverity = signal<'error' | 'info'>('info');

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.loading.set(true);
    this.bannerMessage.set(null);
    this.facade.loadInsumos().subscribe({
      next: (r) => {
        this.result.set(r);
        if (r.data_source === 'mock') {
          this.bannerSeverity.set('info');
          this.bannerMessage.set(
            'Exibindo dados de demonstração até o BFF estar disponível.',
          );
        }
        this.loading.set(false);
      },
      error: () => {
        this.bannerSeverity.set('error');
        this.bannerMessage.set('Ocorreu um erro inesperado. Tente novamente.');
        this.loading.set(false);
      },
    });
  }
}
