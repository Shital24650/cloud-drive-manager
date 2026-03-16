import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = async () => {

  const authService = inject(AuthService);
  const router = inject(Router);

  // wait for auth initialization
  await new Promise(resolve => setTimeout(resolve, 800));

  if (authService.isAuthenticated()) {
    return true;
  }

  router.navigate(['/']);
  return false;
};