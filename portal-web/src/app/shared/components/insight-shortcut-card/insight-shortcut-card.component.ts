import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-insight-shortcut-card',
  standalone: true,
  imports: [RouterLink, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <mat-card class="shortcut-card">
      <mat-card-content class="shortcut-body">
        <div class="icon-wrap" aria-hidden="true">
          <mat-icon>{{ icon() }}</mat-icon>
        </div>
        <div class="text-wrap">
          <h3 class="title">{{ title() }}</h3>
          <p class="subtitle">{{ subtitle() }}</p>
        </div>
      </mat-card-content>
      <mat-card-actions align="end">
        <a mat-stroked-button [routerLink]="route()">
          <mat-icon>open_in_new</mat-icon>
          Abrir
        </a>
      </mat-card-actions>
    </mat-card>
  `,
  styles: `
    .shortcut-card {
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .shortcut-body {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      flex: 1;
      padding-top: 1rem;
    }

    .icon-wrap {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: rgba(25, 118, 210, 0.12);
      flex-shrink: 0;
    }

    .icon-wrap mat-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
      color: #1976d2;
    }

    .text-wrap {
      min-width: 0;
    }

    .title {
      margin: 0 0 0.25rem;
      font-size: 1rem;
      font-weight: 500;
      line-height: 1.3;
    }

    .subtitle {
      margin: 0;
      font-size: 0.875rem;
      color: rgba(0, 0, 0, 0.6);
      line-height: 1.4;
    }

    mat-card-actions a mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      margin-right: 4px;
    }
  `,
})
export class InsightShortcutCardComponent {
  readonly title = input.required<string>();
  readonly subtitle = input.required<string>();
  readonly icon = input.required<string>();
  readonly route = input.required<string>();
}
