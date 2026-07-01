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

import { D1RankingRow } from '../../../core/api/models/insights-d1.model';

const DISPLAYED_COLUMNS = [
  'product_id',
  'category',
  'unidades',
  'receita',
  'pct_total',
] as const;

@Component({
  selector: 'app-d1-ranking-table',
  standalone: true,
  imports: [MatTableModule, MatPaginatorModule, DecimalPipe, PercentPipe],
  template: `
    <section class="ranking" aria-label="Ranking produtos D-1">
      <h3 class="ranking-title">
        Ranking de produtos
        @if (summary()) {
          <span class="summary-hint">{{ summary() }}</span>
        }
      </h3>

      <div class="ranking-scroll">
        <table mat-table [dataSource]="pagedRows()" aria-label="Ranking unidades e receita">
          <ng-container matColumnDef="product_id">
            <th mat-header-cell *matHeaderCellDef>Produto</th>
            <td mat-cell *matCellDef="let row">{{ row.product_id }}</td>
          </ng-container>

          <ng-container matColumnDef="category">
            <th mat-header-cell *matHeaderCellDef>Categoria</th>
            <td mat-cell *matCellDef="let row">{{ row.category }}</td>
          </ng-container>

          <ng-container matColumnDef="unidades">
            <th mat-header-cell *matHeaderCellDef>Unid. vendidas</th>
            <td mat-cell *matCellDef="let row">{{ row.unidades | number }}</td>
          </ng-container>

          <ng-container matColumnDef="receita">
            <th mat-header-cell *matHeaderCellDef>Receita (R$)</th>
            <td mat-cell *matCellDef="let row">{{ row.receita | number: '1.2-2' }}</td>
          </ng-container>

          <ng-container matColumnDef="pct_total">
            <th mat-header-cell *matHeaderCellDef>% do total</th>
            <td mat-cell *matCellDef="let row">{{ row.pct_total | percent: '1.1-1' }}</td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
        </table>
      </div>

      <mat-paginator
        [length]="ranking().length"
        [pageIndex]="pageIndex()"
        [pageSize]="pageSize()"
        [pageSizeOptions]="[10, 25, 50]"
        (page)="onPage($event)"
        aria-label="Paginação ranking D-1"
      />
    </section>
  `,
  styles: `
    .ranking-title {
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
    .ranking-scroll {
      overflow-x: auto;
      max-width: 100%;
      -webkit-overflow-scrolling: touch;
    }
    table {
      width: 100%;
      min-width: 520px;
    }
    th.mat-mdc-header-cell {
      white-space: nowrap;
    }
  `,
})
export class D1RankingTableComponent {
  readonly ranking = input<D1RankingRow[]>([]);
  readonly totalUnidades = input(0);
  readonly totalReceita = input(0);

  readonly displayedColumns = [...DISPLAYED_COLUMNS];
  readonly pageIndex = signal(0);
  readonly pageSize = signal(25);

  private readonly paginator = viewChild(MatPaginator);

  readonly pagedRows = computed(() => {
    const rows = this.ranking();
    const start = this.pageIndex() * this.pageSize();
    return rows.slice(start, start + this.pageSize());
  });

  constructor() {
    effect(() => {
      this.ranking();
      this.pageIndex.set(0);
      const paginator = this.paginator();
      if (paginator) {
        paginator.firstPage();
      }
    });
  }

  summary(): string {
    const count = this.ranking().length;
    if (count === 0) {
      return '';
    }
    return (
      `${count} produtos · ` +
      `${this.totalUnidades().toLocaleString('pt-BR')} un. · ` +
      `R$ ${this.totalReceita().toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    );
  }

  onPage(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }
}
