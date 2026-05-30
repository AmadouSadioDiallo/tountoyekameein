import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Cotisation, Person, Projet } from '../../core/models';
import { ProjetsFacade } from '../../core/services/projets.facade';
import { CotisationsFacade } from '../../core/services/cotisations.facade';
import { ComptesRendusFacade } from '../../core/services/comptes-rendus.facade';
import { PersonsFacade } from '../../core/services/persons.facade';
import { CurrentUserService } from '../../core/services/current-user.service';
import { NotificationService } from '../../core/services/notification.service';
import { GnfPipe } from '../../core/pipes/gnf.pipe';
import { ConfirmDialogComponent } from '../shared/confirm-dialog.component';

interface CotisationRow {
  cotisation: Cotisation;
  personne: Person | null;
}

@Component({
  selector: 'app-projet-detail',
  standalone: true,
  imports: [
    RouterLink,
    DatePipe,
    DecimalPipe,
    GnfPipe,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatTableModule,
    MatDialogModule,
  ],
  template: `
    <div class="header">
      <a mat-icon-button routerLink="/projets">
        <mat-icon>arrow_back</mat-icon>
      </a>
      <h1>Détail du projet</h1>
      @if (isAdmin() && projet()) {
        <a mat-flat-button color="primary" [routerLink]="['/projets', projet()!.id, 'edit']">
          <mat-icon>edit</mat-icon>
          Modifier
        </a>
        @if (projet()!.archive) {
          <button mat-stroked-button (click)="unarchive()">
            <mat-icon>unarchive</mat-icon>
            Désarchiver
          </button>
        } @else {
          <button mat-stroked-button (click)="archive()">
            <mat-icon>archive</mat-icon>
            Archiver
          </button>
        }
      }
    </div>

    @if (loading()) {
      <div class="loading">
        <mat-progress-spinner mode="indeterminate" diameter="50" />
      </div>
    } @else if (projet(); as p) {
      <mat-card class="detail-card" [class.archived]="p.archive">
        @if (p.archive) {
          <div class="archived-banner">
            <mat-icon>archive</mat-icon>
            Ce projet est archivé. Les nouvelles cotisations sont désactivées.
          </div>
        }

        <div class="projet-header">
          <h2>{{ p.nom }}</h2>
          <span class="chip chip-{{ p.statut.toLowerCase() }}">{{ p.statut }}</span>
        </div>

        @if (p.description) {
          <p class="description">{{ p.description }}</p>
        }

        <div class="amounts">
          <div class="amount-block">
            <div class="amount-label">Coût estimé</div>
            <div class="amount-value">{{ p.coutEstime | gnf }}</div>
          </div>
          <div class="amount-block">
            <div class="amount-label">Montant obtenu</div>
            <div class="amount-value highlight">{{ totalObtenu() | gnf }}</div>
          </div>
          <div class="amount-block">
            <div class="amount-label">Restant à collecter</div>
            <div class="amount-value">{{ (p.coutEstime - totalObtenu()) | gnf }}</div>
          </div>
        </div>

        <div class="progress-section">
          <div class="progress-header">
            <span>Progression</span>
            <strong>{{ progression() | number: '1.0-1' }}%</strong>
          </div>
          <mat-progress-bar
            mode="determinate"
            [value]="progression()"
            [color]="progression() >= 100 ? 'accent' : 'primary'"
          />
        </div>

        <div class="meta">
          <span>Créé le {{ p.dateCreation | date: 'dd/MM/yyyy HH:mm' }}</span>
          <span>Modifié le {{ p.dateModif | date: 'dd/MM/yyyy HH:mm' }}</span>
        </div>
      </mat-card>

      <mat-card class="cr-counter-card" [routerLink]="['/comptes-rendus']" [queryParams]="{ projetId: p.id }">
        <div class="cr-counter">
          <mat-icon class="cr-icon">description</mat-icon>
          <div class="cr-info">
            <div class="cr-count">
              @if (nbComptesRendus() === 0) {
                Aucun compte rendu
              } @else if (nbComptesRendus() === 1) {
                <strong>1</strong> compte rendu
              } @else {
                <strong>{{ nbComptesRendus() }}</strong> comptes rendus
              }
            </div>
            <div class="cr-sub">
              @if (nbComptesRendus() > 0) {
                Cliquez pour voir la liste
              } @else if (isAdmin() && !p.archive) {
                Ajoutez-en un depuis le menu Comptes rendus
              }
            </div>
          </div>
          <mat-icon class="cr-arrow">chevron_right</mat-icon>
        </div>
      </mat-card>

      <div class="contributors-grid">
        <mat-card class="contrib-card contrib-yes" [routerLink]="['/projets', p.id, 'contributors']">
          <div class="contrib-header">
            <mat-icon class="contrib-icon yes">paid</mat-icon>
            <mat-icon class="contrib-arrow">chevron_right</mat-icon>
          </div>
          <div class="contrib-count">{{ nbContributors() }}</div>
          <div class="contrib-label">
            @if (nbContributors() <= 1) {
              Personne a cotisé
            } @else {
              Personnes ont cotisé
            }
          </div>
          <div class="contrib-sub">Voir la liste →</div>
        </mat-card>

        <mat-card class="contrib-card contrib-no" [routerLink]="['/projets', p.id, 'non-contributors']">
          <div class="contrib-header">
            <mat-icon class="contrib-icon no">money_off</mat-icon>
            <mat-icon class="contrib-arrow">chevron_right</mat-icon>
          </div>
          <div class="contrib-count">{{ nbNonContributors() }}</div>
          <div class="contrib-label">
            @if (nbNonContributors() <= 1) {
              Personne n'a pas cotisé
            } @else {
              Personnes n'ont pas cotisé
            }
          </div>
          <div class="contrib-sub">Voir la liste →</div>
        </mat-card>
      </div>

      <mat-card class="cotisations-card">
        <div class="cot-header">
          <h2>Cotisations rattachées</h2>
          @if (isAdmin() && !projet()!.archive) {
            <a mat-flat-button color="primary" [routerLink]="['/cotisations/new']" [queryParams]="{ projetId: p.id }">
              <mat-icon>add</mat-icon>
              Ajouter
            </a>
          }
        </div>

        @if (rows().length === 0) {
          <p class="empty">Aucune cotisation pour ce projet.</p>
        } @else {
          <div class="table-wrap">
            <table mat-table [dataSource]="rows()" class="mat-elevation-z1">
              <ng-container matColumnDef="date">
                <th mat-header-cell *matHeaderCellDef>Date</th>
                <td mat-cell *matCellDef="let r">{{ r.cotisation.date | date: 'dd/MM/yyyy' }}</td>
              </ng-container>
              <ng-container matColumnDef="personne">
                <th mat-header-cell *matHeaderCellDef>Personne</th>
                <td mat-cell *matCellDef="let r">
                  @if (r.personne; as person) {
                    <a [routerLink]="['/persons', person.id]" class="link">
                      {{ person.nom }} {{ person.prenom }}
                    </a>
                  } @else { <span class="muted">—</span> }
                </td>
              </ng-container>
              <ng-container matColumnDef="montant">
                <th mat-header-cell *matHeaderCellDef>Montant</th>
                <td mat-cell *matCellDef="let r">{{ r.cotisation.montant | gnf }}</td>
              </ng-container>
              <ng-container matColumnDef="mode">
                <th mat-header-cell *matHeaderCellDef>Mode</th>
                <td mat-cell *matCellDef="let r">{{ r.cotisation.modePaiement }}</td>
              </ng-container>
              <ng-container matColumnDef="periode">
                <th mat-header-cell *matHeaderCellDef>Période</th>
                <td mat-cell *matCellDef="let r">{{ r.cotisation.periode }}</td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="cotColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: cotColumns"></tr>
            </table>
          </div>
        }
      </mat-card>
    }
  `,
  styleUrl: './projet-detail.component.scss',
})
export class ProjetDetailComponent implements OnInit {
  private readonly projetsFacade = inject(ProjetsFacade);
  private readonly cotisationsFacade = inject(CotisationsFacade);
  private readonly comptesRendusFacade = inject(ComptesRendusFacade);
  private readonly personsFacade = inject(PersonsFacade);
  private readonly currentUser = inject(CurrentUserService);
  private readonly route = inject(ActivatedRoute);
  private readonly notif = inject(NotificationService);
  private readonly dialog = inject(MatDialog);

