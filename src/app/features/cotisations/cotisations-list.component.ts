import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Cotisation, MODES_PAIEMENT, ModePaiement, Person, Projet } from '../../core/models';
import { CotisationsFacade } from '../../core/services/cotisations.facade';
import { PersonsFacade } from '../../core/services/persons.facade';
import { ProjetsFacade } from '../../core/services/projets.facade';
import { CurrentUserService } from '../../core/services/current-user.service';
import { NotificationService } from '../../core/services/notification.service';
import { ResponsiveService } from '../../core/services/responsive.service';
import { GnfPipe } from '../../core/pipes/gnf.pipe';
import { ConfirmDialogComponent } from '../shared/confirm-dialog.component';

interface CotisationRow {
  cotisation: Cotisation;
  personne: Person | null;
  projet: Projet | null;
}

@Component({
  selector: 'app-cotisations-list',
  standalone: true,
  imports: [
    RouterLink,
    FormsModule,
    DatePipe,
    GnfPipe,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatTooltipModule,
  ],
  template: `
    <div class="header">
      <h1>Cotisations</h1>
      @if (isAdmin()) {
        <a mat-flat-button color="primary" routerLink="/cotisations/new">
          <mat-icon>add</mat-icon>
          @if (!responsive.isMobile()) { <span>Nouvelle</span> }
        </a>
      }
    </div>

    <div class="filters">
      <mat-form-field appearance="outline" class="search-field">
        <mat-label>Rechercher</mat-label>
        <mat-icon matPrefix>search</mat-icon>
        <input matInput [(ngModel)]="searchTerm" placeholder="Personne, projet..." />
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Projet</mat-label>
        <mat-select [(ngModel)]="filterProjet">
          <mat-option [value]="''">Tous</mat-option>
          @for (p of projets(); track p.id) {
            <mat-option [value]="p.id">{{ p.nom }}</mat-option>
          }
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Mode</mat-label>
        <mat-select [(ngModel)]="filterMode">
          <mat-option [value]="''">Tous</mat-option>
          @for (m of modes; track m) {
            <mat-option [value]="m">{{ m }}</mat-option>
          }
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Période</mat-label>
        <mat-select [(ngModel)]="filterPeriode">
          <mat-option [value]="''">Toutes</mat-option>
          @for (p of periodesOptions(); track p) {
            <mat-option [value]="p">{{ p }}</mat-option>
          }
        </mat-select>
      </mat-form-field>
    </div>

    @if (loading()) {
      <div class="loading">
        <mat-progress-spinner mode="indeterminate" diameter="50" />
      </div>
    } @else {
      <mat-card class="summary-card">
        <div class="summary-row">
          <div class="summary-item">
            <span>Total filtré</span>
            <strong>{{ totalFiltre() | gnf }}</strong>
          </div>
          <div class="summary-item">
            <span>Cotisations</span>
            <strong>{{ filteredRows().length }}</strong>
          </div>
        </div>
      </mat-card>

      @if (responsive.isMobile()) {
        <!-- Vue cartes mobile -->
        <div class="cards-grid">
          @for (r of filteredRows(); track r.cotisation.id) {
            <mat-card class="cot-card">
              <div class="card-header">
                <div class="card-amount">{{ r.cotisation.montant | gnf }}</div>
                <span class="card-date">{{ r.cotisation.date | date: 'dd/MM/yyyy' }}</span>
              </div>
              <div class="card-body">
                <div class="card-row">
                  <mat-icon>person</mat-icon>
                  @if (r.personne; as p) {
                    <a [routerLink]="['/persons', p.id]" class="link">{{ p.nom }} {{ p.prenom }}</a>
                  } @else { <span class="muted">—</span> }
                </div>
                <div class="card-row">
                  <mat-icon>folder</mat-icon>
                  @if (r.projet; as p) {
                    <a [routerLink]="['/projets', p.id]" class="link">{{ p.nom }}</a>
                  } @else { <span class="muted">—</span> }
                </div>
                <div class="card-meta">
                  <span class="chip-mode">{{ r.cotisation.modePaiement }}</span>
                  <span class="chip-periode">{{ r.cotisation.periode }}</span>
                </div>
              </div>
              @if (isAdmin()) {
                <div class="card-actions">
                  <a mat-icon-button [routerLink]="['/cotisations', r.cotisation.id, 'edit']">
                    <mat-icon>edit</mat-icon>
                  </a>
                  <button mat-icon-button color="warn" (click)="confirmDelete(r.cotisation)">
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>
              }
            </mat-card>
          } @empty {
            <mat-card class="empty-card">Aucune cotisation trouvée.</mat-card>
          }
        </div>
      } @else {
        <div class="table-container">
          <table mat-table [dataSource]="filteredRows()" class="mat-elevation-z2">
            <ng-container matColumnDef="id">
              <th mat-header-cell *matHeaderCellDef>ID</th>
              <td mat-cell *matCellDef="let r">{{ r.cotisation.id }}</td>
            </ng-container>
            <ng-container matColumnDef="date">
              <th mat-header-cell *matHeaderCellDef>Date</th>
              <td mat-cell *matCellDef="let r">{{ r.cotisation.date | date: 'dd/MM/yyyy' }}</td>
            </ng-container>
            <ng-container matColumnDef="personne">
              <th mat-header-cell *matHeaderCellDef>Personne</th>
              <td mat-cell *matCellDef="let r">
                @if (r.personne; as p) {
                  <a [routerLink]="['/persons', p.id]" class="link">{{ p.nom }} {{ p.prenom }}</a>
                } @else { <span class="muted">—</span> }
              </td>
            </ng-container>
            <ng-container matColumnDef="projet">
              <th mat-header-cell *matHeaderCellDef>Projet</th>
              <td mat-cell *matCellDef="let r">
                @if (r.projet; as p) {
                  <a [routerLink]="['/projets', p.id]" class="link">{{ p.nom }}</a>
                } @else { <span class="muted">—</span> }
              </td>
            </ng-container>
            <ng-container matColumnDef="montant">
              <th mat-header-cell *matHeaderCellDef>Montant</th>
              <td mat-cell *matCellDef="let r"><strong>{{ r.cotisation.montant | gnf }}</strong></td>
            </ng-container>
            <ng-container matColumnDef="mode">
              <th mat-header-cell *matHeaderCellDef>Mode</th>
              <td mat-cell *matCellDef="let r">{{ r.cotisation.modePaiement }}</td>
            </ng-container>
            <ng-container matColumnDef="periode">
              <th mat-header-cell *matHeaderCellDef>Période</th>
              <td mat-cell *matCellDef="let r">{{ r.cotisation.periode }}</td>
            </ng-container>
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef class="actions-col">Actions</th>
              <td mat-cell *matCellDef="let r" class="actions-col">
                @if (isAdmin()) {
                  <a mat-icon-button [routerLink]="['/cotisations', r.cotisation.id, 'edit']" matTooltip="Modifier">
                    <mat-icon>edit</mat-icon>
                  </a>
                  <button mat-icon-button color="warn" (click)="confirmDelete(r.cotisation)" matTooltip="Supprimer">
                    <mat-icon>delete</mat-icon>
                  </button>
                }
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
            <tr class="mat-row" *matNoDataRow>
              <td class="mat-cell no-data" [attr.colspan]="displayedColumns.length">
                Aucune cotisation trouvée.
              </td>
            </tr>
          </table>
        </div>
      }
    }
  `,
  styles: [
    `
      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
      }
      .header h1 { margin: 0; }
      .filters {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
        margin-bottom: 1rem;
      }
      .search-field { flex: 1; min-width: 200px; }
      .loading { display: flex; justify-content: center; padding: 4rem; }
      .summary-card { padding: 1rem 1.5rem !important; margin-bottom: 1rem; }
      .summary-row { display: flex; gap: 3rem; flex-wrap: wrap; }
      .summary-item { display: flex; gap: 0.5rem; align-items: center; }
      .summary-item strong { color: #3f51b5; font-size: 1.1rem; }
      .table-container { overflow: auto; background: white; border-radius: 4px; }
      table { width: 100%; }
      .actions-col { width: 100px; text-align: right; }
      .no-data { text-align: center; padding: 2rem; color: #888; }
      .link { color: #3f51b5; text-decoration: none; }
      .link:hover { text-decoration: underline; }
      .muted { color: #888; }
      .cards-grid { display: flex; flex-direction: column; gap: 0.75rem; }
      .cot-card { padding: 1rem; }
      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.75rem;
      }
      .card-amount { font-size: 1.25rem; font-weight: 600; color: #3f51b5; }
      .card-date { color: #888; font-size: 0.85rem; }
      .card-body { display: flex; flex-direction: column; gap: 0.5rem; }
      .card-row { display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; }
      .card-row mat-icon { font-size: 1rem; width: 1rem; height: 1rem; color: #888; }
      .card-meta { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 0.25rem; }
      .chip-mode { background: #e3f2fd; color: #0d47a1; padding: 3px 8px; border-radius: 10px; font-size: 0.75rem; }
      .chip-periode { background: #f3e5f5; color: #4a148c; padding: 3px 8px; border-radius: 10px; font-size: 0.75rem; }
      .card-actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.25rem;
        margin-top: 0.75rem;
        padding-top: 0.5rem;
        border-top: 1px solid #f0f0f0;
      }
      .empty-card { padding: 2rem; text-align: center; color: #888; font-style: italic; }
    `,
  ],
})
export class CotisationsListComponent implements OnInit {
  private readonly cotisationsFacade = inject(CotisationsFacade);
  private readonly personsFacade = inject(PersonsFacade);
  private readonly projetsFacade = inject(ProjetsFacade);
  private readonly currentUser = inject(CurrentUserService);
  private readonly notif = inject(NotificationService);
  private readonly dialog = inject(MatDialog);
  readonly responsive = inject(ResponsiveService);

