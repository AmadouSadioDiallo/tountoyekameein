import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CurrentUserService } from '../services/current-user.service';
import { NotificationService } from '../services/notification.service';

export const adminGuard: CanActivateFn = () => {
  const currentUser = inject(CurrentUserService);
  const router = inject(Router);
  const notif = inject(NotificationService);

  if (!currentUser.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }
  if (!currentUser.isAdmin()) {
    notif.error('Accès refusé : réservé aux administrateurs.');
    router.navigate(['/persons']);
    return false;
  }
  return true;
};
