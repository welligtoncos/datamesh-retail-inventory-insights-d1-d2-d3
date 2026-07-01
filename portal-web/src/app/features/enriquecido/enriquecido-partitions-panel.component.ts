import { Component, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-enriquecido-partitions-panel',
  standalone: true,
  imports: [MatIconModule, MatListModule, MatProgressBarModule],
  template: `
    <section class="panel" aria-label="Partições enriquecido">
      <h2 class="panel-title">Partições dt=</h2>

      @if (loading()) {
        <mat-progress-bar mode="indeterminate" />
        <p class="loading-text">Carregando partições enriquecidas…</p>
      } @else {
        @if (partitions().length === 0) {
          <p class="empty">Nenhuma partição enriquecida encontrada.</p>
        } @else {
          <mat-nav-list class="partition-list">
            @for (dt of partitions(); track dt) {
              <a
                mat-list-item
                class="partition-item"
                [class.selected]="dt === selectedDt()"
                (click)="selectDt.emit(dt)"
                [attr.aria-current]="dt === selectedDt() ? 'true' : null"
              >
                <mat-icon matListItemIcon class="icon-available" aria-hidden="true">
                  check_circle
                </mat-icon>
                <span matListItemTitle>dt={{ dt }}</span>
              </a>
            }
          </mat-nav-list>
        }
      }
    </section>
  `,
  styles: `
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
  `,
})
export class EnriquecidoPartitionsPanelComponent {
  readonly partitions = input.required<string[]>();
  readonly selectedDt = input<string | null>(null);
  readonly loading = input(false);

  readonly selectDt = output<string>();
}
