import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CompteRendu, Projet } from '../../core/models';
import { ComptesRendusFacade } from '../../core/services/comptes-rendus.facade';
import { ProjetsFacade } from '../../core/services/projets.facade';
import { CurrentUserService } from '../../core/services/current-user.service';
import { NotificationService } from '../../core/services/notification.service';
import { ResponsiveService } from '../../core/services/responsive.service';
import { ConfirmDialogComponent } from '../shared/confirm-dialog.component';

type SortColumn = 'id' | 'date' | 'nomReunion' | 'redacteur' | 'lieu' | 'projet';

interface CompteRenduRow {
  cr: CompteRendu;
  projet: Projet | null;
}

@Component({
  selector: 'app-comptes-rendus-list',
  standalone: true,
  imports: [
    RouterLink,
    FormsModule,
    DatePipe,
    MatTableModule,
    MatSortModule,
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
      <h1>Comptes rendus</h1>
      @if (isAdmin()) {
        <a mat-flat-button color="primary" routerLink="/comptes-rendus/new">
          <mat-icon>add</mat-icon>
          @if (!responsive.isMobile()) { <span>Nouveau CR</span> }
        </a>
      }
    </div>

    <div class="filters">
      <mat-form-field appearance="outline" class="search-field">
        <mat-label>Rechercher</mat-label>
        <mat-icon matPrefix>search</mat-icon>
        <input matInput [(ngModel)]="searchTerm" placeholder="Nom, rédacteur, contenu..." />
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Projet</mat-label>
        <mat-select [(ngModel)]="filterProjet">
          <mat-option [value]="''">Tous</mat-option>
          <mat-option [value]="'NONE'">— Sans projet —</mat-option>
          @for (p of projets(); track p.id) {
            <mat-option [value]="p.id">{{ p.nom }}</mat-option>
          }
        </mat-select>
      </mat-form-field>
    </div>

    @if (loading()) {
      <div class="loading">
        <mat-progress-spinner mode="indeterminate" diameter="50" />
      </div>
    } @else if (responsive.isMobile()) {
      <!-- Vue cartes mobile -->
      <div class="mobile-sort">
        <mat-form-field appearance="outline" class="sort-field">
          <mat-label>Trier par</mat-label>
          <select matNativeControl [(ngModel)]="mobileSortBy" (ngModelChange)="onMobileSortChange()">
            <option value="date-desc">Date (récent → ancien)</option>
            <option value="date-asc">Date (ancien → récent)</option>
            <option value="nomReunion-asc">Réunion (A → Z)</option>
            <option value="nomReunion-desc">Réunion (Z → A)</option>
            <option value="redacteur-asc">Rédacteur (A → Z)</option>
          </select>
        </mat-form-field>
      </div>

      <div class="cards-grid">
        @for (r of sortedAndFilteredRows(); track r.cr.id) {
          <mat-card class="cr-card" [routerLink]="['/comptes-rendus', r.cr.id]">
            <div class="card-header">
              <strong>{{ r.cr.nomReunion }}</strong>
              <span class="card-date">{{ r.cr.date | date: 'dd/MM/yyyy' }}</span>
            </div>
            <div class="card-body">
              <div class="card-row">
                <mat-icon>person</mat-icon>
                <span>{{ r.cr.redacteur }}</span>
              </div>
              @if (r.cr.lieu) {
                <div class="card-row">
                  <mat-icon>place</mat-icon>
                  <span>{{ r.cr.lieu }}</span>
                </div>
              }
              @if (r.projet) {
                <div class="card-row">
                  <mat-icon>folder</mat-icon>
                  <span class="projet-link">{{ r.projet.nom }}</span>
                </div>
              } @else {
                <div class="card-row">
                  <mat-icon>groups</mat-icon>
                  <span class="muted">Réunion générale</span>
                </div>
              }
              <p class="card-preview">{{ stripHtml(r.cr.contenu) }}</p>
            </div>
            @if (isAdmin()) {
              <div class="card-actions" (click)="$event.stopPropagation()">
                <a mat-icon-button [routerLink]="['/comptes-rendus', r.cr.id, 'edit']">
                  <mat-icon>edit</mat-icon>
                </a>
                <button mat-icon-button color="warn" (click)="confirmDelete(r.cr)">
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
            }
          </mat-card>
        } @empty {
          <mat-card class="empty-card">Aucun compte rendu trouvé.</mat-card>
        }
      </div>
    } @else {
      <!-- Vue tableau desktop -->
      <div class="table-container">
        <table
          mat-table
          matSort
          [matSortActive]="sortState().active"
          [matSortDirection]="sortState().direction"
          (matSortChange)="onSortChange($event)"
          [dataSource]="sortedAndFilteredRows()"
          class="mat-elevation-z2"
        >
          <ng-container matColumnDef="id">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>ID</th>
            <td mat-cell *matCellDef="let r">{{ r.cr.id }}</td>
          </ng-container>
          <ng-container matColumnDef="date">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Date</th>
            <td mat-cell *matCellDef="let r">{{ r.cr.date | date: 'dd/MM/yyyy' }}</td>
          </ng-container>
          <ng-container matColumnDef="reunion">
            <th mat-header-cell *matHeaderCellDef mat-sort-header="nomReunion">Réunion</th>
            <td mat-cell *matCellDef="let r">
              <a [routerLink]="['/comptes-rendus', r.cr.id]" class="link">{{ r.cr.nomReunion }}</a>
            </td>
          </ng-container>
          <ng-container matColumnDef="projet">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Projet</th>
            <td mat-cell *matCellDef="let r">
              @if (r.projet) {
                <a [routerLink]="['/projets', r.projet.id]" class="link">{{ r.projet.nom }}</a>
              } @else {
                <span class="muted">Réunion générale</span>
              }
            </td>
          </ng-container>
          <ng-container matColumnDef="redacteur">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Rédacteur</th>
            <td mat-cell *matCellDef="let r">{{ r.cr.redacteur }}</td>
          </ng-container>
          <ng-container matColumnDef="lieu">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Lieu</th>
            <td mat-cell *matCellDef="let r">{{ r.cr.lieu || '—' }}</td>
          </ng-container>
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef class="actions-col">Actions</th>
            <td mat-cell *matCellDef="let r" class="actions-col">
              <a mat-icon-button [routerLink]="['/comptes-rendus', r.cr.id]" matTooltip="Voir">
                <mat-icon>visibility</mat-icon>
              </a>
              @if (isAdmin()) {
                <a mat-icon-button [routerLink]="['/comptes-rendus', r.cr.id, 'edit']" matTooltip="Modifier">
                  <mat-icon>edit</mat-icon>
                </a>
                <button mat-icon-button color="warn" (click)="confirmDelete(r.cr)" matTooltip="Supprimer">
                  <mat-icon>delete</mat-icon>
                </button>
              }
            </td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
          <tr class="mat-row" *matNoDataRow>
            <td class="mat-cell no-data" [attr.colspan]="displayedColumns.length">
              Aucun compte rendu trouvé.
            </td>
          </tr>
        </table>
      </div>
    }

    @if (!loading()) {
      <div class="summary">
        {{ sortedAndFilteredRows().length }} compte(s) rendu(s) — {{ visibleComptesRendus().length }} au total
      </div>
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
      .search-field { flex: 1; min-width: 240px; }
      .loading { display: flex; justify-content: center; padding: 4rem; }
      .table-container { overflow: auto; background: white; border-radius: 4px; }
      table { width: 100%; }
      .link { color: #3f51b5; text-decoration: none; font-weight: 500; }
      .link:hover { text-decoration: underline; }
      .actions-col { width: 140px; text-align: right; }
      .no-data { text-align: center; padding: 2rem; color: #888; }
      .summary { margin-top: 0.75rem; color: #666; font-size: 0.9rem; }
      .muted { color: #888; font-style: italic; }
      .projet-link { color: #3f51b5; }

      .mobile-sort { margin-bottom: 1rem; }
      .sort-field { width: 100%; max-width: 320px; }
      .cards-grid { display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1rem; }
      .cr-card { padding: 1rem; cursor: pointer; }
      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 0.5rem;
        margin-bottom: 0.75rem;
      }
      .card-header strong { font-size: 1rem; }
      .card-date { color: #888; font-size: 0.85rem; }
      .card-body { display: flex; flex-direction: column; gap: 0.4rem; }
      .card-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.875rem;
        color: #555;
      }
      .card-row mat-icon { font-size: 1rem; width: 1rem; height: 1rem; color: #888; }
      .card-preview {
        color: #666;
        font-size: 0.85rem;
        margin: 0.5rem 0 0;
        line-height: 1.4;
      }
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
export class ComptesRendusListComponent implements OnInit {
  private readonly facade = inject(ComptesRendusFacade);
  private readonly projetsFacade = inject(ProjetsFacade);
  private readonly currentUser = inject(CurrentUserService);
  private readonly notif = inject(NotificationService);
  private readonly dialog = inject(MatDialog);
  readonly responsive = inject(ResponsiveService);

  readonly comptesRendus = signal<CompteRendu[]>([]);
  readonly projets = signal<Projet[]>([]);
  readonly allProjets = signal<Projet[]>([]);
  readonly archivedProjetIds = signal<Set<string>>(new Set());
  readonly loading = signal(true);
  searchTerm = '';
  filterProjet = '';

  readonly sortState = signal<{ active: SortColumn; direction: 'asc' | 'desc' | '' }>({
    active: 'date',
    direction: 'desc',
  });
  mobileSortBy = 'date-desc';

  readonly isAdmin = this.currentUser.isAdmin;
  readonly displayedColumns = ['id', 'date', 'reunion', 'projet', 'redacteur', 'lieu', 'actions'];

  readonly visibleComptesRendus = computed(() =>
    this.comptesRendus().filter((cr) => {
      if (!cr.projetId) return true;
      return !this.archivedProjetIds().has(cr.projetId);
    }),
  );

  readonly sortedAndFilteredRows = computed<CompteRenduRow[]>(() => {
    const projetById = new Map(this.allProjets().map((p) => [p.id, p]));
    let rows: CompteRenduRow[] = this.visibleComptesRendus().map((cr) => ({
      cr,
      projet: cr.projetId ? projetById.get(cr.projetId) ?? null : null,
    }));

    const term = this.searchTerm.toLowerCase().trim();
    if (term) {
      rows = rows.filter(
        (r) =>
          r.cr.id.toLowerCase().includes(term) ||
          r.cr.nomReunion.toLowerCase().includes(term) ||
          r.cr.redacteur.toLowerCase().includes(term) ||
          (r.cr.lieu ?? '').toLowerCase().includes(term) ||
          r.cr.contenu.replace(/<[^>]*>/g, ' ').toLowerCase().includes(term) ||
          (r.projet?.nom ?? '').toLowerCase().includes(term),
      );
    }

    if (this.filterProjet === 'NONE') {
      rows = rows.filter((r) => !r.cr.projetId);
    } else if (this.filterProjet) {
      rows = rows.filter((r) => r.cr.projetId === this.filterProjet);
    }

    const { active, direction } = this.sortState();
    if (!direction) return rows;

    return rows.sort((a, b) => {
      const va = this.fieldValue(a, active);
      const vb = this.fieldValue(b, active);
      const cmp = va.localeCompare(vb, 'fr', { numeric: true, sensitivity: 'base' });
      return direction === 'asc' ? cmp : -cmp;
    });
  });

  private fieldValue(r: CompteRenduRow, col: SortColumn): string {
    switch (col) {
      case 'id': return r.cr.id;
      case 'date': return r.cr.date;
      case 'nomReunion': return r.cr.nomReunion;
      case 'redacteur': return r.cr.redacteur;
      case 'lieu': return r.cr.lieu ?? '';
      case 'projet': return r.projet?.nom ?? '';
    }
  }

  async ngOnInit(): Promise<void> {
    await this.reload();
  }

  async reload(): Promise<void> {
    this.loading.set(true);
    try {
      const [crs, projetsActifs, projetsAll] = await Promise.all([
        this.facade.findAll(),
        this.projetsFacade.findAll(false),
        this.projetsFacade.findAll(true),
      ]);
      this.comptesRendus.set(crs);
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

  onSortChange(sort: Sort): void {
    this.sortState.set({
      active: (sort.active as SortColumn) ?? 'date',
      direction: sort.direction as 'asc' | 'desc' | '',
    });
  }

  onMobileSortChange(): void {
    const [field, dir] = this.mobileSortBy.split('-') as [SortColumn, 'asc' | 'desc'];
    this.sortState.set({ active: field, direction: dir });
  }

  stripHtml(html: string): string {
    const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    return text.length > 120 ? text.slice(0, 120) + '...' : text;
  }

  confirmDelete(cr: CompteRendu): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmer la suppression',
        message: `Supprimer le compte rendu "${cr.nomReunion}" ?`,
        confirmLabel: 'Supprimer',
        color: 'warn',
      },
    });
    ref.afterClosed().subscribe(async (ok) => {
      if (!ok) return;
      try {
        await this.facade.delete(cr.id);
        this.notif.success('Compte rendu supprimé');
        await this.reload();
      } catch (e: unknown) {
        this.notif.error(e instanceof Error ? e.message : 'Erreur');
      }
    });
  }
}