import { Component, input } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { KpiSummaryCardComponent } from '../../shared/components/kpi-summary-card/kpi-summary-card.component';

@Component({
  selector: 'app-origem-partition-detail',
  standalone: true,
  imports: [KpiSummaryCardComponent, MatProgressSpinnerModule],
  template: `
    <section class="detail" [attr.aria-label]="'Detalhe dt=' + dt()">
      <h2 class="detail-title">Detalhe · dt={{ dt() }}</h2>

      @if (loading()) {
        <div class="loading">
          <mat-spinner diameter="32" />
          <p>Carregando preview…</p>
        </div>
      } @else {
        <div class="kpi-grid">
          <app-kpi-summary-card title="Linhas" [value]="rowCount()" format="number" />
          <app-kpi-summary-card
            title="Lojas distintas"
            [value]="storesCount()"
            format="number"
          />
          <app-kpi-summary-card
            title="Produtos distintos"
            [value]="productsCount()"
            format="number"
          />
        </div>
      }
    </section>
  `,
  styles: `
    .detail-title {
      margin: 0 0 1rem;
      font-size: 1.1rem;
      font-weight: 500;
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
  `,
})
export class OrigemPartitionDetailComponent {
  readonly dt = input.required<string>();
  readonly rowCount = input(0);
  readonly storesCount = input(0);
  readonly productsCount = input(0);
  readonly loading = input(false);
}
