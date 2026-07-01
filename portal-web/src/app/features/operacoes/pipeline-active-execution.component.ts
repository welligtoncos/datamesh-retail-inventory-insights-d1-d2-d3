import { DatePipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import {
  PipelineExecutionSummary,
  displayPipelineStatus,
  isTerminalPipelineStatus,
} from '../../core/api/models/pipeline.model';
import { buildSfnConsoleUrl, resolveSfnConsoleUrl } from '../../core/api/pipeline-console-url.util';

@Component({
  selector: 'app-pipeline-active-execution',
  standalone: true,
  imports: [
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    DatePipe,
  ],
  template: `
    @if (execution()) {
      <mat-card class="active-card" appearance="outlined">
        <mat-card-content>
          <div class="active-row">
            @if (execution()!.status === 'RUNNING') {
              <mat-spinner diameter="28" aria-hidden="true" />
            } @else if (execution()!.status === 'SUCCEEDED') {
              <mat-icon class="ok-icon" aria-hidden="true">check_circle</mat-icon>
            } @else {
              <mat-icon class="fail-icon" aria-hidden="true">error</mat-icon>
            }

            <div class="active-text">
              <h3>Execução ativa</h3>
              <p>
                <strong>{{ execution()!.dt }}</strong> ·
                <mat-chip class="status-chip" [class]="chipClass()">
                  {{ displayStatus() }}
                </mat-chip>
              </p>
              <p class="meta">
                Início: {{ execution()!.started_at | date: 'dd/MM/yyyy HH:mm:ss' }}
                @if (execution()!.duration_seconds != null) {
                  · Duração: {{ execution()!.duration_seconds }}s
                }
              </p>
              @if (execution()!.status === 'RUNNING') {
                <p class="polling-hint">Processamento em andamento… atualizando a cada 15s.</p>
              } @else if (execution()!.status === 'SUCCEEDED') {
                <p class="polling-hint ok">Pipeline concluído com sucesso.</p>
              } @else {
                <p class="polling-hint fail">Pipeline falhou. Verifique o console AWS ou tente reprocessar.</p>
              }
              @if (consoleUrl()) {
                <a class="console-link" [href]="consoleUrl()" target="_blank" rel="noopener noreferrer">
                  Ver no console AWS
                </a>
              }
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    }
  `,
  styles: `
    .active-card {
      margin: 1rem 0;
      background: #f8fafc;
    }
    .active-row {
      display: flex;
      gap: 1rem;
      align-items: flex-start;
    }
    .ok-icon {
      color: #059669;
      font-size: 28px;
      width: 28px;
      height: 28px;
    }
    .fail-icon {
      color: #dc2626;
      font-size: 28px;
      width: 28px;
      height: 28px;
    }
    .active-text h3 {
      margin: 0 0 0.35rem;
      font-size: 1rem;
      font-weight: 500;
    }
    .active-text p {
      margin: 0.25rem 0;
    }
    .meta {
      color: rgba(0, 0, 0, 0.6);
      font-size: 0.9rem;
    }
    .polling-hint {
      margin-top: 0.5rem;
      font-size: 0.95rem;
    }
    .polling-hint.ok {
      color: #059669;
    }
    .polling-hint.fail {
      color: #dc2626;
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
    .console-link {
      display: inline-block;
      margin-top: 0.5rem;
      font-size: 0.9rem;
    }
  `,
})
export class PipelineActiveExecutionComponent {
  readonly execution = input<PipelineExecutionSummary | null>(null);

  displayStatus(): string {
    const row = this.execution();
    return row ? displayPipelineStatus(row.status) : '';
  }

  chipClass(): string {
    const row = this.execution();
    if (!row) {
      return '';
    }
    if (row.status === 'RUNNING') {
      return 'running';
    }
    if (row.status === 'SUCCEEDED') {
      return 'succeeded';
    }
    return 'failed';
  }

  consoleUrl(): string | null {
    return resolveSfnConsoleUrl(this.execution()?.execution_arn);
  }

  protected readonly isTerminal = isTerminalPipelineStatus;
}