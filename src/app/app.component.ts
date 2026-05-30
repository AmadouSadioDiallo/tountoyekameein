import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { GoogleAuthService } from './core/services/google-auth.service';
import { CurrentUserService } from './core/services/current-user.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MatProgressSpinnerModule],
  template: `
    @if (initializing()) {
      <div class="boot">
        <mat-progress-spinner mode="indeterminate" diameter="60" />
        <p>Initialisation...</p>
      </div>
    } @else {
      <router-outlet />
    }
  `,
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  private readonly auth = inject(GoogleAuthService);
  private readonly currentUser = inject(CurrentUserService);
  private readonly router = inject(Router);

  readonly initializing = signal(true);

  async ngOnInit(): Promise<void> {
    try {
      await this.auth.initialize();
      const restored = await this.auth.tryRestoreSession();
      if (restored) {
        try {
          await this.currentUser.resolveCurrentUser();
        } catch {
          this.router.navigate(['/login']);
        }
      }
    } catch (e) {
      console.error('App init failed', e);
    } finally {
      this.initializing.set(false);
    }
  }
}