  readonly projet = signal<Projet | null>(null);
  readonly rows = signal<CotisationRow[]>([]);
  readonly nbComptesRendus = signal(0);
  readonly nbContributors = signal(0);
  readonly nbNonContributors = signal(0);
  readonly loading = signal(true);
  readonly isAdmin = this.currentUser.isAdmin;
  readonly cotColumns = ['date', 'personne', 'montant', 'mode', 'periode'];

  readonly totalObtenu = () =>
    this.rows().reduce((s, r) => s + r.cotisation.montant, 0);

  readonly progression = () => {
    const p = this.projet();
    if (!p || p.coutEstime <= 0) return 0;
    return Math.min((this.totalObtenu() / p.coutEstime) * 100, 100);
  };

  async ngOnInit(): Promise<void> {
    await this.reload();
  }

  async reload(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.loading.set(true);
    try {
      const [projet, cots, persons, crs, statsProjet] = await Promise.all([
        this.projetsFacade.findById(id),
        this.cotisationsFacade.findByProjetId(id),
        this.personsFacade.findAll(),
        this.comptesRendusFacade.findByProjetId(id),
        this.cotisationsFacade.getStatsByPersonForProjet(id),
      ]);
      this.projet.set(projet);
      this.nbComptesRendus.set(crs.length);

      this.nbContributors.set(statsProjet.size);
      const contributorIds = new Set(statsProjet.keys());
      this.nbNonContributors.set(
        persons.filter((p) => p.statut === 'Actif' && !contributorIds.has(p.id)).length,
      );

      const byId = new Map(persons.map((p) => [p.id, p]));
      this.rows.set(
        cots
          .map((c) => ({ cotisation: c, personne: byId.get(c.personId) ?? null }))
          .sort((a, b) => b.cotisation.date.localeCompare(a.cotisation.date)),
      );
    } catch (e: unknown) {
      this.notif.error(e instanceof Error ? e.message : 'Erreur');
    } finally {
      this.loading.set(false);
    }
  }

  async archive(): Promise<void> {
    const p = this.projet();
    if (!p) return;
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Archiver le projet',
        message: `Archiver "${p.nom}" ? Il sera masqué des listes.`,
        confirmLabel: 'Archiver',
      },
    });
    ref.afterClosed().subscribe(async (ok) => {
      if (!ok) return;
      try {
        await this.projetsFacade.archive(p.id);
        this.notif.success('Projet archivé');
        await this.reload();
      } catch (e: unknown) {
        this.notif.error(e instanceof Error ? e.message : 'Erreur');
      }
    });
  }

  async unarchive(): Promise<void> {
    const p = this.projet();
    if (!p) return;
    try {
      await this.projetsFacade.unarchive(p.id);
      this.notif.success('Projet désarchivé');
      await this.reload();
    } catch (e: unknown) {
      this.notif.error(e instanceof Error ? e.message : 'Erreur');
    }
  }
}