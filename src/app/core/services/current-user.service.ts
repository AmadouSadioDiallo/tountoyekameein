import { Injectable, computed, inject, signal } from '@angular/core';
import { CurrentUser } from '../models';
import { GoogleAuthService } from './google-auth.service';
import { UsersRepository } from './users.repository';

@Injectable({ providedIn: 'root' })
export class CurrentUserService {
  private readonly googleAuth = inject(GoogleAuthService);
  private readonly usersRepo = inject(UsersRepository);

  private readonly _user = signal<CurrentUser | null>(null);
  readonly user = this._user.asReadonly();

  readonly isAuthenticated = computed(() => this._user() !== null);
  readonly isAdmin = computed(() => this._user()?.role === 'ADMIN');

  async resolveCurrentUser(): Promise<CurrentUser | null> {
    const gUser = this.googleAuth.googleUser();
    if (!gUser) {
      this._user.set(null);
      return null;
    }
    const appUser = await this.usersRepo.findByEmail(gUser.email);
    if (!appUser) {
      this.googleAuth.signOut();
      this._user.set(null);
      throw new Error(
        `L'email ${gUser.email} n'est pas autorisé. Contactez un administrateur.`,
      );
    }
    const current: CurrentUser = {
      email: gUser.email,
      name: gUser.name,
      picture: gUser.picture,
      role: appUser.role,
    };
    this._user.set(current);
    return current;
  }

  signOut(): void {
    this.googleAuth.signOut();
    this._user.set(null);
  }
}
