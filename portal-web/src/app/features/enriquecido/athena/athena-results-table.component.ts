import { Component, input } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-athena-results-table',
  standalone: true,
  imports: [MatTableModule, MatChipsModule],
  template: `
    <section class="results" aria-label="Resultado da consulta Athena">
      @if (columns().length === 0) {
        <p class="empty">Nenhum resultado.</p>
      } @else {
        @if (truncated()) {
          <mat-chip-set>
            <mat-chip highlighted>Resultado limitado</mat-chip>
          </mat-chip-set>
        }
        <div class="table-scroll">
          <table mat-table [dataSource]="rows()" aria-label="Tabela resultado Athena">
            @for (col of columns(); track col) {
              <ng-container [matColumnDef]="col">
                <th mat-header-cell *matHeaderCellDef>{{ col }}</th>
                <td mat-cell *matCellDef="let row">{{ formatCell(row[col]) }}</td>
              </ng-container>
            }
            <tr mat-header-row *matHeaderRowDef="columns()"></tr>
            <tr mat-row *matRowDef="let row; columns: columns()"></tr>
          </table>
        </div>
        <p class="meta">{{ rowCount() }} linha(s)</p>
      }
    </section>
  `,
  styles: `
    .table-scroll {
      overflow-x: auto;
      margin-top: 0.5rem;
    }
    table {
      width: 100%;
      min-width: 480px;
    }
    .meta {
      margin: 0.5rem 0 0;
      font-size: 0.85rem;
      color: rgba(0, 0, 0, 0.6);
    }
    .empty {
      color: rgba(0, 0, 0, 0.6);
    }
  `,
})
export class AthenaResultsTableComponent {
  readonly columns = input<string[]>([]);
  readonly rows = input<Record<string, string | number | null>[]>([]);
  readonly truncated = input(false);
  readonly rowCount = input(0);

  formatCell(value: string | number | null | undefined): string {
    if (value === null || value === undefined) {
      return '—';
    }
    if (typeof value === 'number') {
      return Number.isInteger(value) ? String(value) : value.toFixed(2);
    }
    return String(value);
  }
}
