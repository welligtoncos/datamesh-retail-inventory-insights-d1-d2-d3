import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';

import { AuthService } from '../../core/auth/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MatToolbarModule, MatButtonModule, MatCardModule],
  template: `
    <mat-toolbar color="primary">
      <span>Portal Datamesh · W7</span>
      <span class="spacer"></span>
      <button mat-button type="button" (click)="logout()">Sair</button>
    </mat-toolbar>

    <main class="content">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Bem-vindo</mat-card-title>
          <mat-card-subtitle>{{ email() ?? 'usuário autenticado' }}</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <p>Sessão Cognito ativa. Shell completo em E8-US03.</p>
          <p class="api-result">Teste API BFF: {{ apiStatus() }}</p>
        </mat-card-content>
        <mat-card-actions>
          <button mat-stroked-button type="button" (click)="testApi()">Testar API (GET /health)</button>
        </mat-card-actions>
      </mat-card>
    </main>
  `,
  styles: `
    .spacer {
      flex: 1;
    }
    .content {
      padding: 1.5rem;
      max-width: 640px;
      margin: 0 auto;
    }
    .api-result {
      font-family: monospace;
      font-size: 0.9rem;
    }
  `,
})
export class HomeComponent {
  private readonly auth = inject(AuthService);
  private readonly http = inject(HttpClient);

  readonly email = signal(this.auth.getUserEmail());
  readonly apiStatus = signal('não testado');

  logout(): void {
    this.auth.logout();
  }

  testApi(): void {
    const url = `${environment.apiBaseUrl.replace(/\/$/, '')}/health`;
    this.http.get(url, { responseType: 'text', observe: 'response' }).subscribe({
      next: (res) => {
        this.apiStatus.set(`HTTP ${res.status} — ${res.body?.slice(0, 80) ?? ''}`);
      },
      error: (err) => {
        const status = err.status ?? 'erro';
        this.apiStatus.set(`HTTP ${status} — ${err.message ?? 'falha'}`);
      },
    });
  }
}
