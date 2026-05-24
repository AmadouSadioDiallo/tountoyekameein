import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login.component').then((m) => m.LoginComponent),
  },
  {
    path: '',
    loadComponent: () =>
      import('./layouts/main-layout.component').then((m) => m.MainLayoutComponent),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'persons',
        loadComponent: () =>
          import('./features/persons/persons-list.component').then((m) => m.PersonsListComponent),
      },
      {
        path: 'persons/new',
        loadComponent: () =>
          import('./features/persons/person-form.component').then((m) => m.PersonFormComponent),
        canActivate: [adminGuard],
      },
      {
        path: 'persons/:id',
        loadComponent: () =>
          import('./features/persons/person-detail.component').then((m) => m.PersonDetailComponent),
      },
      {
        path: 'persons/:id/edit',
        loadComponent: () =>
          import('./features/persons/person-form.component').then((m) => m.PersonFormComponent),
        canActivate: [adminGuard],
      },
      {
        path: 'projets',
        loadComponent: () =>
          import('./features/projets/projets-list.component').then((m) => m.ProjetsListComponent),
      },
      {
        path: 'projets/new',
        loadComponent: () =>
          import('./features/projets/projet-form.component').then((m) => m.ProjetFormComponent),
        canActivate: [adminGuard],
      },
      {
        path: 'projets/:id',
        loadComponent: () =>
          import('./features/projets/projet-detail.component').then((m) => m.ProjetDetailComponent),
      },
      {
        path: 'projets/:id/edit',
        loadComponent: () =>
          import('./features/projets/projet-form.component').then((m) => m.ProjetFormComponent),
        canActivate: [adminGuard],
      },
      {
        path: 'cotisations',
        loadComponent: () =>
          import('./features/cotisations/cotisations-list.component').then((m) => m.CotisationsListComponent),
      },
      {
        path: 'cotisations/new',
        loadComponent: () =>
          import('./features/cotisations/cotisation-form.component').then((m) => m.CotisationFormComponent),
        canActivate: [adminGuard],
      },
      {
        path: 'cotisations/:id/edit',
        loadComponent: () =>
          import('./features/cotisations/cotisation-form.component').then((m) => m.CotisationFormComponent),
        canActivate: [adminGuard],
      },
      {
        path: 'cotisations/contributors',
        loadComponent: () =>
          import('./features/cotisations/contributors.component').then((m) => m.ContributorsComponent),
      },
      {
        path: 'cotisations/non-contributors',
        loadComponent: () =>
          import('./features/cotisations/non-contributors.component').then((m) => m.NonContributorsComponent),
      },
      {
        path: 'comptes-rendus',
        loadComponent: () =>
          import('./features/comptes-rendus/comptes-rendus-list.component').then((m) => m.ComptesRendusListComponent),
      },
      {
        path: 'comptes-rendus/new',
        loadComponent: () =>
          import('./features/comptes-rendus/compte-rendu-form.component').then((m) => m.CompteRenduFormComponent),
        canActivate: [adminGuard],
      },
      {
        path: 'comptes-rendus/:id',
        loadComponent: () =>
          import('./features/comptes-rendus/compte-rendu-detail.component').then((m) => m.CompteRenduDetailComponent),
      },
      {
        path: 'comptes-rendus/:id/edit',
        loadComponent: () =>
          import('./features/comptes-rendus/compte-rendu-form.component').then((m) => m.CompteRenduFormComponent),
        canActivate: [adminGuard],
      },
      {
        path: 'historique',
        loadComponent: () =>
          import('./features/historique/historique.component').then((m) => m.HistoriqueComponent),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
