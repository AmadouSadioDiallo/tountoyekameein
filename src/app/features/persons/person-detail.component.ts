import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { DatePipe } from '@angular/common';
import { Cotisation, Person } from '../../core/models';
import { PersonsFacade } from '../../core/services/persons.facade';
import { CotisationsFacade } from '../../core/services/cotisations.facade';
import { CurrentUserService } from '../../core/services/current-user.service';
import { NotificationService } from '../../core/services/notification.service';
import { GnfPipe } from '../../core/pipes/gnf.pipe';

@Component({
  selector: 'app-person-detail',
  standalone: true,
  imports: [
    RouterLink,
    DatePipe,
    GnfPipe,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatTableModule,
  ],
  template: `
    <div class="header">
      <a mat-icon-button routerLink="/persons">
        <mat-icon>arrow_back</mat-icon>
      </a>
      <h1>Détail de la personne</h1>
      @if (isAdmin() && person()) {
        <a mat-flat-button color="primary" [routerLink]="['/persons', person()!.id, 'edit']">
          <mat-icon>edit</mat-icon>
          Modifier
        </a>
      }
    </div>

    @if (loading()) {
      <div class="loading">
        <mat-progress-spinner mode="indeterminate" diameter="50" />
      </div>
    } @else if (person(); as p) {
      <mat-card class="detail-card">
        <h3 class="section-title">État civil</h3>
        <div class="detail-grid">
          <div class="field"><label>ID</label><span>{{ p.id }}</span></div>
          <div class="field"><label>Civilité</label><span>{{ p.civilite }}</span></div>
          <div class="field"><label>Nom</label><span>{{ p.nom }}</span></div>
          <div class="field"><label>Prénom</label><span>{{ p.prenom }}</span></div>
          <div class="field"><label>Statut</label><span>{{ p.statut }}</span></div>
        </div>

        <h3 class="section-title">Naissance</h3>
        <div class="detail-grid">
          <div class="field">
            <label>Date de naissance</label>
            <span>{{ p.dateNaissance ? (p.dateNaissance | date: 'dd/MM/yyyy') : '—' }}</span>
          </div>
          <div class="field"><label>Ville de naissance</label><span>{{ p.villeNaissance }}</span></div>
          <div class="field"><label>Pays de naissance</label><span>{{ p.paysNaissance }}</span></div>
        </div>

        <h3 class="section-title">Filiation</h3>
        <div class="detail-grid">
          <div class="field"><label>Nom du père</label><span>{{ p.nomPere || '—' }}</span></div>
          <div class="field"><label>Nom de la mère</label><span>{{ p.nomMere || '—' }}</span></div>
        </div>

        <h3 class="section-title">Contact</h3>
        <div class="detail-grid">
          <div class="field"><label>Email</label><span>{{ p.email || '—' }}</span></div>
          <div class="field"><label>Téléphone</label><span>{{ p.telephone || '—' }}</span></div>
        </div>

        <h3 class="section-title">Adresse</h3>
        <div class="detail-grid">
          <div class="field full"><label>Adresse</label><span>{{ p.adresse }}</span></div>
          <div class="field"><label>Ville</label><span>{{ p.ville }}</span></div>
          <div class="field"><label>Pays</label><span>{{ p.pays }}</span></div>
        </div>

        @if (p.notes) {
          <h3 class="section-title">Notes</h3>
          <div class="detail-grid">
            <div class="field full"><span class="notes-content">{{ p.notes }}</span></div>
          </div>
        }

        <h3 class="section-title">Métadonnées</h3>
        <div class="detail-grid">
          <div class="field"><label>Créé le</label><span>{{ p.dateCreation | date: 'dd/MM/yyyy HH:mm' }}</span></div>
          <div class="field"><label>Modifié le</label><span>{{ p.dateModif | date: 'dd/MM/yyyy HH:mm' }}</span></div>
        </div>
      </mat-card>

      <mat-card class="cotisations-card">
        <div class="cot-header">
          <h2>Cotisations</h2>
          <div class="total">
            Total : <strong>{{ totalCotisations() | gnf }}</strong>
          </div>
        </div>

        @if (cotisations().length === 0) {
          <p class="empty">Aucune cotisation enregistrée.</p>
        } @else {
          <div class="table-wrap">
            <table mat-table [dataSource]="cotisations()" class="mat-elevation-z1">
              <ng-container matColumnDef="date">
                <th mat-header-cell *matHeaderCellDef>Date</th>
                <td mat-cell *matCellDef="let c">{{ c.date | date: 'dd/MM/yyyy' }}</td>
              </ng-container>
              <ng-container matColumnDef="montant">
                <th mat-header-cell *matHeaderCellDef>Montant</th>
                <td mat-cell *matCellDef="let c">{{ c.montant | gnf }}</td>
              </ng-container>
              <ng-container matColumnDef="mode">
                <th mat-header-cell *matHeaderCellDef>Mode</th>
                <td mat-cell *matCellDef="let c">{{ c.modePaiement }}</td>
              </ng-container>
              <ng-container matColumnDef="periode">
                <th mat-header-cell *matHeaderCellDef>Période</th>
                <td mat-cell *matCellDef="let c">{{ c.periode }}</td>
              </ng-container>
              <ng-container matColumnDef="notes">
                <th mat-header-cell *matHeaderCellDef>Notes</th>
                <td mat-cell *matCellDef="let c">{{ c.notes || '—' }}</td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="cotColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: cotColumns"></tr>
            </table>
          </div>
        }
      </mat-card>
    }
  `,
  styleUrl: './person-detail.component.scss',
})
export class PersonDetailComponent implements OnInit {
  private readonly personsFacade = inject(PersonsFacade);
  private readonly cotisationsFacade = inject(CotisationsFacade);
  private readonly currentUser = inject(CurrentUserService);
  private readonly route = inject(ActivatedRoute);
  private readonly notif = inject(NotificationService);

  readonly person = signal<Person | null>(null);
  readonly cotisations = signal<Cotisation[]>([]);
  readonly loading = signal(true);
  readonly isAdmin = this.currentUser.isAdmin;
  readonly cotColumns = ['date', 'montant', 'mode', 'periode', 'notes'];

  readonly totalCotisations = () =>
    this.cotisations().reduce((s, c) => s + c.montant, 0);

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    try {
      const [p, cots] = await Promise.all([
        this.personsFacade.findById(id),
        this.cotisationsFacade.findByPersonId(id),
      ]);
      this.person.set(p);
      this.cotisations.set(cots.sort((a, b) => b.date.localeCompare(a.date)));
    } catch (e: unknown) {
      this.notif.error(e instanceof Error ? e.message : 'Erreur');
    } finally {
      this.loading.set(false);
    }
  }
}
