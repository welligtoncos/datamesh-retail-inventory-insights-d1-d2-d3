import { Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-kpi-summary-card',
  standalone: true,
  imports: [MatCardModule],
  template: `
    <mat-card class="kpi-card">
      <mat-card-header>
        <mat-card-title>{{ title() }}</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <p class="value">{{ formattedValue() }}</p>
        @if (subtitle()) {
          <p class="subtitle">{{ subtitle() }}</p>
        }
      </mat-card-content>
    </mat-card>
  `,
  styles: `
    .kpi-card {
      height: 100%;
    }
    .value {
      font-size: 1.5rem;
      font-weight: 500;
      margin: 0.5rem 0 0;
    }
    .subtitle {
      margin: 0.25rem 0 0;
      font-size: 0.85rem;
      color: rgba(0, 0, 0, 0.54);
    }
  `,
})
export class KpiSummaryCardComponent {
  readonly title = input.required<string>();
  readonly value = input.required<string | number>();
  readonly format = input<'currency' | 'percent' | 'number'>('number');
  readonly subtitle = input<string | null>(null);

  formattedValue(): string {
    const v = this.value();
    if (this.format() === 'currency' && typeof v === 'number') {
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
    }
    if (this.format() === 'percent' && typeof v === 'number') {
      return `${v.toFixed(1)}%`;
    }
    return String(v);
  }
}
