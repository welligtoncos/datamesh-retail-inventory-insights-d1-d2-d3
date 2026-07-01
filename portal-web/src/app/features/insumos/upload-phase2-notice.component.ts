import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-upload-phase2-notice',
  standalone: true,
  imports: [MatIconModule],
  template: `
    <div class="notice" role="note">
      <mat-icon>info_outline</mat-icon>
      <p>
        Upload de CSV pelo portal estará disponível na fase 2. Use AWS CLI ou console S3
        para enviar arquivos ao prefixo <code>insumo/</code>.
      </p>
    </div>
  `,
  styles: `
    .notice {
      display: flex;
      gap: 0.75rem;
      align-items: flex-start;
      padding: 0.75rem 1rem;
      margin-bottom: 1rem;
      border-radius: 4px;
      background: #e8f5e9;
      color: #1b5e20;
      font-size: 0.9rem;
    }
    mat-icon {
      flex-shrink: 0;
    }
    p {
      margin: 0;
      line-height: 1.45;
    }
    code {
      font-family: monospace;
      background: rgba(0, 0, 0, 0.06);
      padding: 0.1rem 0.35rem;
      border-radius: 3px;
    }
  `,
})
export class UploadPhase2NoticeComponent {}