  readonly cotisations = signal<Cotisation[]>([]);
  readonly persons = signal<Person[]>([]);
  /** Tous les projets non archivés (pour le filtre du select). */
  readonly projets = signal<Projet[]>([]);
  /** Tous les projets (archivés inclus, pour résoudre les noms même si archivés). */
  readonly allProjets = signal<Projet[]>([]);
  /** IDs des projets archivés - pour masquer ces cotisations de la liste. */
  readonly archivedProjetIds = signal<Set<string>>(new Set());
  readonly loading = signal(true);
  readonly modes = MODES_PAIEMENT;
  searchTerm = '';
  filterProjet = '';
  filterMode: ModePaiement | '' = '';
  filterPeriode = '';

  readonly isAdmin = this.currentUser.isAdmin;
  readonly displayedColumns = [
    'id', 'date', 'personne', 'projet', 'montant', 'mode', 'periode', 'actions',
  ];

  /** Cotisations dont le projet n'est PAS archivé. */
  readonly visibleCotisations = computed(() =>
    this.cotisations().filter((c) => !this.archivedProjetIds().has(c.projetId)),
  );

  readonly rows = computed<CotisationRow[]>(() => {
    const pById = new Map(this.persons().map((p) => [p.id, p]));
    const prById = new Map(this.allProjets().map((p) => [p.id, p]));
    return this.visibleCotisations()
      .map((c) => ({
        cotisation: c,
        personne: pById.get(c.personId) ?? null,
        projet: prById.get(c.projetId) ?? null,
      }))
      .sort((a, b) => b.cotisation.date.localeCompare(a.cotisation.date));
  });

