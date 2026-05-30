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
            <div class="brand-title">Tountoye Ka Méeïn</div>
            <div class="brand-sub">Gestion Adhérents</div>
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
  styleUrl: './main-layout.component.scss',
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
