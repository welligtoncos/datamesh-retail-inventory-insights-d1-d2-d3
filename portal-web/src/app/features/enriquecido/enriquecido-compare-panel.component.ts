import { DecimalPipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';

import { EnriquecidoCompareRow } from '../../core/api/models/enriquecido.model';

@Component({
  selector: 'app-enriquecido-compare-panel',
  standalone: true,
  imports: [
    DecimalPipe,
    MatFormFieldModule,
    MatSelectModule,
    MatTableModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <section class="compare" aria-label="Comparar dias">
      <h3 class="compare-title">Comparar dias</h3>

      @if (!canCompare()) {
        <p class="hint">É necessário ao menos duas partições para comparar.</p>
      } @else {
        <div class="selectors">
          <mat-form-field appearance="outline" class="dt-field">
            <mat-label>dt A</mat-label>
            <mat-select [value]="dtA()" (valueChange)="onDtAChange($event)">
              @for (dt of partitions(); track dt) {
                <mat-option [value]="dt">dt={{ dt }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline" class="dt-field">
            <mat-label>dt B</mat-label>
            <mat-select [value]="dtB()" (valueChange)="onDtBChange($event)">
              @for (dt of partitions(); track dt) {
                <mat-option [value]="dt">dt={{ dt }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
        </div>

        @if (loading()) {
          <div class="loading">
            <mat-spinner diameter="28" />
            <span>Carregando comparativo…</span>
          </div>
        } @else if (rows().length) {
          <div class="table-wrap">
            <table mat-table [dataSource]="rows()" aria-label="Delta KPIs">
              <ng-container matColumnDef="label">
                <th mat-header-cell *matHeaderCellDef>Métrica</th>
                <td mat-cell *matCellDef="let row">{{ row.label }}</td>
              </ng-container>
              <ng-container matColumnDef="value_a">
                <th mat-header-cell *matHeaderCellDef class="col-num">dt A</th>
                <td mat-cell *matCellDef="let row" class="col-num">
                  {{ formatValue(row.value_a) }}
                </td>
              </ng-container>
              <ng-container matColumnDef="value_b">
                <th mat-header-cell *matHeaderCellDef class="col-num">dt B</th>
                <td mat-cell *matCellDef="let row" class="col-num">
                  {{ formatValue(row.value_b) }}
                </td>
              </ng-container>
              <ng-container matColumnDef="delta">
                <th mat-header-cell *matHeaderCellDef class="col-num">Δ</th>
                <td
                  mat-cell
                  *matCellDef="let row"
                  class="col-num"
                  [class.delta-up]="row.delta > 0"
                  [class.delta-down]="row.delta < 0"
                >
                  {{ formatValue(row.delta) }}
                </td>
              </ng-container>
              <ng-container matColumnDef="delta_pct">
                <th mat-header-cell *matHeaderCellDef class="col-num">Δ%</th>
                <td mat-cell *matCellDef="let row" class="col-num">
                  {{ row.delta_pct === null ? '—' : (row.delta_pct | number: '1.1-1') + '%' }}
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
            </table>
          </div>
        }
      }
    </section>
  `,
  styles: `
    .compare-title {
      margin: 1.5rem 0 0.75rem;
      font-size: 1rem;
      font-weight: 500;
    }
    .hint {
      color: rgba(0, 0, 0, 0.6);
      font-size: 0.9rem;
    }
    .selectors {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      margin-bottom: 1rem;
      max-width: 100%;
    }
    .dt-field {
      min-width: 0;
      flex: 1 1 160px;
      max-width: 100%;
    }
    .loading {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      color: rgba(0, 0, 0, 0.6);
    }
    .table-wrap {
      overflow-x: auto;
      max-width: 100%;
      -webkit-overflow-scrolling: touch;
    }
    table {
      width: 100%;
      min-width: 480px;
    }
    .col-num {
      text-align: right;
    }
    .delta-up {
      color: #2e7d32;
    }
    .delta-down {
      color: #c62828;
    }
  `,
})
export class EnriquecidoComparePanelComponent {
  readonly partitions = input.required<string[]>();
  readonly dtA = input<string | null>(null);
  readonly dtB = input<string | null>(null);
  readonly rows = input<EnriquecidoCompareRow[]>([]);
  readonly loading = input(false);

  readonly compareChange = output<{ dt_a: string; dt_b: string }>();

  readonly displayedColumns = ['label', 'value_a', 'value_b', 'delta', 'delta_pct'];

  canCompare(): boolean {
    return this.partitions().length >= 2;
  }

  onDtAChange(dt: string): void {
    const dtB = this.dtB();
    if (dtB && dt !== dtB) {
      this.compareChange.emit({ dt_a: dt, dt_b: dtB });
    }
  }

  onDtBChange(dt: string): void {
    const dtA = this.dtA();
    if (dtA && dt !== dtA) {
      this.compareChange.emit({ dt_a: dtA, dt_b: dt });
    }
  }

  formatValue(value: number): string {
    if (Math.abs(value) >= 1000) {
      return new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(value);
    }
    return String(value);
  }
}
