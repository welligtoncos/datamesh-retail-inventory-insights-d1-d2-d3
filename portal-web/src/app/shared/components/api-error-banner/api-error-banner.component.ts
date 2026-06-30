import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-api-error-banner',
  standalone: true,
  imports: [MatIconModule],
  template: `
    @if (message()) {
      <div class="banner" [class.info]="severity() === 'info'" role="alert">
        <mat-icon>{{ severity() === 'info' ? 'info_outline' : 'error_outline' }}</mat-icon>
        <span>{{ message() }}</span>
      </div>
    }
  `,
  styles: `
    .banner {
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
      margin-bottom: 1rem;
      border-radius: 4px;
      background: #ffebee;
      color: #b71c1c;
      font-size: 0.9rem;
    }
    .banner.info {
      background: #e3f2fd;
      color: #0d47a1;
    }
    mat-icon {
      flex-shrink: 0;
      font-size: 22px;
      width: 22px;
      height: 22px;
    }
  `,
})
export class ApiErrorBannerComponent {
  readonly message = input<string | null>(null);
  readonly severity = input<'error' | 'info'>('error');
}