  readonly periodesOptions = computed(() =>
    [...new Set(this.visibleCotisations().map((c) => c.periode).filter(Boolean))].sort(),
  );

  readonly filteredRows = computed(() => {
    const term = this.searchTerm.toLowerCase().trim();
    return this.rows().filter((r) => {
      if (this.filterProjet && r.cotisation.projetId !== this.filterProjet) return false;
      if (this.filterMode && r.cotisation.modePaiement !== this.filterMode) return false;
      if (this.filterPeriode && r.cotisation.periode !== this.filterPeriode) return false;
      if (!term) return true;
      return (
        r.cotisation.id.toLowerCase().includes(term) ||
        (r.personne?.nom ?? '').toLowerCase().includes(term) ||
        (r.personne?.prenom ?? '').toLowerCase().includes(term) ||
        (r.projet?.nom ?? '').toLowerCase().includes(term)
      );
    });
  });

  readonly totalFiltre = computed(() =>
    this.filteredRows().reduce((s, r) => s + r.cotisation.montant, 0),
  );

  async ngOnInit(): Promise<void> {
    await this.reload();
  }

  async reload(): Promise<void> {
    this.loading.set(true);
    try {
      const [cots, persons, projetsActifs, projetsAll] = await Promise.all([
        this.cotisationsFacade.findAll(),
        this.personsFacade.findAll(),
        this.projetsFacade.findAll(false),  // sans archivés
        this.projetsFacade.findAll(true),   // avec archivés
      ]);
      this.cotisations.set(cots);
      this.persons.set(persons);
      this.projets.set(projetsActifs);
      this.allProjets.set(projetsAll);
      this.archivedProjetIds.set(
        new Set(projetsAll.filter((p) => p.archive).map((p) => p.id)),
      );
    } catch (e: unknown) {
      this.notif.error(e instanceof Error ? e.message : 'Erreur de chargement');
    } finally {
      this.loading.set(false);
    }
  }

  confirmDelete(c: Cotisation): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmer la suppression',
        message: `Supprimer la cotisation ${c.id} (${c.montant} GNF) ?`,
        confirmLabel: 'Supprimer',
        color: 'warn',
      },
    });
    ref.afterClosed().subscribe(async (ok) => {
      if (!ok) return;
      try {
        await this.cotisationsFacade.delete(c.id);
        this.notif.success('Cotisation supprimée');
        await this.reload();
      } catch (e: unknown) {
        this.notif.error(e instanceof Error ? e.message : 'Erreur');
      }
    });
  }
}
