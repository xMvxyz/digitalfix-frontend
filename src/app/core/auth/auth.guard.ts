import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService, UserRole } from './auth.service';

export const authGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isAuthenticated) {
    router.navigate(['/login']);
    return false;
  }

  const requiredRoles = route.data?.['roles'] as UserRole[] | undefined;
  if (requiredRoles && requiredRoles.length > 0 && !auth.hasRole(requiredRoles)) {
    router.navigate(['/dashboard']);
    return false;
  }

  return true;
};
