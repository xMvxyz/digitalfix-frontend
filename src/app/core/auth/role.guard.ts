import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { MsalService } from '@azure/msal-angular';
import { AccountInfo } from '@azure/msal-browser';
import { environment } from '../../../environments/environment';

function readRolesFromJwt(jwt: string): string[] {
  try {
    const payload = jwt.split('.')[1];
    if (!payload) return [];
    const json = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return Array.isArray(json?.['roles']) ? (json['roles'] as string[]) : [];
  } catch {
    return [];
  }
}

export const roleGuard: CanActivateFn = async (route, state) => {
  const msalService = inject(MsalService);
  const router = inject(Router);

  const account: AccountInfo | undefined =
    msalService.instance.getActiveAccount() ?? msalService.instance.getAllAccounts()[0];
  const expectedRoles: string[] = route.data?.['roles'] ?? [];

  if (!account) {
    router.navigate(['/login']);
    return false;
  }

  // Los roles de aplicación de Entra ID viajan en el ACCESS token (el ID token no los trae)
  const idRoles: string[] = ((account.idTokenClaims as any)?.['roles'] as string[]) ?? [];
  let tokenRoles: string[] = [];
  try {
    const res = await msalService.instance.acquireTokenSilent({ scopes: environment.msal.scopes, account });
    tokenRoles = readRolesFromJwt(res.accessToken);
  } catch {
    // Sin token silencioso se evalúa solo con lo del ID token
  }

  const userRoles = [...idRoles, ...tokenRoles].map(r => r.toLowerCase());
  const hasRole = expectedRoles.some(r => userRoles.includes(r.toLowerCase()));
  if (!hasRole) {
    router.navigate(['/dashboard']);
    return false;
  }

  return true;
};
