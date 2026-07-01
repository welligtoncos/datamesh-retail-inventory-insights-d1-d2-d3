import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-insumos-empty-state',
  standalone: true,
  imports: [MatIconModule],
  template: `
    <div class="empty" role="status">
      <mat-icon>folder_open</mat-icon>
      <p>Nenhum arquivo encontrado em insumo/.</p>
    </div>
  `,
  styles: `
    .empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
      padding: 2rem;
      color: rgba(0, 0, 0, 0.54);
      text-align: center;
    }
    mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
    }
    p {
      margin: 0;
    }
  `,
})
export class InsumosEmptyStateComponent {}
