import {
  Component,
  effect,
  input,
  output,
  viewChild,
} from '@angular/core';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';

import { OrigemPreviewResponse } from '../../core/api/models/origem.model';

@Component({
  selector: 'app-origem-preview-table',
  standalone: true,
  imports: [MatTableModule, MatPaginatorModule],
  template: `
    <section class="preview" aria-label="Preview Parquet">
      <h3 class="preview-title">
        Preview Parquet
        @if (preview()) {
          <span class="page-hint">(pág. {{ preview()!.page }}/{{ preview()!.total_pages }})</span>
        }
      </h3>

      <div class="preview-scroll">
        <table mat-table [dataSource]="rows()" aria-label="Preview dados origem">
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

      <mat-paginator
        [length]="totalRows()"
        [pageIndex]="pageIndex()"
        [pageSize]="pageSize()"
        [pageSizeOptions]="[25, 50, 100]"
        (page)="onPage($event)"
        aria-label="Paginação preview origem"
      />
    </section>
  `,
  styles: `
    .preview-title {
      margin: 1.25rem 0 0.75rem;
      font-size: 1rem;
      font-weight: 500;
    }
    .page-hint {
      font-weight: 400;
      color: rgba(0, 0, 0, 0.55);
      font-size: 0.9rem;
    }
    .preview-scroll {
      overflow-x: auto;
    }
    table {
      width: 100%;
      min-width: 720px;
    }
    th.mat-mdc-header-cell {
      white-space: nowrap;
      font-size: 0.8rem;
    }
    td.mat-mdc-cell {
      font-size: 0.85rem;
    }
  `,
})
export class OrigemPreviewTableComponent {
  readonly preview = input<OrigemPreviewResponse | null>(null);
  readonly pageChange = output<{ page: number; pageSize: number }>();

  private readonly paginator = viewChild(MatPaginator);

  readonly columns = () => this.preview()?.columns ?? [];
  readonly rows = () => this.preview()?.rows ?? [];
  readonly totalRows = () => this.preview()?.total_rows ?? 0;
  readonly pageIndex = () => Math.max(0, (this.preview()?.page ?? 1) - 1);
  readonly pageSize = () => this.preview()?.page_size ?? 50;

  constructor() {
    effect(() => {
      const p = this.paginator();
      const preview = this.preview();
      if (p && preview) {
        p.pageIndex = Math.max(0, preview.page - 1);
        p.pageSize = preview.page_size;
        p.length = preview.total_rows;
      }
    });
  }

  formatCell(value: unknown): string {
    if (value === null || value === undefined) {
      return '—';
    }
    return String(value);
  }

  onPage(event: PageEvent): void {
    this.pageChange.emit({ page: event.pageIndex + 1, pageSize: event.pageSize });
  }
}
