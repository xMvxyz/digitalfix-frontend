export const environment = {
  production: false,
  apiGatewayUrl: 'http://localhost:8080', // BFF via API Gateway - cambiar por real AWS
  msal: {
    // Reemplazar con datos reales del tenant Entra ID para EP1
    clientId: '00000000-0000-0000-0000-000000000000',
    authority: 'https://login.microsoftonline.com/00000000-0000-0000-0000-000000000000',
    redirectUri: 'http://localhost:4200',
    postLogoutRedirectUri: 'http://localhost:4200/login',
    scopes: ['api://00000000-0000-0000-0000-000000000000/access_as_user']
  },
  mockAuth: true // true para levantar sin Entra ID real; poner false cuando tengan tenant
};
