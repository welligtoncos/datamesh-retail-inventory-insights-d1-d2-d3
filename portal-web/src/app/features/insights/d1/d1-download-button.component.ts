import { Component, inject, input, output, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { InsightsD1FacadeService } from '../../../core/api/insights-d1-facade.service';

@Component({
  selector: 'app-d1-download-button',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatSnackBarModule],
  template: `
    <button
      mat-stroked-button
      type="button"
      class="download-btn"
      [disabled]="disabled() || loading()"
      (click)="onDownload()"
    >
      @if (loading()) {
        <mat-spinner diameter="18" aria-hidden="true" />
      } @else {
        <mat-icon aria-hidden="true">download</mat-icon>
      }
      <span>Baixar Excel</span>
    </button>
  `,
  styles: `
    .download-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
    }
    .download-btn mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }
    .download-btn mat-spinner {
      display: inline-block;
    }
  `,
})
export class D1DownloadButtonComponent {
  private readonly facade = inject(InsightsD1FacadeService);
  private readonly snackBar = inject(MatSnackBar);

  readonly dt = input.required<string>();
  readonly disabled = input(false);
  readonly mockMode = input(false);

  readonly downloadError = output<string>();

  readonly loading = signal(false);

  onDownload(): void {
    const dt = this.dt();
    if (!dt || this.disabled()) {
      return;
    }

    this.loading.set(true);
    this.facade.getDownload(dt).subscribe({
      next: (result) => {
        this.loading.set(false);
        const url = result.download.presigned_url?.trim();
        if (url) {
          window.open(url, '_blank', 'noopener,noreferrer');
          return;
        }

        this.snackBar.open(
          `Download real disponível após BFF (E8-US12). Arquivo: ${result.download.filename}`,
          'Fechar',
          { duration: 8000 },
        );
      },
      error: () => {
        this.loading.set(false);
        const message = 'Não foi possível obter o link de download. Tente novamente.';
        this.downloadError.emit(message);
      },
    });
  }
}
