import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
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

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    RouterLink,
    GnfPipe,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatButtonModule,
  ],
  template: `
    <h1 class="page-title">Bonjour {{ user()?.name }} 👋</h1>

    @if (loading()) {
      <div class="loading">
        <mat-progress-spinner mode="indeterminate" diameter="50" />
      </div>
    } @else if (stats(); as s) {
      <div class="stats-grid">
        <mat-card class="stat-card" routerLink="/persons">
          <mat-icon class="stat-icon" style="color:#3f51b5">people</mat-icon>
          <div class="stat-value">{{ s.totalPersons }}</div>
          <div class="stat-label">Personnes</div>
          <div class="stat-sub">{{ s.actifs }} actifs</div>
        </mat-card>

        <mat-card class="stat-card" routerLink="/projets">
          <mat-icon class="stat-icon" style="color:#009688">folder</mat-icon>
          <div class="stat-value">{{ s.totalProjets }}</div>
          <div class="stat-label">Projets actifs</div>
          <div class="stat-sub">{{ s.projetsActifs }} en cours</div>
        </mat-card>

        <mat-card class="stat-card" routerLink="/cotisations">
          <mat-icon class="stat-icon" style="color:#673ab7">payments</mat-icon>
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
  styles: [
    `
      .page-title { margin-bottom: 2rem; font-weight: 500; }
      .section-title { margin: 2rem 0 1rem; font-weight: 500; font-size: 1.25rem; }
      .loading { display: flex; justify-content: center; padding: 4rem; }
      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
        gap: 1.25rem;
        margin-bottom: 2rem;
      }
      .stat-card {
        padding: 1.5rem;
        text-align: center;
        cursor: pointer;
        transition: transform 0.15s, box-shadow 0.15s;
      }
      .stat-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      }
      .stat-icon { font-size: 2.5rem; width: 2.5rem; height: 2.5rem; }
      .stat-value { font-size: 2rem; font-weight: 600; margin-top: 0.5rem; }
      .stat-label { color: #666; font-size: 0.95rem; margin-top: 0.25rem; }
      .stat-sub { color: #999; font-size: 0.8rem; margin-top: 0.5rem; }
      .projets-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
        gap: 1rem;
        margin-bottom: 2rem;
      }
      .projet-card { padding: 1.5rem; cursor: pointer; transition: box-shadow 0.15s; }
      .projet-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
      .projet-card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.75rem;
      }
      .projet-card-header h3 { margin: 0; font-size: 1.05rem; }
      .chip { padding: 3px 8px; border-radius: 10px; font-size: 0.75rem; font-weight: 500; }
      .chip-actif { background: #c8e6c9; color: #1b5e20; }
      .chip-terminé { background: #bbdefb; color: #0d47a1; }
      .chip-annulé { background: #ffcdd2; color: #b71c1c; }
      .projet-amounts {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.5rem;
        font-size: 0.9rem;
        color: #555;
      }
      .actions { margin-top: 2rem; display: flex; gap: 0.75rem; flex-wrap: wrap; }
      .error-card { padding: 1rem; display: flex; gap: 1rem; align-items: center; }
    `,
  ],
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
          .slice(0, 6)
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
