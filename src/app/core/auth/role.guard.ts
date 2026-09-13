import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService, UserRole } from './auth.service';

export const roleGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const required = route.data?.['roles'] as UserRole[] | undefined;
  if (required && required.length > 0 && !auth.hasRole(required)) {
    router.navigate(['/dashboard']);
    return false;
  }
  return true;
};
