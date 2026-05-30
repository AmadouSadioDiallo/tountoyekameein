import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Projet, STATUTS_PROJET, StatutProjet } from '../../core/models';
import { ProjetsFacade } from '../../core/services/projets.facade';
import { CotisationsFacade } from '../../core/services/cotisations.facade';
import { CurrentUserService } from '../../core/services/current-user.service';
import { NotificationService } from '../../core/services/notification.service';
import { ResponsiveService } from '../../core/services/responsive.service';
import { GnfPipe } from '../../core/pipes/gnf.pipe';
import { ConfirmDialogComponent } from '../shared/confirm-dialog.component';

interface ProjetRow {
  projet: Projet;
  montantObtenu: number;
  progression: number;
}

@Component({
  selector: 'app-projets-list',
  standalone: true,
  imports: [
    RouterLink,
    DecimalPipe,
    FormsModule,
    GnfPipe,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatDialogModule,
    MatTooltipModule,
  ],
  template: `
    <div class="header">
      <h1>Projets</h1>
      @if (isAdmin()) {
        <a mat-flat-button color="primary" routerLink="/projets/new">
          <mat-icon>add</mat-icon>
          @if (!responsive.isMobile()) { <span>Nouveau projet</span> }
        </a>
      }
    </div>

    <div class="filters">
      <mat-form-field appearance="outline" class="search-field">
        <mat-label>Rechercher</mat-label>
        <mat-icon matPrefix>search</mat-icon>
        <input matInput [(ngModel)]="searchTerm" placeholder="Nom, description..." />
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Statut</mat-label>
        <mat-select [(ngModel)]="filterStatut">
          <mat-option [value]="''">Tous</mat-option>
          @for (s of statuts; track s) {
            <mat-option [value]="s">{{ s }}</mat-option>
          }
        </mat-select>
      </mat-form-field>

      <mat-checkbox
        [(ngModel)]="showArchived"
        (ngModelChange)="reload()"
        class="archive-toggle"
      >
        Afficher les archivés
      </mat-checkbox>
    </div>

    @if (loading()) {
      <div class="loading">
        <mat-progress-spinner mode="indeterminate" diameter="50" />
      </div>
    } @else if (responsive.isMobile()) {
      <div class="cards-grid">
        @for (r of filteredRows(); track r.projet.id) {
          <mat-card class="projet-card" [class.archived]="r.projet.archive" [routerLink]="['/projets', r.projet.id]">
            <div class="card-header">
              <div class="card-title">
                <strong>{{ r.projet.nom }}</strong>
                <span class="card-id">{{ r.projet.id }}</span>
              </div>
              <div class="badges">
                @if (r.projet.archive) {
                  <span class="chip chip-archive">📦 Archivé</span>
                }
                <span class="chip chip-{{ r.projet.statut.toLowerCase() }}">{{ r.projet.statut }}</span>
              </div>
            </div>
            <div class="card-amounts">
              <div>
                <span class="label">Obtenu</span>
                <strong>{{ r.montantObtenu | gnf }}</strong>
              </div>
              <div>
                <span class="label">Coût estimé</span>
                <span>{{ r.projet.coutEstime | gnf }}</span>
              </div>
              <div>
                <span class="label">Progression</span>
                <strong>{{ r.progression | number: '1.0-1' }}%</strong>
              </div>
            </div>
            <mat-progress-bar
              mode="determinate"
              [value]="r.progression"
              [color]="r.progression >= 100 ? 'accent' : 'primary'"
            />
            @if (isAdmin()) {
              <div class="card-actions" (click)="$event.stopPropagation()">
                <a mat-icon-button [routerLink]="['/projets', r.projet.id, 'edit']" matTooltip="Modifier">
                  <mat-icon>edit</mat-icon>
                </a>
                @if (r.projet.archive) {
                  <button mat-icon-button color="primary" (click)="unarchive(r.projet)" matTooltip="Désarchiver">
                    <mat-icon>unarchive</mat-icon>
                  </button>
                } @else {
                  <button mat-icon-button (click)="archive(r.projet)" matTooltip="Archiver">
                    <mat-icon>archive</mat-icon>
                  </button>
                }
                <button mat-icon-button color="warn" (click)="confirmDelete(r.projet)" matTooltip="Supprimer">
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
            }
          </mat-card>
        } @empty {
          <mat-card class="empty-card">Aucun projet trouvé.</mat-card>
        }
      </div>
    } @else {
      <div class="table-container">
        <table mat-table [dataSource]="filteredRows()" class="mat-elevation-z2">
          <ng-container matColumnDef="id">
            <th mat-header-cell *matHeaderCellDef>ID</th>
            <td mat-cell *matCellDef="let r">{{ r.projet.id }}</td>
          </ng-container>
          <ng-container matColumnDef="nom">
            <th mat-header-cell *matHeaderCellDef>Nom</th>
            <td mat-cell *matCellDef="let r">
              <a [routerLink]="['/projets', r.projet.id]" class="link">{{ r.projet.nom }}</a>
              @if (r.projet.archive) {
                <span class="chip-archive-inline">Archivé</span>
              }
            </td>
          </ng-container>
          <ng-container matColumnDef="statut">
            <th mat-header-cell *matHeaderCellDef>Statut</th>
            <td mat-cell *matCellDef="let r">
              <span class="chip chip-{{ r.projet.statut.toLowerCase() }}">{{ r.projet.statut }}</span>
            </td>
          </ng-container>
          <ng-container matColumnDef="estime">
            <th mat-header-cell *matHeaderCellDef>Coût estimé</th>
            <td mat-cell *matCellDef="let r">{{ r.projet.coutEstime | gnf }}</td>
          </ng-container>
          <ng-container matColumnDef="obtenu">
            <th mat-header-cell *matHeaderCellDef>Obtenu</th>
            <td mat-cell *matCellDef="let r"><strong>{{ r.montantObtenu | gnf }}</strong></td>
          </ng-container>
          <ng-container matColumnDef="progression">
            <th mat-header-cell *matHeaderCellDef>Progression</th>
            <td mat-cell *matCellDef="let r">
              <div class="progress-wrap">
                <mat-progress-bar mode="determinate" [value]="r.progression"
                  [color]="r.progression >= 100 ? 'accent' : 'primary'" />
                <span class="pct">{{ r.progression | number: '1.0-1' }}%</span>
              </div>
            </td>
          </ng-container>
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef class="actions-col">Actions</th>
            <td mat-cell *matCellDef="let r" class="actions-col">
              <a mat-icon-button [routerLink]="['/projets', r.projet.id]" matTooltip="Voir">
                <mat-icon>visibility</mat-icon>
              </a>
              @if (isAdmin()) {
                <a mat-icon-button [routerLink]="['/projets', r.projet.id, 'edit']" matTooltip="Modifier">
                  <mat-icon>edit</mat-icon>
                </a>
                @if (r.projet.archive) {
                  <button mat-icon-button color="primary" (click)="unarchive(r.projet)" matTooltip="Désarchiver">
                    <mat-icon>unarchive</mat-icon>
                  </button>
                } @else {
                  <button mat-icon-button (click)="archive(r.projet)" matTooltip="Archiver">
                    <mat-icon>archive</mat-icon>
                  </button>
                }
                <button mat-icon-button color="warn" (click)="confirmDelete(r.projet)" matTooltip="Supprimer">
                  <mat-icon>delete</mat-icon>
                </button>
              }
            </td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns" [class.row-archived]="row.projet.archive"></tr>
          <tr class="mat-row" *matNoDataRow>
            <td class="mat-cell no-data" [attr.colspan]="displayedColumns.length">
              Aucun projet trouvé.
            </td>
          </tr>
        </table>
      </div>
    }

    @if (!loading()) {
      <div class="summary">
        {{ filteredRows().length }} projet(s) affiché(s)
      </div>
    }
  `,
  styleUrl: './projets-list.component.scss',
})
export class ProjetsListComponent implements OnInit {
  private readonly projetsFacade = inject(ProjetsFacade);
  private readonly cotisationsFacade = inject(CotisationsFacade);
  private readonly currentUser = inject(CurrentUserService);
  private readonly notif = inject(NotificationService);
  private readonly dialog = inject(MatDialog);
  readonly responsive = inject(ResponsiveService);

