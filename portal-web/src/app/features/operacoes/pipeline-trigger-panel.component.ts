import { Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-pipeline-trigger-panel',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <div class="trigger-row">
      <button
        mat-flat-button
        color="primary"
        type="button"
        class="trigger-btn"
        [disabled]="disabled() || triggering()"
        (click)="trigger.emit()"
      >
        @if (triggering()) {
          <mat-spinner diameter="18" aria-hidden="true" />
        } @else {
          <mat-icon aria-hidden="true">play_arrow</mat-icon>
        }
        <span>Processar dia</span>
      </button>
      @if (selectedDt()) {
        <span class="hint">Pipeline para <strong>{{ selectedDt() }}</strong></span>
      }
    </div>
  `,
  styles: `
    .trigger-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 1rem;
    }
    .trigger-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
    }
    .trigger-btn mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }
    .hint {
      color: rgba(0, 0, 0, 0.65);
      font-size: 0.95rem;
    }
  `,
})
export class PipelineTriggerPanelComponent {
  readonly selectedDt = input<string | null>(null);
  readonly disabled = input(false);
  readonly triggering = input(false);

  readonly trigger = output<void>();
}
