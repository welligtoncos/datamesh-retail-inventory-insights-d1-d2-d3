export const environment = {
  production: false,
  /** Relative path proxied by ng serve → API GW (evita CORS em localhost). Ver proxy.conf.json */
  apiBaseUrl: '/api',
  cognito: {
    authority: 'https://cognito-idp.us-east-1.amazonaws.com/us-east-1_yJLzwZgZE',
    clientId: 'co18jsioudbvk36n8a4hdih4q',
    redirectUri: 'http://localhost:4200/',
    postLogoutRedirectUri: 'http://localhost:4200/login',
    hostedUiBaseUrl:
      'https://retail-inventory-insights-portal-dev-303238378103.auth.us-east-1.amazoncognito.com',
    scope: 'openid profile email',
  },
};
