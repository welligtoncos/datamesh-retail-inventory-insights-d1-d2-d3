import { DecimalPipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { EnriquecidoKpis } from '../../core/api/models/enriquecido.model';
import { KpiSummaryCardComponent } from '../../shared/components/kpi-summary-card/kpi-summary-card.component';

@Component({
  selector: 'app-enriquecido-kpi-panel',
  standalone: true,
  imports: [KpiSummaryCardComponent, MatChipsModule, MatProgressSpinnerModule, DecimalPipe],
  template: `
    <section class="kpi-section" [attr.aria-label]="'KPIs dt=' + dt()">
      <h2 class="section-title">KPIs · dt={{ dt() }}</h2>

      @if (loading()) {
        <div class="loading">
          <mat-spinner diameter="32" />
          <p>Carregando KPIs…</p>
        </div>
      } @else if (kpis()) {
        <div class="kpi-grid">
          <app-kpi-summary-card
            title="Receita total"
            [value]="kpis()!.revenue_total"
            format="currency"
          />
          <app-kpi-summary-card
            title="Rupturas"
            [value]="kpis()!.stockout_count ?? 0"
            format="number"
            [subtitle]="'% ruptura: ' + (kpis()!.stockout_pct | number: '1.1-1') + '%'"
          />
          <app-kpi-summary-card
            title="Venda perdida"
            [value]="kpis()!.lost_total ?? 0"
            format="number"
          />
          <app-kpi-summary-card
            title="Linhas"
            [value]="kpis()!.row_count"
            format="number"
            [subtitle]="'Lojas: ' + kpis()!.stores_count"
          />
        </div>
        <mat-chip-set class="weekend-chip">
          <mat-chip [highlighted]="kpis()!.is_weekend">
            Fim de semana: {{ kpis()!.is_weekend ? 'Sim' : 'Não' }}
          </mat-chip>
        </mat-chip-set>
      }
    </section>
  `,
  styles: `
    .section-title {
      margin: 0 0 1rem;
      font-size: 1.1rem;
      font-weight: 500;
    }
    .kpi-section {
      min-width: 0;
      max-width: 100%;
    }
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 1rem;
    }
    .loading {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      color: rgba(0, 0, 0, 0.6);
    }
    .loading p {
      margin: 0;
    }
    .weekend-chip {
      margin-top: 0.75rem;
    }
  `,
})
export class EnriquecidoKpiPanelComponent {
  readonly dt = input.required<string>();
  readonly kpis = input<EnriquecidoKpis | null>(null);
  readonly loading = input(false);
}
