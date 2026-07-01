import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router } from '@angular/router';

import { listMockD1Partitions } from '../../core/api/data/insights-d1-mock.data';
import { MOCK_ENRIQUECIDO_PARTITIONS } from '../../core/api/data/enriquecido-mock.data';
import { DEFAULT_PIPELINE_HISTORY_LIMIT } from '../../core/api/data/pipeline-mock.data';
import { defaultPipelineDt } from '../../core/api/pipeline-date.util';
import { EnriquecidoFacadeService } from '../../core/api/enriquecido-facade.service';
import {
  isTerminalPipelineStatus,
  PipelineExecutionSummary,
} from '../../core/api/models/pipeline.model';
import { PipelineFacadeService } from '../../core/api/pipeline-facade.service';
import { ApiErrorBannerComponent } from '../../shared/components/api-error-banner/api-error-banner.component';
import { PipelineActiveExecutionComponent } from './pipeline-active-execution.component';
import { PipelineDtSelectorComponent } from './pipeline-dt-selector.component';
import { PipelineExecutionsTableComponent } from './pipeline-executions-table.component';
import { PipelineTriggerPanelComponent } from './pipeline-trigger-panel.component';

@Component({
  selector: 'app-operacoes-page',
  standalone: true,
  imports: [
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    ApiErrorBannerComponent,
    PipelineDtSelectorComponent,
    PipelineTriggerPanelComponent,
    PipelineActiveExecutionComponent,
    PipelineExecutionsTableComponent,
  ],
  template: `
    <header class="page-header">
      <div class="title-row">
        <h1>Operações · Pipeline</h1>
        @if (showMockChip()) {
          <mat-chip-set>
            <mat-chip highlighted>Dados de demonstração</mat-chip>
          </mat-chip-set>
        }
      </div>
      <p class="subtitle">
        Dispare a esteira <code>processar_dia</code> para carregar origem e enriquecer um dia (Step
        Functions).
      </p>

      <div class="toolbar">
        <app-pipeline-dt-selector
          [partitions]="partitions()"
          [selectedDt]="selectedDt()"
          [loading]="loading()"
          (dtChange)="onDtChange($event)"
        />
        <app-pipeline-trigger-panel
          [selectedDt]="selectedDt()"
          [disabled]="!canTrigger()"
          [triggering]="triggering()"
          (trigger)="onTrigger()"
        />
      </div>
    </header>

    <app-api-error-banner [message]="bannerMessage()" [severity]="bannerSeverity()" />

    @if (loading()) {
      <div class="loading-wrap" aria-live="polite">
        <mat-spinner diameter="40" />
        <p>Carregando operações…</p>
      </div>
    } @else {
      <app-pipeline-active-execution [execution]="activeExecution()" />
      <app-pipeline-executions-table [executions]="executions()" />
    }

    <div class="actions">
      <button mat-stroked-button type="button" class="refresh-btn" (click)="refresh()">
        <mat-icon aria-hidden="true">refresh</mat-icon>
        <span>Atualizar histórico</span>
      </button>
    </div>
  `,
  styles: `
    .page-header {
      min-width: 0;
    }
    .title-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.35rem;
    }
    .title-row h1 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 500;
    }
    .subtitle {
      margin: 0 0 1rem;
      color: rgba(0, 0, 0, 0.65);
      line-height: 1.5;
    }
    .subtitle code {
      font-size: 0.9em;
    }
    .toolbar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
    }
    .loading-wrap {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
      margin: 2rem 0;
      color: rgba(0, 0, 0, 0.6);
    }
    .actions {
      margin-top: 1.25rem;
    }
    .refresh-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
    }
    @media (max-width: 959px) {
      .toolbar {
        flex-direction: column;
        align-items: stretch;
      }
    }
  `,
})
export class OperacoesPageComponent implements OnInit, OnDestroy {
  private readonly facade = inject(PipelineFacadeService);
  private readonly enriquecidoFacade = inject(EnriquecidoFacadeService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly loading = signal(true);
  readonly triggering = signal(false);
  readonly selectedDt = signal<string | null>(null);
  readonly partitions = signal<string[]>(listMockD1Partitions());
  readonly executions = signal<PipelineExecutionSummary[]>([]);
  readonly activeExecution = signal<PipelineExecutionSummary | null>(null);
  readonly dataSource = signal<'api' | 'mock'>('mock');
  readonly bannerMessage = signal<string | null>(null);
  readonly bannerSeverity = signal<'error' | 'info'>('info');

  private activeExecutionId: string | null = null;

  ngOnInit(): void {
    this.refresh();
  }

  ngOnDestroy(): void {
    this.facade.stopPolling();
  }

  showMockChip(): boolean {
    return this.dataSource() === 'mock';
  }

  canTrigger(): boolean {
    return Boolean(this.selectedDt()) && !this.triggering();
  }

  refresh(): void {
    this.bannerMessage.set(null);
    this.loading.set(true);

    this.enriquecidoFacade.loadPartitions().subscribe({
      next: (result) => {
        const parts =
          result.partitions.length > 0 ? result.partitions : listMockD1Partitions();
        this.partitions.set(parts);

        const queryDt = this.route.snapshot.queryParamMap.get('dt');
        const latest = result.latest ?? MOCK_ENRIQUECIDO_PARTITIONS.latest;
        const initial = defaultPipelineDt(parts, queryDt) ?? defaultPipelineDt(parts, latest);

        if (initial) {
          this.selectedDt.set(initial);
        }

        this.loadExecutions();
      },
      error: () => {
        this.partitions.set(listMockD1Partitions());
        const queryDt = this.route.snapshot.queryParamMap.get('dt');
        const initial = defaultPipelineDt(listMockD1Partitions(), queryDt);
        if (initial) {
          this.selectedDt.set(initial);
        }
        this.loadExecutions();
      },
    });
  }

  onDtChange(dt: string): void {
    this.selectedDt.set(dt);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { dt },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  onTrigger(): void {
    const dt = this.selectedDt();
    if (!dt || this.triggering()) {
      return;
    }

    const hasRunning =
      this.executions().some((row) => row.status === 'RUNNING') ||
      (this.dataSource() === 'mock' && this.facade.hasRunningInMock());

    if (hasRunning) {
      const ok = window.confirm(
        'Já existe uma execução em andamento. Deseja iniciar outra execução do pipeline?',
      );
      if (!ok) {
        return;
      }
    }

    this.triggering.set(true);
    this.bannerMessage.set(null);

    this.facade.startProcessarDia(dt).subscribe({
      next: (result) => {
        this.triggering.set(false);
        this.dataSource.set(result.data_source);
        if (result.data_source === 'mock') {
          this.setMockBanner();
        }

        const started = this.toSummaryFromStart(result.response);
        this.activeExecution.set(started);
        this.activeExecutionId = started.execution_id;
        this.prependExecution(started);
        this.startPolling(started.execution_id);

        this.bannerSeverity.set('info');
        this.bannerMessage.set(`Pipeline iniciado para ${dt}.`);
      },
      error: () => {
        this.triggering.set(false);
        this.bannerSeverity.set('error');
        this.bannerMessage.set('Não foi possível iniciar o pipeline. Tente novamente.');
      },
    });
  }

  private loadExecutions(): void {
    this.facade.loadExecutions(DEFAULT_PIPELINE_HISTORY_LIMIT).subscribe({
      next: (result) => {
        this.executions.set(result.list.executions);
        this.dataSource.set(result.data_source);
        this.loading.set(false);

        const running = result.list.executions.find((row) => row.status === 'RUNNING');
        if (running) {
          this.activeExecution.set(running);
          this.activeExecutionId = running.execution_id;
          this.startPolling(running.execution_id);
        }

        if (result.data_source === 'mock') {
          this.setMockBanner();
        }
      },
      error: () => {
        this.bannerSeverity.set('error');
        this.bannerMessage.set('Não foi possível carregar o histórico de execuções.');
        this.loading.set(false);
      },
    });
  }

  private startPolling(executionId: string): void {
    this.facade.startPolling(executionId, (execution) => {
      this.activeExecution.set(execution);
      this.updateExecutionInList(execution);

      if (isTerminalPipelineStatus(execution.status)) {
        this.facade.stopPolling();
        this.activeExecutionId = null;
      }
    });
  }

  private prependExecution(row: PipelineExecutionSummary): void {
    const next = [row, ...this.executions().filter((e) => e.execution_id !== row.execution_id)];
    this.executions.set(next.slice(0, DEFAULT_PIPELINE_HISTORY_LIMIT));
  }

  private updateExecutionInList(row: PipelineExecutionSummary): void {
    this.executions.set(
      this.executions().map((item) =>
        item.execution_id === row.execution_id ? row : item,
      ),
    );
  }

  private toSummaryFromStart(response: {
    execution_id: string;
    execution_arn: string;
    dt: string;
    status: PipelineExecutionSummary['status'];
    started_at: string;
    audit?: PipelineExecutionSummary['audit'];
  }): PipelineExecutionSummary {
    return {
      execution_id: response.execution_id,
      execution_arn: response.execution_arn,
      dt: response.dt,
      status: response.status,
      started_at: response.started_at,
      stopped_at: null,
      duration_seconds: null,
      audit: response.audit,
    };
  }

  private setMockBanner(): void {
    this.bannerSeverity.set('info');
    this.bannerMessage.set('Exibindo dados de demonstração até o BFF estar disponível.');
  }
}
