import { Injectable } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';

import { environment } from '../../../environments/environment';
import { authConfig } from './auth.config';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private readonly oauth: OAuthService) {}

  async init(): Promise<void> {
    this.oauth.configure(authConfig);
    await this.oauth.loadDiscoveryDocumentAndTryLogin();
  }

  login(): void {
    this.oauth.initCodeFlow();
  }

  logout(): void {
    this.oauth.logOut(true);
    const { clientId, postLogoutRedirectUri, hostedUiBaseUrl } = environment.cognito;
    const logoutUrl = `${hostedUiBaseUrl}/logout?client_id=${encodeURIComponent(clientId)}&logout_uri=${encodeURIComponent(postLogoutRedirectUri)}`;
    window.location.href = logoutUrl;
  }

  isAuthenticated(): boolean {
    return this.oauth.hasValidAccessToken();
  }

  getUserEmail(): string | null {
    const claims = this.oauth.getIdentityClaims() as Record<string, string> | null;
    return claims?.['email'] ?? null;
  }

  getAccessToken(): string | null {
    return this.oauth.getAccessToken() ?? null;
  }
}
