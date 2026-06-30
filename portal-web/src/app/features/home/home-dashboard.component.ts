import { Component, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { DashboardService } from '../../core/api/dashboard.service';
import { DashboardSummary } from '../../core/api/models/dashboard.model';
import { ApiErrorBannerComponent } from '../../shared/components/api-error-banner/api-error-banner.component';
import { InsightShortcutCardComponent } from '../../shared/components/insight-shortcut-card/insight-shortcut-card.component';
import { KpiSummaryCardComponent } from '../../shared/components/kpi-summary-card/kpi-summary-card.component';

@Component({
  selector: 'app-home-dashboard',
  standalone: true,
  imports: [
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    ApiErrorBannerComponent,
    KpiSummaryCardComponent,
    InsightShortcutCardComponent,
  ],
  template: `
    <header class="page-header">
      <h1>Resumo do dia</h1>
      @if (summary()?.ultimo_dt) {
        <p class="dt-line">
          Partição enriquecida: <strong>dt={{ summary()!.ultimo_dt }}</strong>
        </p>
      }
      @if (summary()?.data_source === 'mock') {
        <mat-chip-set>
          <mat-chip highlighted>Dados de demonstração</mat-chip>
        </mat-chip-set>
      }
    </header>

    <app-api-error-banner [message]="errorMessage()" [severity]="bannerSeverity()" />

    @if (loading()) {
      <div class="loading">
        <mat-spinner diameter="40" />
        <p>Carregando resumo do dia…</p>
      </div>
    } @else {
      @if (!summary()?.kpis) {
        <p class="empty">Nenhuma partição enriquecida encontrada.</p>
      } @else {
        <section class="kpi-grid" aria-label="Indicadores resumidos">
          <app-kpi-summary-card
            title="Receita total"
            [value]="summary()!.kpis!.revenue_total"
            format="currency"
          />
          <app-kpi-summary-card
            title="% ruptura"
            [value]="summary()!.kpis!.stockout_pct"
            format="percent"
          />
          <app-kpi-summary-card
            title="Produtos em ruptura"
            [value]="summary()!.kpis!.products_stockout"
            format="number"
            [subtitle]="summary()!.kpis!.stores_count + ' lojas'"
          />
        </section>
      }

      <section class="shortcuts" aria-label="Atalhos insights">
        <h2>Atalhos insights</h2>
        <div class="shortcut-grid">
          <app-insight-shortcut-card
            title="D-1 Comercial"
            subtitle="Ranking unidades e receita"
            icon="leaderboard"
            route="/insights/d1"
          />
          <app-insight-shortcut-card
            title="D-2 Ruptura"
            subtitle="Perdas por produto em falta"
            icon="warning"
            route="/insights/d2"
          />
          <app-insight-shortcut-card
            title="D-3 Tendência"
            subtitle="Janela temporal e sazonalidade"
            icon="trending_up"
            route="/insights/d3"
          />
        </div>
      </section>

      <div class="actions">
        <button mat-stroked-button type="button" class="refresh-btn" (click)="refresh()">
          <mat-icon aria-hidden="true">refresh</mat-icon>
          <span>Tentar novamente</span>
        </button>
      </div>
    }
  `,
  styleUrl: './home-dashboard.component.scss',
})
export class HomeDashboardComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);

  readonly loading = signal(true);
  readonly summary = signal<DashboardSummary | null>(null);
  readonly errorMessage = signal<string | null>(null);
  readonly bannerSeverity = signal<'error' | 'info'>('error');

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.bannerSeverity.set('error');
    this.dashboardService.loadSummary().subscribe({
      next: (s) => {
        this.summary.set(s);
        if (s.health === 'offline') {
          this.bannerSeverity.set('error');
          this.errorMessage.set(
            'Não foi possível conectar ao servidor. Verifique sua rede ou tente novamente.',
          );
        } else if (s.data_source === 'mock') {
          this.bannerSeverity.set('info');
          this.errorMessage.set(
            'Exibindo dados de demonstração até o BFF estar disponível.',
          );
        }
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Ocorreu um erro inesperado. Tente novamente.');
        this.loading.set(false);
      },
    });
  }
}
