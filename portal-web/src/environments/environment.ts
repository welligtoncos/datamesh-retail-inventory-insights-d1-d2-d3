export const environment = {
  production: false,
  apiBaseUrl: 'https://jvpw3k4mnf.execute-api.us-east-1.amazonaws.com',
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
