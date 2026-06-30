import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-placeholder-page',
  standalone: true,
  imports: [MatCardModule, MatIconModule],
  template: `
    <mat-card class="placeholder">
      <mat-card-header>
        <mat-icon mat-card-avatar>construction</mat-icon>
        <mat-card-title>{{ title }}</mat-card-title>
        <mat-card-subtitle>Em desenvolvimento</mat-card-subtitle>
      </mat-card-header>
      <mat-card-content>
        <p>
          Módulo em desenvolvimento. Disponível nas próximas entregas W7.
        </p>
      </mat-card-content>
    </mat-card>
  `,
  styles: `
    .placeholder {
      max-width: 640px;
    }
  `,
})
export class PlaceholderPageComponent {
  private readonly route = inject(ActivatedRoute);
  readonly title = this.route.snapshot.data['title'] as string;
}
