import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { GoogleAuthService } from '../../core/services/google-auth.service';
import { CurrentUserService } from '../../core/services/current-user.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="login-container">
      <mat-card class="login-card">
        <mat-card-header>
          <mat-card-title>Gestion des adhérents</mat-card-title>
          <mat-card-subtitle>
            Connectez-vous avec votre compte Google
          </mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <p class="info">
            Seuls les comptes autorisés peuvent accéder à l'application.
          </p>
          @if (loading()) {
            <div class="loading">
              <mat-progress-spinner mode="indeterminate" diameter="40" />
              <span>Connexion en cours...</span>
            </div>
          } @else {
            <button
              mat-flat-button
              color="primary"
              class="google-btn"
              (click)="signIn()"
              [disabled]="!authReady()"
            >
              <mat-icon>login</mat-icon>
              Se connecter avec Google
            </button>
            @if (!authReady()) {
              <p class="loading-text">Initialisation...</p>
            }
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly auth = inject(GoogleAuthService);
  private readonly currentUser = inject(CurrentUserService);
  private readonly router = inject(Router);
  private readonly notif = inject(NotificationService);

  readonly loading = signal(false);
  readonly authReady = this.auth.isReady;

  async signIn(): Promise<void> {
    this.loading.set(true);
    try {
      await this.auth.signIn();
      await this.currentUser.resolveCurrentUser();
      this.notif.success('Connexion réussie');
      this.router.navigate(['/dashboard']);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erreur de connexion';
      this.notif.error(message);
    } finally {
      this.loading.set(false);
    }
  }
}
