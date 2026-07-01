import { DatePipe } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ViewChild,
  effect,
  input,
} from '@angular/core';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';

import { InsumoItem } from '../../core/api/models/insumo.model';
import { FileSizePipe } from '../../shared/pipes/file-size.pipe';

@Component({
  selector: 'app-insumos-table',
  standalone: true,
  imports: [MatTableModule, MatSortModule, DatePipe, FileSizePipe],
  template: `
    <div class="table-wrap">
      <table
        mat-table
        [dataSource]="dataSource"
        matSort
        matSortActive="last_modified"
        matSortDirection="desc"
        aria-label="Arquivos de insumo"
      >
        <ng-container matColumnDef="name">
          <th mat-header-cell *matHeaderCellDef mat-sort-header>Nome</th>
          <td mat-cell *matCellDef="let row">{{ row.name }}</td>
        </ng-container>

        <ng-container matColumnDef="size_bytes">
          <th mat-header-cell *matHeaderCellDef mat-sort-header class="col-num">Tamanho</th>
          <td mat-cell *matCellDef="let row" class="col-num">{{ row.size_bytes | fileSize }}</td>
        </ng-container>

        <ng-container matColumnDef="last_modified">
          <th mat-header-cell *matHeaderCellDef mat-sort-header class="col-num">
            Última modificação
          </th>
          <td mat-cell *matCellDef="let row" class="col-num">
            {{ row.last_modified | date: 'dd/MM/yyyy HH:mm' }}
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
      </table>
    </div>
  `,
  styles: `
    .table-wrap {
      overflow-x: auto;
      max-width: 100%;
      -webkit-overflow-scrolling: touch;
    }
    table {
      width: 100%;
    }
    .col-num {
      text-align: right;
    }
    td.col-num,
    th.col-num {
      padding-right: 1rem;
    }
  `,
})
export class InsumosTableComponent implements AfterViewInit {
  readonly items = input.required<InsumoItem[]>();

  readonly displayedColumns = ['name', 'size_bytes', 'last_modified'];
  readonly dataSource = new MatTableDataSource<InsumoItem>([]);

  @ViewChild(MatSort) private sort!: MatSort;

  constructor() {
    effect(() => {
      this.dataSource.data = this.items();
      if (this.sort) {
        this.dataSource.sort = this.sort;
      }
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.sortingDataAccessor = (item, property) => {
      if (property === 'last_modified') {
        return new Date(item.last_modified).getTime();
      }
      if (property === 'size_bytes') {
        return item.size_bytes;
      }
      return item.name.toLowerCase();
    };
  }
}