  readonly projets = signal<Projet[]>([]);
  readonly totals = signal<Map<string, number>>(new Map());
  readonly loading = signal(true);
  searchTerm = '';
  filterStatut: StatutProjet | '' = '';
  showArchived = false;

  readonly statuts = STATUTS_PROJET;
  readonly isAdmin = this.currentUser.isAdmin;
  readonly displayedColumns = ['id', 'nom', 'statut', 'estime', 'obtenu', 'progression', 'actions'];

  readonly rows = computed<ProjetRow[]>(() =>
    this.projets().map((p) => {
      const obtenu = this.totals().get(p.id) ?? 0;
      const progression = p.coutEstime > 0 ? Math.min((obtenu / p.coutEstime) * 100, 100) : 0;
      return { projet: p, montantObtenu: obtenu, progression };
    }),
  );

  readonly filteredRows = computed(() => {
    const term = this.searchTerm.toLowerCase().trim();
    const statut = this.filterStatut;
    return this.rows().filter((r) => {
      if (statut && r.projet.statut !== statut) return false;
      if (!term) return true;
      return (
        r.projet.id.toLowerCase().includes(term) ||
        r.projet.nom.toLowerCase().includes(term) ||
        (r.projet.description ?? '').toLowerCase().includes(term)
      );
    });
  });

  async ngOnInit(): Promise<void> {
    await this.reload();
  }

  async reload(): Promise<void> {
    this.loading.set(true);
    try {
      const [projets, totals] = await Promise.all([
        this.projetsFacade.findAll(this.showArchived),
        this.cotisationsFacade.getTotalsByProjet(),
      ]);
      this.projets.set(projets);
      this.totals.set(totals);
    } catch (e: unknown) {
      this.notif.error(e instanceof Error ? e.message : 'Erreur de chargement');
    } finally {
      this.loading.set(false);
    }
  }

  async archive(p: Projet): Promise<void> {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Archiver le projet',
        message: `Archiver le projet "${p.nom}" ? Il sera masqué des listes.`,
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

  async unarchive(p: Projet): Promise<void> {
    try {
      await this.projetsFacade.unarchive(p.id);
      this.notif.success('Projet désarchivé');
      await this.reload();
    } catch (e: unknown) {
      this.notif.error(e instanceof Error ? e.message : 'Erreur');
    }
  }

  confirmDelete(p: Projet): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmer la suppression',
        message: `Supprimer définitivement le projet "${p.nom}" ?`,
        confirmLabel: 'Supprimer',
        color: 'warn',
      },
    });
    ref.afterClosed().subscribe(async (ok) => {
      if (!ok) return;
      try {
        await this.projetsFacade.delete(p.id);
        this.notif.success('Projet supprimé');
        await this.reload();
      } catch (e: unknown) {
        this.notif.error(e instanceof Error ? e.message : 'Erreur');
      }
    });
  }
}
