import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-insight-missing-partition-banner',
  standalone: true,
  imports: [MatCardModule, MatButtonModule, MatIconModule, MatTooltipModule, RouterLink],
  template: `
    <mat-card class="missing-card" appearance="outlined">
      <mat-card-content>
        <div class="banner-row">
          <mat-icon class="warn-icon" aria-hidden="true">warning</mat-icon>
          <div class="banner-text">
            <p>
              Não há partição enriquecida para <strong>{{ dt() }}</strong>. Processe o dia para
              gerar o insight {{ insightCode() }}.
            </p>
            <a
              mat-stroked-button
              routerLink="/operacoes"
              matTooltip="Disparo do pipeline estará disponível em E8-US09"
            >
              Ir para Operações
            </a>
          </div>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: `
    .missing-card {
      background: #fff7ed;
      border-color: #fdba74;
      margin: 1rem 0;
    }
    .banner-row {
      display: flex;
      gap: 0.75rem;
      align-items: flex-start;
    }
    .warn-icon {
      color: #ea580c;
      flex-shrink: 0;
    }
    .banner-text p {
      margin: 0 0 0.75rem;
      line-height: 1.5;
    }
  `,
})
export class InsightMissingPartitionBannerComponent {
  readonly dt = input('');
  readonly insightCode = input('D-1');
}
