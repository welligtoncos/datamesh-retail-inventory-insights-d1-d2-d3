import { Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

export type InsightPanelTheme = 'blue' | 'red' | 'green';

@Component({
  selector: 'app-insight-panel',
  standalone: true,
  imports: [MatCardModule, MatIconModule],
  template: `
    <mat-card class="insight-card" [class]="theme()" appearance="outlined">
      <mat-card-content>
        <div class="insight-row">
          <mat-icon class="insight-icon" aria-hidden="true">lightbulb</mat-icon>
          <p class="insight-text">{{ insightText() }}</p>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: `
    .insight-card {
      margin: 1rem 0;
    }
    .insight-card.blue {
      background: #dbeafe;
      border-color: #93c5fd;
    }
    .insight-card.blue .insight-icon {
      color: #2563eb;
    }
    .insight-card.red {
      background: #fee2e2;
      border-color: #fca5a5;
    }
    .insight-card.red .insight-icon {
      color: #dc2626;
    }
    .insight-card.green {
      background: #d1fae5;
      border-color: #6ee7b7;
    }
    .insight-card.green .insight-icon {
      color: #059669;
    }
    .insight-row {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
    }
    .insight-icon {
      flex-shrink: 0;
    }
    .insight-text {
      margin: 0;
      font-size: 1.05rem;
      line-height: 1.5;
      color: rgba(0, 0, 0, 0.87);
    }
  `,
})
export class InsightPanelComponent {
  readonly insightText = input('');
  readonly theme = input<InsightPanelTheme>('blue');
}
