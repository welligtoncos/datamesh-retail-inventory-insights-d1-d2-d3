import { AuthConfig } from 'angular-oauth2-oidc';

import { environment } from '../../../environments/environment';

export const authConfig: AuthConfig = {
  issuer: environment.cognito.authority,
  redirectUri: environment.cognito.redirectUri,
  clientId: environment.cognito.clientId,
  responseType: 'code',
  scope: environment.cognito.scope,
  showDebugInformation: !environment.production,
  strictDiscoveryDocumentValidation: false,
  useSilentRefresh: false,
  sessionChecksEnabled: false,
};
