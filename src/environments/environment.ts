export const environment = {
  production: false,
  apiGatewayUrl: 'http://localhost:8080',
  apiUrl: 'http://localhost:8080/api',
  msal: {
    clientId: 'TU_CLIENT_ID_ANGULAR_ENTRA_ID',
    authority: 'https://login.microsoftonline.com/TU_TENANT_ID',
    redirectUri: 'http://localhost:4200/',
    postLogoutRedirectUri: 'http://localhost:4200/login',
    // Scope del recurso protegido (App Registration del BFF)
    scopes: ['api://TU_API_CLIENT_ID/access_as_user']
  },
  mockAuth: false
};