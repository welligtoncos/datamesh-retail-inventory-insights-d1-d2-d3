import { DatePipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';

import {
  PipelineExecutionSummary,
  displayPipelineStatus,
} from '../../core/api/models/pipeline.model';
import { canOpenSfnConsoleUrl, resolveSfnConsoleUrl } from '../../core/api/pipeline-console-url.util';

const DISPLAYED_COLUMNS = [
  'dt',
  'status',
  'started_at',
  'stopped_at',
  'duration_seconds',
  'actions',
] as const;

@Component({
  selector: 'app-pipeline-executions-table',
  standalone: true,
  imports: [MatTableModule, MatChipsModule, MatButtonModule, MatIconModule, DatePipe],
  template: `
    <section class="history" aria-label="Histórico execuções pipeline">
      <h3 class="table-title">Histórico de execuções (últimas {{ executions().length }})</h3>

      @if (executions().length === 0) {
        <p class="empty-hint">Nenhuma execução registrada ainda.</p>
      } @else {
        <div class="table-scroll">
          <table mat-table [dataSource]="executions()" aria-label="Tabela execuções SFN">
            <ng-container matColumnDef="dt">
              <th mat-header-cell *matHeaderCellDef>Dado (dt)</th>
              <td mat-cell *matCellDef="let row">{{ row.dt }}</td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let row">
                <mat-chip class="status-chip" [class]="statusClass(row)">
                  {{ displayStatus(row) }}
                </mat-chip>
              </td>
            </ng-container>

            <ng-container matColumnDef="started_at">
              <th mat-header-cell *matHeaderCellDef>Início</th>
              <td mat-cell *matCellDef="let row">{{ row.started_at | date: 'dd/MM/yy HH:mm' }}</td>
            </ng-container>

            <ng-container matColumnDef="stopped_at">
              <th mat-header-cell *matHeaderCellDef>Fim</th>
              <td mat-cell *matCellDef="let row">
                @if (row.stopped_at) {
                  {{ row.stopped_at | date: 'dd/MM/yy HH:mm' }}
                } @else {
                  —
                }
              </td>
            </ng-container>

            <ng-container matColumnDef="duration_seconds">
              <th mat-header-cell *matHeaderCellDef>Duração</th>
              <td mat-cell *matCellDef="let row">
                @if (row.duration_seconds != null) {
                  {{ row.duration_seconds }}s
                } @else {
                  —
                }
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let row">
                @if (canOpenConsole(row.execution_arn)) {
                  <a
                    mat-stroked-button
                    [href]="consoleUrl(row.execution_arn)"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Console
                  </a>
                }
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
          </table>
        </div>
      }
    </section>
  `,
  styles: `
    .table-title {
      margin: 1.25rem 0 0.75rem;
      font-size: 1rem;
      font-weight: 500;
    }
    .empty-hint {
      margin: 0.5rem 0 1rem;
      color: rgba(0, 0, 0, 0.6);
    }
    .table-scroll {
      overflow-x: auto;
      max-width: 100%;
    }
    table {
      width: 100%;
      min-width: 640px;
    }
    .status-chip.running {
      background: #dbeafe;
      color: #1d4ed8;
    }
    .status-chip.succeeded {
      background: #d1fae5;
      color: #047857;
    }
    .status-chip.failed {
      background: #fee2e2;
      color: #b91c1c;
    }
  `,
})
export class PipelineExecutionsTableComponent {
  readonly executions = input<PipelineExecutionSummary[]>([]);

  readonly displayedColumns = [...DISPLAYED_COLUMNS];

  displayStatus(row: PipelineExecutionSummary): string {
    return displayPipelineStatus(row.status);
  }

  statusClass(row: PipelineExecutionSummary): string {
    if (row.status === 'RUNNING') {
      return 'running';
    }
    if (row.status === 'SUCCEEDED') {
      return 'succeeded';
    }
    return 'failed';
  }

  canOpenConsole(executionArn: string): boolean {
    return canOpenSfnConsoleUrl(executionArn);
  }

  consoleUrl(executionArn: string): string {
    return resolveSfnConsoleUrl(executionArn) ?? '#';
  }
}
