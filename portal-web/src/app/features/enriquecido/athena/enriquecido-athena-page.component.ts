import { Component, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { AthenaFacadeService } from '../../../core/api/athena-facade.service';
import { listAthenaTemplates } from '../../../core/api/athena-templates.catalog';
import { EnriquecidoFacadeService } from '../../../core/api/enriquecido-facade.service';
import {
  AthenaQueryParams,
  AthenaQueryTemplateResponse,
  AthenaTemplateDefinition,
} from '../../../core/api/models/athena.model';
import { ApiErrorBannerComponent } from '../../../shared/components/api-error-banner/api-error-banner.component';
import { AthenaResultsTableComponent } from './athena-results-table.component';
import { AthenaTemplateListComponent } from './athena-template-list.component';
import { AthenaTemplateRunFormComponent } from './athena-template-run-form.component';

@Component({
  selector: 'app-enriquecido-athena-page',
  standalone: true,
  imports: [
    RouterLink,
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    ApiErrorBannerComponent,
    AthenaTemplateListComponent,
    AthenaTemplateRunFormComponent,
    AthenaResultsTableComponent,
  ],
  template: `
    <header class="page-header">
      <div class="title-row">
        <a mat-button routerLink="/enriquecido" [queryParams]="backQueryParams()" class="back-link">
          <mat-icon aria-hidden="true">arrow_back</mat-icon>
          Enriquecido
        </a>
        <h1>Consultas Athena</h1>
        @if (dataSource() === 'mock') {
          <mat-chip-set>
            <mat-chip highlighted>Dados de demonstração</mat-chip>
          </mat-chip-set>
        }
      </div>
      @if (contextDt()) {
        <p class="subtitle">Partição de contexto: <strong>dt={{ contextDt() }}</strong></p>
      }
    </header>

    <app-api-error-banner [message]="bannerMessage()" [severity]="bannerSeverity()" />

    <div class="athena-layout">
      <aside class="athena-aside">
        <app-athena-template-list
          [templates]="templates"
          [selectedId]="selectedTemplateId()"
          (selectTemplate)="onSelectTemplate($event)"
        />
      </aside>

      <main class="athena-main">
        @if (selectedTemplate(); as template) {
          <h2 class="template-title">{{ template.title }}</h2>
          <p class="template-desc">{{ template.description }}</p>

          <app-athena-template-run-form
            [template]="template"
            [partitions]="partitions()"
            [initialDt]="contextDt()"
            [initialDts]="partitions().slice(0, 2)"
            [running]="running()"
            (run)="onRun($event)"
          />

          @if (running()) {
            <div class="loading" aria-live="polite">
              <mat-spinner diameter="36" />
              <p>Executando consulta…</p>
            </div>
          } @else {
            @if (lastResult(); as result) {
              @if (result.status === 'FAILED') {
                <p class="fail-msg">{{ result.state_reason ?? 'A consulta falhou.' }}</p>
              } @else {
                <app-athena-results-table
                  [columns]="result.columns"
                  [rows]="result.rows"
                  [truncated]="result.truncated"
                  [rowCount]="result.row_count"
                />
              }
            }
          }
        } @else {
          <p class="empty">Selecione um template à esquerda.</p>
        }
      </main>
    </div>
  `,
  styles: `
    .page-header {
      margin-bottom: 1rem;
    }
    .title-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.75rem;
    }
    .title-row h1 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 500;
    }
    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
    }
    .subtitle {
      margin: 0.35rem 0 0;
      color: rgba(0, 0, 0, 0.65);
    }
    .athena-layout {
      display: grid;
      grid-template-columns: minmax(220px, 320px) minmax(0, 1fr);
      gap: 1.5rem;
      align-items: start;
    }
    .athena-aside {
      border-right: 1px solid rgba(0, 0, 0, 0.08);
      padding-right: 1rem;
      min-width: 0;
    }
    .athena-main {
      min-width: 0;
    }
    .template-title {
      margin: 0 0 0.25rem;
      font-size: 1.1rem;
      font-weight: 500;
    }
    .template-desc {
      margin: 0 0 1rem;
      color: rgba(0, 0, 0, 0.65);
    }
    .loading {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem 0;
      color: rgba(0, 0, 0, 0.6);
    }
    .fail-msg {
      color: #b91c1c;
    }
    .empty {
      color: rgba(0, 0, 0, 0.6);
    }
    @media (max-width: 959px) {
      .athena-layout {
        grid-template-columns: 1fr;
      }
      .athena-aside {
        border-right: none;
        border-bottom: 1px solid rgba(0, 0, 0, 0.08);
        padding-right: 0;
        padding-bottom: 1rem;
      }
    }
  `,
})
export class EnriquecidoAthenaPageComponent implements OnInit {
  private readonly facade = inject(AthenaFacadeService);
  private readonly enriquecidoFacade = inject(EnriquecidoFacadeService);
  private readonly route = inject(ActivatedRoute);

  readonly templates = listAthenaTemplates();
  readonly partitions = signal<string[]>([]);
  readonly selectedTemplateId = signal<string | null>(null);
  readonly selectedTemplate = signal<AthenaTemplateDefinition | null>(null);
  readonly contextDt = signal<string | null>(null);
  readonly running = signal(false);
  readonly lastResult = signal<AthenaQueryTemplateResponse | null>(null);
  readonly dataSource = signal<'api' | 'mock'>('mock');
  readonly bannerMessage = signal<string | null>(null);
  readonly bannerSeverity = signal<'error' | 'info'>('info');

  ngOnInit(): void {
    const queryDt = this.route.snapshot.queryParamMap.get('dt');
    const queryTemplate = this.route.snapshot.queryParamMap.get('template');
    this.contextDt.set(queryDt);

    this.enriquecidoFacade.loadPartitions().subscribe({
      next: (result) => {
        this.partitions.set(result.partitions);
        if (result.data_source === 'mock') {
          this.setMockBanner();
        }
        const initialTemplate =
          queryTemplate && this.templates.some((t) => t.template_id === queryTemplate)
            ? queryTemplate
            : this.templates[0]?.template_id ?? null;
        if (initialTemplate) {
          this.onSelectTemplate(initialTemplate);
        }
      },
      error: () => {
        this.bannerSeverity.set('error');
        this.bannerMessage.set('Não foi possível carregar partições.');
      },
    });
  }

  backQueryParams(): { dt?: string } {
    const dt = this.contextDt();
    return dt ? { dt } : {};
  }

  onSelectTemplate(templateId: string): void {
    this.selectedTemplateId.set(templateId);
    this.selectedTemplate.set(this.templates.find((t) => t.template_id === templateId) ?? null);
    this.lastResult.set(null);
    this.bannerMessage.set(null);
  }

  onRun(params: AthenaQueryParams): void {
    const templateId = this.selectedTemplateId();
    if (!templateId) {
      return;
    }
    this.running.set(true);
    this.bannerMessage.set(null);
    this.facade.runTemplate(templateId, params).subscribe({
      next: (result) => {
        this.lastResult.set(result.response);
        this.dataSource.set(result.data_source);
        if (result.data_source === 'mock') {
          this.setMockBanner();
        }
        this.running.set(false);
      },
      error: (err: Error) => {
        this.bannerSeverity.set('error');
        this.bannerMessage.set(err.message ?? 'Não foi possível executar a consulta.');
        this.running.set(false);
      },
    });
  }

  private setMockBanner(): void {
    this.bannerSeverity.set('info');
    this.bannerMessage.set('Exibindo dados de demonstração até o BFF estar disponível.');
  }
}
