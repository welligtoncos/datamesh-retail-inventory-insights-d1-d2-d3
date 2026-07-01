import { Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-d1-insight-panel',
  standalone: true,
  imports: [MatCardModule, MatIconModule],
  template: `
    <mat-card class="insight-card" appearance="outlined">
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
      background: #dbeafe;
      border-color: #93c5fd;
    }
    .insight-row {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
    }
    .insight-icon {
      color: #2563eb;
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
export class D1InsightPanelComponent {
  readonly insightText = input('');
}
