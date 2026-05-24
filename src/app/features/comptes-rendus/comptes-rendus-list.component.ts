import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CompteRendu } from '../../core/models';
import { ComptesRendusFacade } from '../../core/services/comptes-rendus.facade';
import { CurrentUserService } from '../../core/services/current-user.service';
import { NotificationService } from '../../core/services/notification.service';
import { ResponsiveService } from '../../core/services/responsive.service';
import { ConfirmDialogComponent } from '../shared/confirm-dialog.component';

type SortColumn = 'id' | 'date' | 'nomReunion' | 'redacteur' | 'lieu';

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
        <input matInput [(ngModel)]="searchTerm" placeholder="Nom de réunion, rédacteur, contenu..." />
      </mat-form-field>
    </div>

    @if (loading()) {
      <div class="loading">
        <mat-progress-spinner mode="indeterminate" diameter="50" />
      </div>
    } @else if (responsive.isMobile()) {
      <!-- Vue cartes mobile (avec tri rapide) -->
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
        @for (cr of sortedAndFilteredRows(); track cr.id) {
          <mat-card class="cr-card" [routerLink]="['/comptes-rendus', cr.id]">
            <div class="card-header">
              <strong>{{ cr.nomReunion }}</strong>
              <span class="card-date">{{ cr.date | date: 'dd/MM/yyyy' }}</span>
            </div>
            <div class="card-body">
              <div class="card-row">
                <mat-icon>person</mat-icon>
                <span>{{ cr.redacteur }}</span>
              </div>
              @if (cr.lieu) {
                <div class="card-row">
                  <mat-icon>place</mat-icon>
                  <span>{{ cr.lieu }}</span>
                </div>
              }
              <p class="card-preview">{{ cr.contenu | slice: 0:120 }}{{ cr.contenu.length > 120 ? '...' : '' }}</p>
            </div>
            @if (isAdmin()) {
              <div class="card-actions" (click)="$event.stopPropagation()">
                <a mat-icon-button [routerLink]="['/comptes-rendus', cr.id, 'edit']">
                  <mat-icon>edit</mat-icon>
                </a>
                <button mat-icon-button color="warn" (click)="confirmDelete(cr)">
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
      <!-- Vue tableau desktop avec MatSort -->
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
            <td mat-cell *matCellDef="let cr">{{ cr.id }}</td>
          </ng-container>
          <ng-container matColumnDef="date">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Date</th>
            <td mat-cell *matCellDef="let cr">{{ cr.date | date: 'dd/MM/yyyy' }}</td>
          </ng-container>
          <ng-container matColumnDef="reunion">
            <th mat-header-cell *matHeaderCellDef mat-sort-header="nomReunion">Réunion</th>
            <td mat-cell *matCellDef="let cr">
              <a [routerLink]="['/comptes-rendus', cr.id]" class="link">{{ cr.nomReunion }}</a>
            </td>
          </ng-container>
          <ng-container matColumnDef="redacteur">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Rédacteur</th>
            <td mat-cell *matCellDef="let cr">{{ cr.redacteur }}</td>
          </ng-container>
          <ng-container matColumnDef="lieu">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Lieu</th>
            <td mat-cell *matCellDef="let cr">{{ cr.lieu || '—' }}</td>
          </ng-container>
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef class="actions-col">Actions</th>
            <td mat-cell *matCellDef="let cr" class="actions-col">
              <a mat-icon-button [routerLink]="['/comptes-rendus', cr.id]" matTooltip="Voir">
                <mat-icon>visibility</mat-icon>
              </a>
              @if (isAdmin()) {
                <a mat-icon-button [routerLink]="['/comptes-rendus', cr.id, 'edit']" matTooltip="Modifier">
                  <mat-icon>edit</mat-icon>
                </a>
                <button mat-icon-button color="warn" (click)="confirmDelete(cr)" matTooltip="Supprimer">
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
        {{ sortedAndFilteredRows().length }} compte(s) rendu(s) — {{ comptesRendus().length }} au total
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
      .search-field { flex: 1; min-width: 280px; }
      .loading { display: flex; justify-content: center; padding: 4rem; }
      .table-container { overflow: auto; background: white; border-radius: 4px; }
      table { width: 100%; }
      .link { color: #3f51b5; text-decoration: none; font-weight: 500; }
      .link:hover { text-decoration: underline; }
      .actions-col { width: 140px; text-align: right; }
      .no-data { text-align: center; padding: 2rem; color: #888; }
      .summary { margin-top: 0.75rem; color: #666; font-size: 0.9rem; }

      /* Mobile sort */
      .mobile-sort { margin-bottom: 1rem; }
      .sort-field { width: 100%; max-width: 320px; }

      /* Mobile cards */
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
  private readonly currentUser = inject(CurrentUserService);
  private readonly notif = inject(NotificationService);
  private readonly dialog = inject(MatDialog);
  readonly responsive = inject(ResponsiveService);

  readonly comptesRendus = signal<CompteRendu[]>([]);
  readonly loading = signal(true);
  searchTerm = '';

  /** État du tri (desktop : table MatSort). */
  readonly sortState = signal<{ active: SortColumn; direction: 'asc' | 'desc' | '' }>({
    active: 'date',
    direction: 'desc',
  });

  /** Tri mobile via select. */
  mobileSortBy = 'date-desc';

  readonly isAdmin = this.currentUser.isAdmin;
  readonly displayedColumns = ['id', 'date', 'reunion', 'redacteur', 'lieu', 'actions'];

  readonly sortedAndFilteredRows = computed(() => {
    let rows = [...this.comptesRendus()];

    // Filtre recherche
    const term = this.searchTerm.toLowerCase().trim();
    if (term) {
      rows = rows.filter(
        (cr) =>
          cr.id.toLowerCase().includes(term) ||
          cr.nomReunion.toLowerCase().includes(term) ||
          cr.redacteur.toLowerCase().includes(term) ||
          (cr.lieu ?? '').toLowerCase().includes(term) ||
          cr.contenu.toLowerCase().includes(term),
      );
    }

    // Tri
    const { active, direction } = this.sortState();
    if (!direction) return rows; // Pas de tri = ordre d'origine du Sheet

    return rows.sort((a, b) => {
      const va = this.fieldValue(a, active);
      const vb = this.fieldValue(b, active);
      const cmp = va.localeCompare(vb, 'fr', { numeric: true, sensitivity: 'base' });
      return direction === 'asc' ? cmp : -cmp;
    });
  });

  private fieldValue(cr: CompteRendu, col: SortColumn): string {
    switch (col) {
      case 'id': return cr.id;
      case 'date': return cr.date;
      case 'nomReunion': return cr.nomReunion;
      case 'redacteur': return cr.redacteur;
      case 'lieu': return cr.lieu ?? '';
    }
  }

  async ngOnInit(): Promise<void> {
    await this.reload();
  }

  async reload(): Promise<void> {
    this.loading.set(true);
    try {
      this.comptesRendus.set(await this.facade.findAll());
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
