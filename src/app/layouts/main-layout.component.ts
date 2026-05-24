import { Component, ViewChild, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { filter } from 'rxjs/operators';
import { CurrentUserService } from '../core/services/current-user.service';
import { ResponsiveService } from '../core/services/responsive.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatDividerModule,
  ],
  template: `
    <mat-sidenav-container class="layout">
      <mat-sidenav
        #drawer
        [mode]="responsive.isHandset() ? 'over' : 'side'"
        [opened]="!responsive.isHandset()"
        class="sidenav"
        [class.mobile]="responsive.isHandset()"
      >
        <div class="brand">
          <mat-icon class="brand-icon">groups</mat-icon>
          <div>
            <div class="brand-title">Adhérents</div>
            <div class="brand-sub">Gestion</div>
          </div>
        </div>
        <mat-nav-list (click)="onNavClick()">
          <a mat-list-item routerLink="/dashboard" routerLinkActive="active-link">
            <mat-icon matListItemIcon>dashboard</mat-icon>
            <span matListItemTitle>Tableau de bord</span>
          </a>
          <a mat-list-item routerLink="/persons" routerLinkActive="active-link">
            <mat-icon matListItemIcon>people</mat-icon>
            <span matListItemTitle>Personnes</span>
          </a>
          <a mat-list-item routerLink="/projets" routerLinkActive="active-link">
            <mat-icon matListItemIcon>folder</mat-icon>
            <span matListItemTitle>Projets</span>
          </a>
          <a mat-list-item routerLink="/cotisations" routerLinkActive="active-link" [routerLinkActiveOptions]="{ exact: true }">
            <mat-icon matListItemIcon>payments</mat-icon>
            <span matListItemTitle>Cotisations</span>
          </a>
          <a mat-list-item routerLink="/comptes-rendus" routerLinkActive="active-link">
            <mat-icon matListItemIcon>description</mat-icon>
            <span matListItemTitle>Comptes rendus</span>
          </a>
          <mat-divider />
          <a mat-list-item routerLink="/cotisations/contributors" routerLinkActive="active-link">
            <mat-icon matListItemIcon>paid</mat-icon>
            <span matListItemTitle>Ont cotisé</span>
          </a>
          <a mat-list-item routerLink="/cotisations/non-contributors" routerLinkActive="active-link">
            <mat-icon matListItemIcon>money_off</mat-icon>
            <span matListItemTitle>N'ont pas cotisé</span>
          </a>
          <mat-divider />
          <a mat-list-item routerLink="/historique" routerLinkActive="active-link">
            <mat-icon matListItemIcon>history</mat-icon>
            <span matListItemTitle>Historique</span>
          </a>
        </mat-nav-list>
      </mat-sidenav>

      <mat-sidenav-content>
        <mat-toolbar color="primary" class="topbar">
          <button mat-icon-button (click)="drawer.toggle()" aria-label="Menu">
            <mat-icon>menu</mat-icon>
          </button>
          @if (responsive.isHandset()) {
            <span class="topbar-title">Adhérents</span>
          }
          <span class="spacer"></span>
          @if (user(); as u) {
            <button mat-button [matMenuTriggerFor]="userMenu" class="user-btn">
              @if (u.picture) {
                <img [src]="u.picture" [alt]="u.name" class="avatar" />
              } @else {
                <mat-icon>account_circle</mat-icon>
              }
              @if (!responsive.isHandset()) {
                <span class="user-name">{{ u.name }}</span>
              }
              <span class="role-badge" [class.admin]="u.role === 'ADMIN'">
                {{ u.role }}
              </span>
            </button>
            <mat-menu #userMenu="matMenu">
              <button mat-menu-item disabled>
                <mat-icon>email</mat-icon>
                {{ u.email }}
              </button>
              <button mat-menu-item (click)="signOut()">
                <mat-icon>logout</mat-icon>
                Déconnexion
              </button>
            </mat-menu>
          }
        </mat-toolbar>

        <main class="content" [class.mobile-content]="responsive.isHandset()">
          <router-outlet />
        </main>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [
    `
      .layout { height: 100vh; }
      .sidenav {
        width: 260px;
        background: #fafafa;
        border-right: 1px solid #e0e0e0;
      }
      .sidenav.mobile { width: 280px; }
      .brand {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 1.25rem 1rem;
        border-bottom: 1px solid #e0e0e0;
      }
      .brand-icon { font-size: 2rem; width: 2rem; height: 2rem; color: #3f51b5; }
      .brand-title { font-weight: 600; font-size: 1.05rem; }
      .brand-sub { font-size: 0.8rem; color: #888; }
      .topbar { gap: 0.5rem; }
      .topbar-title { font-size: 1rem; font-weight: 500; }
      .spacer { flex: 1 1 auto; }
      .avatar {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        margin-right: 0.5rem;
        vertical-align: middle;
      }
      .user-name { margin-right: 0.5rem; }
      .user-btn { min-width: 0; padding: 0 0.5rem; }
      .role-badge {
        font-size: 0.7rem;
        padding: 2px 8px;
        border-radius: 10px;
        background: #607d8b;
        color: white;
      }
      .role-badge.admin { background: #d32f2f; }
      .content {
        padding: 1.5rem;
        max-width: 1400px;
        margin: 0 auto;
      }
      .mobile-content { padding: 1rem; }
      .active-link {
        background: #e8eaf6 !important;
        color: #3f51b5 !important;
      }
      .active-link mat-icon { color: #3f51b5; }
    `,
  ],
})
export class MainLayoutComponent {
  @ViewChild('drawer') drawer!: MatSidenav;

  private readonly currentUser = inject(CurrentUserService);
  private readonly router = inject(Router);
  readonly responsive = inject(ResponsiveService);

  readonly user = this.currentUser.user;

  constructor() {
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => {
        if (this.responsive.isHandset() && this.drawer?.opened) {
          this.drawer.close();
        }
      });
  }

  onNavClick(): void {
    if (this.responsive.isHandset() && this.drawer?.opened) {
      setTimeout(() => this.drawer.close(), 150);
    }
  }

  signOut(): void {
    this.currentUser.signOut();
    this.router.navigate(['/login']);
  }
}
