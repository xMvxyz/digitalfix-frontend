export const environment = {
  production: true,
  apiGatewayUrl: 'https://api.digitalfix.cl',
  apiUrl: 'https://api.digitalfix.cl/api',
  msal: {
    clientId: '00000000-0000-0000-0000-000000000000',
    authority: 'https://login.microsoftonline.com/00000000-0000-0000-0000-000000000000',
    redirectUri: 'https://digitalfix.cl',
    postLogoutRedirectUri: 'https://digitalfix.cl/login',
    scopes: ['api://00000000-0000-0000-0000-000000000000/access_as_user']
  },
  mockAuth: false
};
