import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { Projet } from '../../core/models';
import { PersonsFacade } from '../../core/services/persons.facade';
import { ProjetsFacade } from '../../core/services/projets.facade';
import { CotisationsFacade } from '../../core/services/cotisations.facade';
import { CurrentUserService } from '../../core/services/current-user.service';
import { GnfPipe } from '../../core/pipes/gnf.pipe';

interface Stats {
  totalPersons: number;
  actifs: number;
  totalProjets: number;
  projetsActifs: number;
  totalCotisations: number;
  nbCotisations: number;
}

interface ProjetCard {
  projet: Projet;
  obtenu: number;
  progression: number;
}

const MAX_PROJETS_AFFICHES = 6;

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    RouterLink,
    DecimalPipe,
    GnfPipe,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatButtonModule,
  ],
  template: `
    <h1 class="page-title">Bonjour {{ user()?.name }} </h1>

    @if (loading()) {
      <div class="loading">
        <mat-progress-spinner mode="indeterminate" diameter="50" />
      </div>
    } @else if (stats(); as s) {
      <div class="stats-grid">
        <mat-card class="stat-card" routerLink="/persons">
          <mat-icon class="stat-icon icon-primary">people</mat-icon>
          <div class="stat-value">{{ s.totalPersons }}</div>
          <div class="stat-label">Personnes</div>
          <div class="stat-sub">{{ s.actifs }} actifs</div>
        </mat-card>

        <mat-card class="stat-card" routerLink="/projets">
          <mat-icon class="stat-icon icon-teal">folder</mat-icon>
          <div class="stat-value">{{ s.totalProjets }}</div>
          <div class="stat-label">Projets actifs</div>
          <div class="stat-sub">{{ s.projetsActifs }} en cours</div>
        </mat-card>

        <mat-card class="stat-card" routerLink="/cotisations">
          <mat-icon class="stat-icon icon-purple">payments</mat-icon>
          <div class="stat-value">{{ s.nbCotisations }}</div>
          <div class="stat-label">Cotisations</div>
          <div class="stat-sub">{{ s.totalCotisations | gnf }} collectés</div>
        </mat-card>
      </div>

      @if (projetCards().length > 0) {
        <h2 class="section-title">Projets en cours</h2>
        <div class="projets-grid">
          @for (pc of projetCards(); track pc.projet.id) {
            <mat-card class="projet-card" [routerLink]="['/projets', pc.projet.id]">
              <div class="projet-card-header">
                <h3>{{ pc.projet.nom }}</h3>
                <span class="chip chip-{{ pc.projet.statut.toLowerCase() }}">{{ pc.projet.statut }}</span>
              </div>
              <div class="projet-amounts">
                <span>{{ pc.obtenu | gnf }} / {{ pc.projet.coutEstime | gnf }}</span>
                <strong>{{ pc.progression | number: '1.0-1' }}%</strong>
              </div>
              <mat-progress-bar mode="determinate" [value]="pc.progression"
                [color]="pc.progression >= 100 ? 'accent' : 'primary'" />
            </mat-card>
          }
        </div>
      }

      @if (isAdmin()) {
        <div class="actions">
          <a mat-flat-button color="primary" routerLink="/persons/new">
            <mat-icon>person_add</mat-icon>
            Nouvelle personne
          </a>
          <a mat-stroked-button color="primary" routerLink="/projets/new">
            <mat-icon>create_new_folder</mat-icon>
            Nouveau projet
          </a>
          <a mat-stroked-button color="primary" routerLink="/cotisations/new">
            <mat-icon>add</mat-icon>
            Nouvelle cotisation
          </a>
        </div>
      }
    } @else if (error()) {
      <mat-card class="error-card">
        <mat-icon color="warn">error</mat-icon>
        <span>{{ error() }}</span>
      </mat-card>
    }
  `,
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private readonly personsFacade = inject(PersonsFacade);
  private readonly projetsFacade = inject(ProjetsFacade);
  private readonly cotisationsFacade = inject(CotisationsFacade);
  private readonly currentUser = inject(CurrentUserService);

  readonly user = this.currentUser.user;
  readonly isAdmin = this.currentUser.isAdmin;
  readonly loading = signal(true);
  readonly stats = signal<Stats | null>(null);
  readonly projetCards = signal<ProjetCard[]>([]);
  readonly error = signal<string | null>(null);

  async ngOnInit(): Promise<void> {
    try {
      const [persons, projets, cotisations, totalsByProjet] = await Promise.all([
        this.personsFacade.findAll(),
        this.projetsFacade.findAll(false),  // exclut les archivés
        this.cotisationsFacade.findAll(),
        this.cotisationsFacade.getTotalsByProjet(),
      ]);
      const totalCotisations = cotisations.reduce((s, c) => s + c.montant, 0);
      this.stats.set({
        totalPersons: persons.length,
        actifs: persons.filter((p) => p.statut === 'Actif').length,
        totalProjets: projets.length,
        projetsActifs: projets.filter((p) => p.statut === 'Actif').length,
        totalCotisations,
        nbCotisations: cotisations.length,
      });
      this.projetCards.set(
        projets
          .filter((p) => p.statut === 'Actif')
          .slice(0, MAX_PROJETS_AFFICHES)
          .map((p) => {
            const obtenu = totalsByProjet.get(p.id) ?? 0;
            const progression = p.coutEstime > 0
              ? Math.min((obtenu / p.coutEstime) * 100, 100)
              : 0;
            return { projet: p, obtenu, progression };
          }),
      );
    } catch (e: unknown) {
      this.error.set(e instanceof Error ? e.message : 'Erreur de chargement');
    } finally {
      this.loading.set(false);
    }
  }
}
