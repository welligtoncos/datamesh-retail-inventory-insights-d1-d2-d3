import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subject, interval, startWith, switchMap, takeUntil } from 'rxjs';

import { EsteiraStatusFacadeService } from '../../core/api/esteira-status-facade.service';
import { EsteiraStatusViewModel } from '../../core/api/models/esteira-status.model';

const POLL_MS = 60_000;

@Component({
  selector: 'app-esteira-status-card',
  standalone: true,
  imports: [
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    RouterLink,
  ],
  template: `
    <mat-card class="esteira-card" [attr.data-level]="status()?.level ?? 'loading'">
      <mat-card-header>
        <mat-icon mat-card-avatar class="level-icon">{{ iconName() }}</mat-icon>
        <mat-card-title>Esteira operacional</mat-card-title>
        <mat-card-subtitle>{{ status()?.detail ?? 'Verificando status…' }}</mat-card-subtitle>
      </mat-card-header>

      <mat-card-content>
        @if (loading() && !status()) {
          <div class="loading-row">
            <mat-spinner diameter="28" />
          </div>
        } @else if (status()) {
          <p class="status-label">{{ status()!.label }}</p>
          @if (dataSource() === 'mock') {
            <mat-chip-set>
              <mat-chip highlighted>Dados de demonstração</mat-chip>
            </mat-chip-set>
          }
        }
      </mat-card-content>

      <mat-card-actions align="end">
        @if (status()?.console_alarm_url) {
          <a
            mat-button
            [href]="status()!.console_alarm_url"
            target="_blank"
            rel="noopener noreferrer"
          >
            Ver alarme no console
          </a>
        }
        <a mat-button routerLink="/operacoes">Operações</a>
        <button mat-icon-button type="button" aria-label="Atualizar status" (click)="refresh()">
          <mat-icon>refresh</mat-icon>
        </button>
      </mat-card-actions>
    </mat-card>
  `,
  styles: `
    .esteira-card {
      margin-bottom: 1.5rem;
    }

    .level-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      font-size: 24px;
    }

    [data-level='operational'] .level-icon {
      background: rgba(46, 125, 50, 0.12);
      color: #2e7d32;
    }

    [data-level='alarm'] .level-icon {
      background: rgba(198, 40, 40, 0.12);
      color: #c62828;
    }

    [data-level='insufficient_data'] .level-icon,
    [data-level='api_degraded'] .level-icon {
      background: rgba(245, 124, 0, 0.12);
      color: #ef6c00;
    }

    [data-level='api_offline'] .level-icon {
      background: rgba(97, 97, 97, 0.12);
      color: #616161;
    }

    .status-label {
      font-size: 1.1rem;
      font-weight: 500;
      margin: 0 0 0.5rem;
    }

    .loading-row {
      display: flex;
      justify-content: center;
      padding: 0.5rem 0;
    }
  `,
})
export class EsteiraStatusCardComponent implements OnInit, OnDestroy {
  private readonly facade = inject(EsteiraStatusFacadeService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroy$ = new Subject<void>();

  readonly loading = signal(true);
  readonly status = signal<EsteiraStatusViewModel | null>(null);
  readonly dataSource = signal<'api' | 'mock'>('mock');

  ngOnInit(): void {
    interval(POLL_MS)
      .pipe(
        startWith(0),
        switchMap(() => this.route.queryParamMap),
        switchMap((params) => {
          const demoAlarm = params.get('alarm') === 'demo';
          this.loading.set(this.status() === null);
          return this.facade.loadStatus({ demoAlarm });
        }),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: (result) => {
          this.status.set(result.status);
          this.dataSource.set(result.data_source);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  refresh(): void {
    const demoAlarm = this.route.snapshot.queryParamMap.get('alarm') === 'demo';
    this.loading.set(true);
    this.facade.loadStatus({ demoAlarm }).subscribe({
      next: (result) => {
        this.status.set(result.status);
        this.dataSource.set(result.data_source);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  iconName(): string {
    const level = this.status()?.level;
    switch (level) {
      case 'operational':
        return 'check_circle';
      case 'alarm':
        return 'warning';
      case 'api_offline':
        return 'cloud_off';
      case 'insufficient_data':
      case 'api_degraded':
        return 'error_outline';
      default:
        return 'hourglass_empty';
    }
  }
}
