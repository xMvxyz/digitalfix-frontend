import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { MsalService } from '@azure/msal-angular';

export const roleGuard: CanActivateFn = (route, state) => {
  const msalService = inject(MsalService);
  const router = inject(Router);

  const account = msalService.instance.getActiveAccount();
  const expectedRoles: string[] = route.data?.['roles'] ?? [];

  if (!account) {
    router.navigate(['/login']);
    return false;
  }

  const idTokenClaims = account.idTokenClaims as { roles?: string[] };
  const userRoles = idTokenClaims?.roles ?? [];

  const hasRole = expectedRoles.some(r => userRoles.includes(r));
  if (!hasRole) {
    router.navigate(['/dashboard']);
    return false;
  }

  return true;
};