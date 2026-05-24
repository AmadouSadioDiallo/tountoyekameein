import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Person, STATUTS, Statut } from '../../core/models';
import { PersonsFacade } from '../../core/services/persons.facade';
import { CurrentUserService } from '../../core/services/current-user.service';
import { NotificationService } from '../../core/services/notification.service';
import { ResponsiveService } from '../../core/services/responsive.service';
import { ConfirmDialogComponent } from '../shared/confirm-dialog.component';

@Component({
  selector: 'app-persons-list',
  standalone: true,
  imports: [
    RouterLink,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
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
      <h1>Personnes</h1>
      @if (isAdmin()) {
        <a mat-flat-button color="primary" routerLink="/persons/new">
          <mat-icon>person_add</mat-icon>
          @if (!responsive.isMobile()) { <span>Nouvelle personne</span> }
        </a>
      }
    </div>

    <div class="filters">
      <mat-form-field appearance="outline" class="search-field">
        <mat-label>Rechercher</mat-label>
        <mat-icon matPrefix>search</mat-icon>
        <input
          matInput
          [ngModel]="searchTerm()"
          (ngModelChange)="searchTerm.set($event); resetPage()"
          placeholder="Nom, prénom, email, ville..."
        />
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Statut</mat-label>
        <mat-select
          [ngModel]="filterStatut()"
          (ngModelChange)="filterStatut.set($event); resetPage()"
        >
          <mat-option [value]="''">Tous</mat-option>
          @for (s of statuts; track s) {
            <mat-option [value]="s">{{ s }}</mat-option>
          }
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Pays</mat-label>
        <mat-select
          [ngModel]="filterPays()"
          (ngModelChange)="filterPays.set($event); resetPage()"
        >
          <mat-option [value]="''">Tous</mat-option>
          @for (p of paysOptions(); track p) {
            <mat-option [value]="p">{{ p }}</mat-option>
          }
        </mat-select>
      </mat-form-field>
    </div>

    @if (loading()) {
      <div class="loading">
        <mat-progress-spinner mode="indeterminate" diameter="50" />
      </div>
    } @else if (responsive.isMobile()) {
      <div class="cards-grid">
        @for (p of paginatedPersons(); track p.id) {
          <mat-card class="person-card">
            <div class="card-header">
              <div class="card-title">
                <strong>{{ p.civilite }} {{ p.nom }} {{ p.prenom }}</strong>
                <span class="card-id">{{ p.id }}</span>
              </div>
              <span class="chip chip-{{ p.statut.toLowerCase().replace(' ', '-') }}">
                {{ p.statut }}
              </span>
            </div>
            <div class="card-body">
              @if (p.email) {
                <div class="card-row"><mat-icon>email</mat-icon> {{ p.email }}</div>
              }
              @if (p.telephone) {
                <div class="card-row"><mat-icon>phone</mat-icon> {{ p.telephone }}</div>
              }
              <div class="card-row"><mat-icon>location_on</mat-icon> {{ p.ville }}, {{ p.pays }}</div>
            </div>
            <div class="card-actions">
              <a mat-icon-button [routerLink]="['/persons', p.id]" aria-label="Voir">
                <mat-icon>visibility</mat-icon>
              </a>
              @if (isAdmin()) {
                <a mat-icon-button [routerLink]="['/persons', p.id, 'edit']" aria-label="Modifier">
                  <mat-icon>edit</mat-icon>
                </a>
                <button mat-icon-button color="warn" (click)="confirmDelete(p)" aria-label="Supprimer">
                  <mat-icon>delete</mat-icon>
                </button>
              }
            </div>
          </mat-card>
        } @empty {
          <mat-card class="empty-card">Aucune personne trouvée.</mat-card>
        }
      </div>
    } @else {
      <div class="table-container">
        <table mat-table [dataSource]="paginatedPersons()" class="mat-elevation-z2">
          <ng-container matColumnDef="id">
            <th mat-header-cell *matHeaderCellDef>ID</th>
            <td mat-cell *matCellDef="let p">{{ p.id }}</td>
          </ng-container>
          <ng-container matColumnDef="nom">
            <th mat-header-cell *matHeaderCellDef>Nom</th>
            <td mat-cell *matCellDef="let p">{{ p.civilite }} {{ p.nom }}</td>
          </ng-container>
          <ng-container matColumnDef="prenom">
            <th mat-header-cell *matHeaderCellDef>Prénom</th>
            <td mat-cell *matCellDef="let p">{{ p.prenom }}</td>
          </ng-container>
          <ng-container matColumnDef="email">
            <th mat-header-cell *matHeaderCellDef>Email</th>
            <td mat-cell *matCellDef="let p">{{ p.email }}</td>
          </ng-container>
          <ng-container matColumnDef="telephone">
            <th mat-header-cell *matHeaderCellDef>Téléphone</th>
            <td mat-cell *matCellDef="let p">{{ p.telephone || '—' }}</td>
          </ng-container>
          <ng-container matColumnDef="ville">
            <th mat-header-cell *matHeaderCellDef>Ville</th>
            <td mat-cell *matCellDef="let p">{{ p.ville }}</td>
          </ng-container>
          <ng-container matColumnDef="pays">
            <th mat-header-cell *matHeaderCellDef>Pays</th>
            <td mat-cell *matCellDef="let p">{{ p.pays }}</td>
          </ng-container>
          <ng-container matColumnDef="statut">
            <th mat-header-cell *matHeaderCellDef>Statut</th>
            <td mat-cell *matCellDef="let p">
              <span class="chip chip-{{ p.statut.toLowerCase().replace(' ', '-') }}">
                {{ p.statut }}
              </span>
            </td>
          </ng-container>
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef class="actions-col">Actions</th>
            <td mat-cell *matCellDef="let p" class="actions-col">
              <a mat-icon-button [routerLink]="['/persons', p.id]" matTooltip="Voir">
                <mat-icon>visibility</mat-icon>
              </a>
              @if (isAdmin()) {
                <a mat-icon-button [routerLink]="['/persons', p.id, 'edit']" matTooltip="Modifier">
                  <mat-icon>edit</mat-icon>
                </a>
                <button mat-icon-button color="warn" (click)="confirmDelete(p)" matTooltip="Supprimer">
                  <mat-icon>delete</mat-icon>
                </button>
              }
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
          <tr class="mat-row" *matNoDataRow>
            <td class="mat-cell no-data" [attr.colspan]="displayedColumns.length">
              Aucune personne trouvée.
            </td>
          </tr>
        </table>
      </div>
    }

    @if (!loading()) {
      <mat-paginator
        [length]="filteredPersons().length"
        [pageSize]="pageSize()"
        [pageSizeOptions]="responsive.isMobile() ? [10, 25] : [10, 25, 50, 100]"
        [pageIndex]="pageIndex()"
        (page)="onPageChange($event)"
        [showFirstLastButtons]="!responsive.isMobile()"
      />
      <div class="summary">
        {{ filteredPersons().length }} résultat(s) — Total {{ persons().length }}
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
        gap: 0.5rem;
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
      .actions-col { width: 140px; text-align: right; }
      .no-data { text-align: center; padding: 2rem; color: #888; }
      .summary { margin-top: 0.75rem; color: #666; font-size: 0.9rem; }
      .chip {
        padding: 4px 10px;
        border-radius: 12px;
        font-size: 0.8rem;
        font-weight: 500;
        white-space: nowrap;
      }
      .chip-actif { background: #c8e6c9; color: #1b5e20; }
      .chip-inactif { background: #eeeeee; color: #424242; }
      .chip-en-attente { background: #fff3e0; color: #e65100; }

      .cards-grid {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        margin-bottom: 1rem;
      }
      .person-card {
        padding: 1rem;
      }
      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 0.5rem;
        margin-bottom: 0.75rem;
      }
      .card-title { display: flex; flex-direction: column; gap: 0.25rem; }
      .card-title strong { font-size: 1rem; }
      .card-id { font-size: 0.75rem; color: #888; }
      .card-body {
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
        margin-bottom: 0.5rem;
      }
      .card-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.875rem;
        color: #555;
      }
      .card-row mat-icon {
        font-size: 1rem;
        width: 1rem;
        height: 1rem;
        color: #999;
      }
      .card-actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.25rem;
        border-top: 1px solid #f0f0f0;
        padding-top: 0.5rem;
      }
      .empty-card {
        padding: 2rem;
        text-align: center;
        color: #888;
        font-style: italic;
      }
    `,
  ],
})
export class PersonsListComponent implements OnInit {
  private readonly facade = inject(PersonsFacade);
  private readonly currentUser = inject(CurrentUserService);
  private readonly notif = inject(NotificationService);
  private readonly dialog = inject(MatDialog);
  readonly responsive = inject(ResponsiveService);

  readonly persons = signal<Person[]>([]);
  readonly loading = signal(true);
  readonly searchTerm = signal('');
  readonly filterStatut = signal<Statut | ''>('');
  readonly filterPays = signal('');
  readonly pageIndex = signal(0);
  readonly pageSize = signal(10);

  readonly statuts = STATUTS;
  readonly isAdmin = this.currentUser.isAdmin;
  readonly displayedColumns = [
    'id', 'nom', 'prenom', 'email', 'telephone', 'ville', 'pays', 'statut', 'actions',
  ];

  readonly paysOptions = computed(() =>
    [...new Set(this.persons().map((p) => p.pays).filter(Boolean))].sort(),
  );

  readonly filteredPersons = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const statut = this.filterStatut();
    const pays = this.filterPays();
    return this.persons().filter((p) => {
      if (statut && p.statut !== statut) return false;
      if (pays && p.pays !== pays) return false;
      if (!term) return true;
      return (
        p.id.toLowerCase().includes(term) ||
        p.nom.toLowerCase().includes(term) ||
        p.prenom.toLowerCase().includes(term) ||
        p.email.toLowerCase().includes(term) ||
        (p.telephone ?? '').toLowerCase().includes(term) ||
        p.ville.toLowerCase().includes(term) ||
        p.pays.toLowerCase().includes(term)
      );
    });
  });

  readonly paginatedPersons = computed(() => {
    const start = this.pageIndex() * this.pageSize();
    return this.filteredPersons().slice(start, start + this.pageSize());
  });

  async ngOnInit(): Promise<void> {
    await this.reload();
  }

  async reload(): Promise<void> {
    this.loading.set(true);
    try {
      this.persons.set(await this.facade.findAll());
    } catch (e: unknown) {
      this.notif.error(e instanceof Error ? e.message : 'Erreur de chargement');
    } finally {
      this.loading.set(false);
    }
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  resetPage(): void {
    this.pageIndex.set(0);
  }

  confirmDelete(p: Person): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmer la suppression',
        message: `Supprimer ${p.civilite} ${p.nom} ${p.prenom} ?`,
        confirmLabel: 'Supprimer',
        color: 'warn',
      },
    });
    ref.afterClosed().subscribe(async (ok) => {
      if (!ok) return;
      try {
        await this.facade.delete(p.id);
        this.notif.success('Personne supprimée');
        await this.reload();
      } catch (e: unknown) {
        this.notif.error(e instanceof Error ? e.message : 'Erreur');
      }
    });
  }
}
