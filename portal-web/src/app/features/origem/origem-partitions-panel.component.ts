import { Component, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { OrigemPartition } from '../../core/api/models/origem.model';
import { OrigemMissingDtChipComponent } from './origem-missing-dt-chip.component';

@Component({
  selector: 'app-origem-partitions-panel',
  standalone: true,
  imports: [
    MatIconModule,
    MatListModule,
    MatProgressBarModule,
    OrigemMissingDtChipComponent,
  ],
  template: `
    <section class="panel" aria-label="Partições origem">
      <h2 class="panel-title">Partições dt=</h2>

      @if (loading()) {
        <mat-progress-bar mode="indeterminate" />
        <p class="loading-text">Carregando partições origem…</p>
      } @else {
        @if (available().length === 0 && missing().length === 0) {
          <p class="empty">Nenhuma partição origem encontrada.</p>
        } @else {
          @if (available().length) {
            <mat-nav-list class="partition-list">
              @for (item of available(); track item.dt) {
                <a
                  mat-list-item
                  class="partition-item"
                  [class.selected]="item.dt === selectedDt()"
                  (click)="selectDt.emit(item.dt)"
                  [attr.aria-current]="item.dt === selectedDt() ? 'true' : null"
                >
                  <mat-icon matListItemIcon class="icon-available" aria-hidden="true">
                    check_circle
                  </mat-icon>
                  <span matListItemTitle>dt={{ item.dt }}</span>
                </a>
              }
            </mat-nav-list>
          }

          @if (missing().length) {
            <div class="missing-section">
              @for (item of missing(); track item.dt) {
                <app-origem-missing-dt-chip [dt]="item.dt" />
              }
            </div>
          }
        }
      }
    </section>
  `,
  styles: `
    .panel {
      min-width: 0;
    }
    .panel-title {
      margin: 0 0 0.75rem;
      font-size: 1rem;
      font-weight: 500;
    }
    .loading-text,
    .empty {
      margin: 0.75rem 0;
      color: rgba(0, 0, 0, 0.6);
      font-size: 0.9rem;
    }
    .partition-list {
      padding-top: 0;
    }
    .partition-item {
      cursor: pointer;
      border-radius: 4px;
    }
    .partition-item.selected {
      background: rgba(25, 118, 210, 0.12);
    }
    .icon-available {
      color: #2e7d32;
    }
    .missing-section {
      margin-top: 0.75rem;
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }
  `,
})
export class OrigemPartitionsPanelComponent {
  readonly partitions = input.required<OrigemPartition[]>();
  readonly selectedDt = input<string | null>(null);
  readonly loading = input(false);

  readonly selectDt = output<string>();

  available(): OrigemPartition[] {
    return this.partitions().filter((p) => p.status === 'available');
  }

  missing(): OrigemPartition[] {
    return this.partitions().filter((p) => p.status === 'missing');
  }
}
