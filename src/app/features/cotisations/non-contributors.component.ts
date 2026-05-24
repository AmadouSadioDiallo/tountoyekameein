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

@Component({
  selector: 'app-non-contributors',
  standalone: true,
  imports: [
    RouterLink,
    FormsModule,
    MatCardModule,
    MatTableModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <h1>Personnes n'ayant pas cotisé</h1>

    @if (loading()) {
      <div class="loading">
        <mat-progress-spinner mode="indeterminate" diameter="50" />
      </div>
    } @else {
      <mat-card class="summary-card">
        <div class="metric">
          <mat-icon style="color:#ff9800">warning</mat-icon>
          <div>
            <div class="metric-value">{{ persons().length }}</div>
            <div class="metric-label">Personne(s) sans cotisation</div>
          </div>
        </div>
      </mat-card>

      <mat-form-field appearance="outline" class="search">
        <mat-label>Rechercher</mat-label>
        <mat-icon matPrefix>search</mat-icon>
        <input matInput [(ngModel)]="searchTerm" placeholder="Nom, prénom, email..." />
      </mat-form-field>

      <table mat-table [dataSource]="filteredPersons()" class="mat-elevation-z2">
        <ng-container matColumnDef="id">
          <th mat-header-cell *matHeaderCellDef>ID</th>
          <td mat-cell *matCellDef="let p">{{ p.id }}</td>
        </ng-container>
        <ng-container matColumnDef="nom">
          <th mat-header-cell *matHeaderCellDef>Nom complet</th>
          <td mat-cell *matCellDef="let p">
            {{ p.civilite }} {{ p.nom }} {{ p.prenom }}
          </td>
        </ng-container>
        <ng-container matColumnDef="email">
          <th mat-header-cell *matHeaderCellDef>Email</th>
          <td mat-cell *matCellDef="let p">{{ p.email }}</td>
        </ng-container>
        <ng-container matColumnDef="telephone">
          <th mat-header-cell *matHeaderCellDef>Téléphone</th>
          <td mat-cell *matCellDef="let p">{{ p.telephone || '—' }}</td>
        </ng-container>
        <ng-container matColumnDef="statut">
          <th mat-header-cell *matHeaderCellDef>Statut</th>
          <td mat-cell *matCellDef="let p">{{ p.statut }}</td>
        </ng-container>
        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef></th>
          <td mat-cell *matCellDef="let p">
            <a mat-icon-button [routerLink]="['/persons', p.id]">
              <mat-icon>visibility</mat-icon>
            </a>
          </td>
        </ng-container>
        <tr mat-header-row *matHeaderRowDef="columns"></tr>
        <tr mat-row *matRowDef="let row; columns: columns"></tr>
        <tr class="mat-row" *matNoDataRow>
          <td class="mat-cell no-data" [attr.colspan]="columns.length">
            Toutes les personnes ont cotisé
          </td>
        </tr>
      </table>
    }
  `,
  styles: [
    `
      h1 { margin-bottom: 1.5rem; }
      .loading { display: flex; justify-content: center; padding: 4rem; }
      .summary-card { padding: 1.5rem; margin-bottom: 1.5rem; }
      .metric { display: flex; align-items: center; gap: 1rem; }
      .metric mat-icon { font-size: 2.5rem; width: 2.5rem; height: 2.5rem; }
      .metric-value { font-size: 1.75rem; font-weight: 600; }
      .metric-label { color: #666; font-size: 0.9rem; }
      .search { width: 100%; max-width: 400px; margin-bottom: 1rem; }
      table { width: 100%; background: white; }
      .no-data { text-align: center; padding: 2rem; color: #888; }
    `,
  ],
})
export class NonContributorsComponent implements OnInit {
  private readonly personsFacade = inject(PersonsFacade);
  private readonly cotisationsFacade = inject(CotisationsFacade);
  private readonly notif = inject(NotificationService);

  readonly loading = signal(true);
  readonly persons = signal<Person[]>([]);
  readonly columns = ['id', 'nom', 'email', 'telephone', 'statut', 'actions'];
  searchTerm = '';

  readonly filteredPersons = computed(() => {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) return this.persons();
    return this.persons().filter(
      (p) =>
        p.nom.toLowerCase().includes(term) ||
        p.prenom.toLowerCase().includes(term) ||
        p.email.toLowerCase().includes(term) ||
        p.id.toLowerCase().includes(term),
    );
  });

  async ngOnInit(): Promise<void> {
    try {
      const [allPersons, totals] = await Promise.all([
        this.personsFacade.findAll(),
        this.cotisationsFacade.getTotalsByPerson(),
      ]);
      this.persons.set(allPersons.filter((p) => (totals.get(p.id) ?? 0) === 0));
    } catch (e: unknown) {
      this.notif.error(e instanceof Error ? e.message : 'Erreur');
    } finally {
      this.loading.set(false);
    }
  }
}
