import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Person } from '../../core/models';
import { PersonsFacade } from '../../core/services/persons.facade';
import { CotisationsFacade } from '../../core/services/cotisations.facade';
import { NotificationService } from '../../core/services/notification.service';
import { GnfPipe } from '../../core/pipes/gnf.pipe';

interface ContributorRow {
  person: Person;
  total: number;
}

@Component({
  selector: 'app-contributors',
  standalone: true,
  imports: [
    RouterLink,
    FormsModule,
    GnfPipe,
    MatCardModule,
    MatTableModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <h1>Personnes ayant cotisé</h1>

    @if (loading()) {
      <div class="loading">
        <mat-progress-spinner mode="indeterminate" diameter="50" />
      </div>
    } @else {
      <mat-card class="summary-card">
        <div class="summary">
          <div class="metric">
            <mat-icon style="color:#009688">people</mat-icon>
            <div>
              <div class="metric-value">{{ rows().length }}</div>
              <div class="metric-label">Contributeurs</div>
            </div>
          </div>
          <div class="metric">
            <mat-icon style="color:#673ab7">payments</mat-icon>
            <div>
              <div class="metric-value">{{ totalGlobal() | gnf }}</div>
              <div class="metric-label">Total cotisé</div>
            </div>
          </div>
        </div>
      </mat-card>

      <mat-form-field appearance="outline" class="search">
        <mat-label>Rechercher</mat-label>
        <mat-icon matPrefix>search</mat-icon>
        <input matInput [(ngModel)]="searchTerm" placeholder="Nom, prénom, email..." />
      </mat-form-field>

      <div class="table-wrap">
        <table mat-table [dataSource]="filteredRows()" class="mat-elevation-z2">
          <ng-container matColumnDef="id">
            <th mat-header-cell *matHeaderCellDef>ID</th>
            <td mat-cell *matCellDef="let r">{{ r.person.id }}</td>
          </ng-container>
          <ng-container matColumnDef="nom">
            <th mat-header-cell *matHeaderCellDef>Nom complet</th>
            <td mat-cell *matCellDef="let r">
              {{ r.person.civilite }} {{ r.person.nom }} {{ r.person.prenom }}
            </td>
          </ng-container>
          <ng-container matColumnDef="email">
            <th mat-header-cell *matHeaderCellDef>Email</th>
            <td mat-cell *matCellDef="let r">{{ r.person.email }}</td>
          </ng-container>
          <ng-container matColumnDef="ville">
            <th mat-header-cell *matHeaderCellDef>Ville</th>
            <td mat-cell *matCellDef="let r">{{ r.person.ville }}</td>
          </ng-container>
          <ng-container matColumnDef="total">
            <th mat-header-cell *matHeaderCellDef>Total cotisé</th>
            <td mat-cell *matCellDef="let r"><strong>{{ r.total | gnf }}</strong></td>
          </ng-container>
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef></th>
            <td mat-cell *matCellDef="let r">
              <a mat-icon-button [routerLink]="['/persons', r.person.id]">
                <mat-icon>visibility</mat-icon>
              </a>
            </td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="columns"></tr>
          <tr mat-row *matRowDef="let row; columns: columns"></tr>
          <tr class="mat-row" *matNoDataRow>
            <td class="mat-cell no-data" [attr.colspan]="columns.length">
              Aucun contributeur.
            </td>
          </tr>
        </table>
      </div>
    }
  `,
  styles: [
    `
      h1 { margin-bottom: 1.5rem; }
      .loading { display: flex; justify-content: center; padding: 4rem; }
      .summary-card { padding: 1.5rem; margin-bottom: 1.5rem; }
      .summary { display: flex; gap: 3rem; flex-wrap: wrap; }
      .metric { display: flex; align-items: center; gap: 1rem; }
      .metric mat-icon { font-size: 2.5rem; width: 2.5rem; height: 2.5rem; }
      .metric-value { font-size: 1.75rem; font-weight: 600; }
      .metric-label { color: #666; font-size: 0.9rem; }
      .search { width: 100%; max-width: 400px; margin-bottom: 1rem; }
      .table-wrap { overflow: auto; }
      table { width: 100%; background: white; }
      .no-data { text-align: center; padding: 2rem; color: #888; }
    `,
  ],
})
export class ContributorsComponent implements OnInit {
  private readonly personsFacade = inject(PersonsFacade);
  private readonly cotisationsFacade = inject(CotisationsFacade);
  private readonly notif = inject(NotificationService);

  readonly loading = signal(true);
  readonly rows = signal<ContributorRow[]>([]);
  readonly columns = ['id', 'nom', 'email', 'ville', 'total', 'actions'];
  searchTerm = '';

  readonly filteredRows = computed(() => {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) return this.rows();
    return this.rows().filter(
      (r) =>
        r.person.nom.toLowerCase().includes(term) ||
        r.person.prenom.toLowerCase().includes(term) ||
        r.person.email.toLowerCase().includes(term) ||
        r.person.id.toLowerCase().includes(term),
    );
  });

  readonly totalGlobal = computed(() =>
    this.rows().reduce((s, r) => s + r.total, 0),
  );

  async ngOnInit(): Promise<void> {
    try {
      const [persons, totals] = await Promise.all([
        this.personsFacade.findAll(),
        this.cotisationsFacade.getTotalsByPerson(),
      ]);
      const rows: ContributorRow[] = persons
        .filter((p) => (totals.get(p.id) ?? 0) > 0)
        .map((p) => ({ person: p, total: totals.get(p.id) ?? 0 }))
        .sort((a, b) => b.total - a.total);
      this.rows.set(rows);
    } catch (e: unknown) {
      this.notif.error(e instanceof Error ? e.message : 'Erreur');
    } finally {
      this.loading.set(false);
    }
  }
}
