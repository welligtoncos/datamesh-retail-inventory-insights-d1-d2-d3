import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

import { HealthService } from '../../../core/api/health.service';
import { HealthStatusValue } from '../../../core/api/models/health.model';

@Component({
  selector: 'app-health-badge',
  standalone: true,
  imports: [AsyncPipe, MatIconModule],
  template: `
    @if (health$ | async; as health) {
      <span class="badge" [attr.data-status]="health.status" [title]="label(health.status)">
        <mat-icon class="dot">circle</mat-icon>
        <span class="label">{{ label(health.status) }}</span>
      </span>
    }
  `,
  styles: `
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.8rem;
      padding: 0.15rem 0.5rem;
      border-radius: 1rem;
      background: rgba(255, 255, 255, 0.12);
    }
    .dot {
      font-size: 10px;
      width: 10px;
      height: 10px;
    }
    [data-status='ok'] .dot {
      color: #69f0ae;
    }
    [data-status='degraded'] .dot {
      color: #ffd54f;
    }
    [data-status='offline'] .dot {
      color: #ff5252;
    }
    @media (max-width: 599px) {
      .label {
        display: none;
      }
    }
  `,
})
export class HealthBadgeComponent {
  private readonly healthService = inject(HealthService);
  readonly health$ = this.healthService.watch();

  label(status: HealthStatusValue): string {
    const labels: Record<HealthStatusValue, string> = {
      ok: 'API disponível',
      degraded: 'API degradada',
      offline: 'API indisponível',
    };
    return labels[status];
  }
}
