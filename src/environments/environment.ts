export const environment = {
  production: false,
  apiGatewayUrl: 'https://sscgh3fxo1.execute-api.us-east-1.amazonaws.com/Stage-API-Prueba',
  apiUrl: 'https://sscgh3fxo1.execute-api.us-east-1.amazonaws.com/Stage-API-Prueba/api',
  msal: {
    clientId: 'd1b27c5e-f951-4d31-81a7-32ee5f305236',
    authority: 'https://login.microsoftonline.com/0c1f677f-ce2e-4fd2-8562-f5052fab4086',
    redirectUri: 'http://localhost:4200/',
    postLogoutRedirectUri: 'http://localhost:4200/login',
    // Scope del recurso protegido (App Registration del BFF)
    scopes: ['api://2cd82242-bced-4d52-974a-09fbbf1a9e4d/access_as_user']
  },
  mockAuth: false
};