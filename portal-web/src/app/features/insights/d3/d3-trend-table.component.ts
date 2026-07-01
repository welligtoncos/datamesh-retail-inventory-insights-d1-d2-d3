import {
  Component,
  computed,
  effect,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { DecimalPipe, PercentPipe } from '@angular/common';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';

import { D3TrendRow } from '../../../core/api/models/insights-d3.model';

const DISPLAYED_COLUMNS = [
  'store_id',
  'product_id',
  'category',
  'avg_weekday',
  'avg_weekend',
  'trend_pct',
  'trend_label',
] as const;

@Component({
  selector: 'app-d3-trend-table',
  standalone: true,
  imports: [MatTableModule, MatPaginatorModule, DecimalPipe, PercentPipe],
  template: `
    <section class="trends" aria-label="Tendências D-3">
      <h3 class="table-title">
        Tendência loja × produto
        @if (summary()) {
          <span class="summary-hint">{{ summary() }}</span>
        }
      </h3>

      @if (rows().length === 0) {
        <p class="empty-hint">Nenhum dado na janela selecionada.</p>
      } @else {
        <div class="table-scroll">
          <table mat-table [dataSource]="pagedRows()" aria-label="Tabela tendências D-3">
            <ng-container matColumnDef="store_id">
              <th mat-header-cell *matHeaderCellDef>Loja</th>
              <td mat-cell *matCellDef="let row">{{ row.store_id }}</td>
            </ng-container>

            <ng-container matColumnDef="product_id">
              <th mat-header-cell *matHeaderCellDef>Produto</th>
              <td mat-cell *matCellDef="let row">{{ row.product_id }}</td>
            </ng-container>

            <ng-container matColumnDef="category">
              <th mat-header-cell *matHeaderCellDef>Categoria</th>
              <td mat-cell *matCellDef="let row">{{ row.category }}</td>
            </ng-container>

            <ng-container matColumnDef="avg_weekday">
              <th mat-header-cell *matHeaderCellDef>Média úteis</th>
              <td mat-cell *matCellDef="let row">{{ row.avg_weekday | number: '1.1-1' }}</td>
            </ng-container>

            <ng-container matColumnDef="avg_weekend">
              <th mat-header-cell *matHeaderCellDef>Média FDS</th>
              <td mat-cell *matCellDef="let row">{{ row.avg_weekend | number: '1.1-1' }}</td>
            </ng-container>

            <ng-container matColumnDef="trend_pct">
              <th mat-header-cell *matHeaderCellDef>Variação</th>
              <td mat-cell *matCellDef="let row">{{ row.trend_pct / 100 | percent: '1.1-1' }}</td>
            </ng-container>

            <ng-container matColumnDef="trend_label">
              <th mat-header-cell *matHeaderCellDef>Tendência</th>
              <td mat-cell *matCellDef="let row" [class.subindo]="row.trend_label === 'Subindo'"
                [class.caindo]="row.trend_label === 'Caindo'">
                {{ row.trend_label }}
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
          </table>
        </div>

        <mat-paginator
          [length]="rows().length"
          [pageIndex]="pageIndex()"
          [pageSize]="pageSize()"
          [pageSizeOptions]="[10, 25, 50]"
          (page)="onPage($event)"
          aria-label="Paginação tendências D-3"
        />
      }
    </section>
  `,
  styles: `
    .table-title {
      margin: 1.25rem 0 0.75rem;
      font-size: 1rem;
      font-weight: 500;
    }
    .summary-hint {
      display: block;
      margin-top: 0.25rem;
      font-weight: 400;
      color: rgba(0, 0, 0, 0.55);
      font-size: 0.9rem;
    }
    .empty-hint {
      margin: 0.5rem 0 1rem;
      color: rgba(0, 0, 0, 0.6);
    }
    .table-scroll {
      overflow-x: auto;
      max-width: 100%;
      -webkit-overflow-scrolling: touch;
    }
    table {
      width: 100%;
      min-width: 680px;
    }
    th.mat-mdc-header-cell {
      white-space: nowrap;
    }
    td.subindo {
      color: #059669;
      font-weight: 500;
    }
    td.caindo {
      color: #dc2626;
      font-weight: 500;
    }
  `,
})
export class D3TrendTableComponent {
  readonly rows = input<D3TrendRow[]>([]);
  readonly subindoCount = input(0);
  readonly caindoCount = input(0);
  readonly estavelCount = input(0);

  readonly displayedColumns = [...DISPLAYED_COLUMNS];
  readonly pageIndex = signal(0);
  readonly pageSize = signal(25);

  private readonly paginator = viewChild(MatPaginator);

  readonly pagedRows = computed(() => {
    const all = this.rows();
    const start = this.pageIndex() * this.pageSize();
    return all.slice(start, start + this.pageSize());
  });

  constructor() {
    effect(() => {
      this.rows();
      this.pageIndex.set(0);
      const paginator = this.paginator();
      if (paginator) {
        paginator.firstPage();
      }
    });
  }

  summary(): string {
    const count = this.rows().length;
    if (count === 0) {
      return '';
    }
    return (
      `${this.subindoCount()} subindo · ` +
      `${this.caindoCount()} caindo · ` +
      `${this.estavelCount()} estável`
    );
  }

  onPage(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }
}
