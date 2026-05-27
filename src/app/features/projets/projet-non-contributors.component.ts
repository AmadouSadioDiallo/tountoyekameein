import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Person, Projet } from '../../core/models';
import { ProjetsFacade } from '../../core/services/projets.facade';
import { PersonsFacade } from '../../core/services/persons.facade';
import { CotisationsFacade } from '../../core/services/cotisations.facade';
import { NotificationService } from '../../core/services/notification.service';
import { ResponsiveService } from '../../core/services/responsive.service';
import { PdfExportService, PdfColumn } from '../../core/services/pdf-export.service';
import { GnfPipe } from '../../core/pipes/gnf.pipe';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ColumnSelectionDialogComponent } from '../shared/column-selection-dialog.component';

@Component({
  selector: 'app-projet-non-contributors',
  standalone: true,
  imports: [
    RouterLink,
    FormsModule,
    GnfPipe,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatDialogModule,
  ],
  template: `
    <div class="header">
      <a mat-icon-button [routerLink]="['/projets', projetId()]">
        <mat-icon>arrow_back</mat-icon>
      </a>
      <h1>
        <mat-icon class="title-icon">money_off</mat-icon>
        N'ont pas cotisé à ce projet
      </h1>
      @if (nonContributors().length > 0) {
        <button mat-flat-button color="primary" (click)="exportPdf()">
          <mat-icon>picture_as_pdf</mat-icon>
          @if (!responsive.isMobile()) { <span>Exporter PDF</span> }
        </button>
      }
    </div>

    @if (loading()) {
      <div class="loading">
        <mat-progress-spinner mode="indeterminate" diameter="50" />
      </div>
    } @else if (projet(); as p) {
      <mat-card class="projet-info-card">
        <div class="projet-info">
          <div>
            <div class="label">Projet</div>
            <a [routerLink]="['/projets', p.id]" class="projet-link">{{ p.nom }}</a>
          </div>
          <div>
            <div class="label">Statut</div>
            <span class="chip chip-{{ p.statut.toLowerCase() }}">{{ p.statut }}</span>
          </div>
          <div>
            <div class="label">Coût estimé</div>
            <strong>{{ p.coutEstime | gnf }}</strong>
          </div>
        </div>
      </mat-card>

      <mat-card class="summary-card">
        <div class="summary-info">
          <mat-icon style="color:#f57c00">info</mat-icon>
          <div>
            <strong>{{ filteredPersons().length }}</strong> personne(s) active(s) n'ont pas encore cotisé à ce projet.
            <div class="hint">Seules les personnes avec le statut "Actif" sont listées.</div>
          </div>
        </div>
      </mat-card>

      <mat-form-field appearance="outline" class="search">
        <mat-label>Rechercher</mat-label>
        <mat-icon matPrefix>search</mat-icon>
        <input matInput [(ngModel)]="searchTerm" placeholder="Nom, prénom, ville..." />
      </mat-form-field>

      @if (responsive.isMobile()) {
        <div class="cards-grid">
          @for (person of filteredPersons(); track person.id) {
            <mat-card class="person-card" [routerLink]="['/persons', person.id]">
              <div class="card-header">
                <strong>{{ person.civilite }} {{ person.nom }} {{ person.prenom }}</strong>
                <span class="card-id">{{ person.id }}</span>
              </div>
              <div class="card-body">
                @if (person.nomPere) {
                  <div class="card-row">
                    <mat-icon>family_restroom</mat-icon>
                    <span>Père : {{ person.nomPere }}</span>
                  </div>
                }
                @if (person.telephone) {
                  <div class="card-row">
                    <mat-icon>phone</mat-icon>
                    <span>{{ person.telephone }}</span>
                  </div>
                }
                <div class="card-row">
                  <mat-icon>location_on</mat-icon>
                  <span>{{ person.ville }}, {{ person.pays }}</span>
                </div>
              </div>
            </mat-card>
          } @empty {
            <mat-card class="empty-card">
              Tout le monde a cotisé à ce projet !
            </mat-card>
          }
        </div>
      } @else {
        <div class="table-wrap">
          <table mat-table [dataSource]="filteredPersons()" class="mat-elevation-z2">
            <ng-container matColumnDef="id">
              <th mat-header-cell *matHeaderCellDef>ID</th>
              <td mat-cell *matCellDef="let p">{{ p.id }}</td>
            </ng-container>
            <ng-container matColumnDef="nom">
              <th mat-header-cell *matHeaderCellDef>Nom complet</th>
              <td mat-cell *matCellDef="let p">
                <a [routerLink]="['/persons', p.id]" class="link">
                  {{ p.civilite }} {{ p.nom }} {{ p.prenom }}
                </a>
              </td>
            </ng-container>
            <ng-container matColumnDef="nomPere">
              <th mat-header-cell *matHeaderCellDef>Nom du père</th>
              <td mat-cell *matCellDef="let p">{{ p.nomPere || '—' }}</td>
            </ng-container>
            <ng-container matColumnDef="telephone">
              <th mat-header-cell *matHeaderCellDef>Téléphone</th>
              <td mat-cell *matCellDef="let p">{{ p.telephone || '—' }}</td>
            </ng-container>
            <ng-container matColumnDef="ville">
              <th mat-header-cell *matHeaderCellDef>Ville</th>
              <td mat-cell *matCellDef="let p">{{ p.ville }}</td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="columns"></tr>
            <tr mat-row *matRowDef="let row; columns: columns"></tr>
            <tr class="mat-row" *matNoDataRow>
              <td class="mat-cell no-data" [attr.colspan]="columns.length">
                Tout le monde a cotisé à ce projet !
              </td>
            </tr>
          </table>
        </div>
      }
    }
  `,
  styles: [
    `
      .header { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
      .header h1 { margin: 0; display: flex; align-items: center; gap: 0.5rem; }
      .title-icon { color: #f57c00; }
      .loading { display: flex; justify-content: center; padding: 4rem; }
      .projet-info-card { padding: 1.5rem; margin-bottom: 1rem; }
      .projet-info {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 1.5rem;
      }
      .projet-info .label {
        font-size: 0.7rem;
        text-transform: uppercase;
        color: #888;
        letter-spacing: 0.05em;
        margin-bottom: 0.25rem;
      }
      .projet-link { color: #3f51b5; text-decoration: none; font-weight: 500; font-size: 1.05rem; }
      .projet-link:hover { text-decoration: underline; }
      .chip {
        padding: 4px 10px;
        border-radius: 12px;
        font-size: 0.85rem;
        font-weight: 500;
      }
      .chip-actif { background: #c8e6c9; color: #1b5e20; }
      .chip-terminé { background: #bbdefb; color: #0d47a1; }
      .chip-annulé { background: #ffcdd2; color: #b71c1c; }
      .summary-card { padding: 1.25rem 1.5rem; margin-bottom: 1rem; background: #fff8e1; }
      .summary-info { display: flex; align-items: center; gap: 1rem; }
      .summary-info mat-icon { font-size: 2rem; width: 2rem; height: 2rem; }
      .summary-info strong { font-size: 1.25rem; color: #f57c00; }
      .hint { font-size: 0.85rem; color: #888; margin-top: 0.25rem; }
      .search { width: 100%; max-width: 400px; margin-bottom: 1rem; }
      .table-wrap { overflow: auto; background: white; border-radius: 4px; }
      table { width: 100%; }
      .link { color: #3f51b5; text-decoration: none; font-weight: 500; }
      .link:hover { text-decoration: underline; }
      .no-data { text-align: center; padding: 2rem; color: #4caf50; font-weight: 500; }

      .cards-grid { display: flex; flex-direction: column; gap: 0.75rem; }
      .person-card { padding: 1rem; cursor: pointer; }
      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 0.5rem;
        margin-bottom: 0.75rem;
      }
      .card-header strong { font-size: 1rem; }
      .card-id { font-size: 0.75rem; color: #888; }
      .card-body { display: flex; flex-direction: column; gap: 0.4rem; }
      .card-row { display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; color: #555; }
      .card-row mat-icon { font-size: 1rem; width: 1rem; height: 1rem; color: #888; }
      .empty-card {
        padding: 2rem;
        text-align: center;
        color: #4caf50;
        font-weight: 500;
        background: #e8f5e9;
      }
    `,
  ],
})
export class ProjetNonContributorsComponent implements OnInit {
  private readonly projetsFacade = inject(ProjetsFacade);
  private readonly personsFacade = inject(PersonsFacade);
  private readonly cotisationsFacade = inject(CotisationsFacade);
  private readonly pdfService = inject(PdfExportService);
  private readonly dialog = inject(MatDialog);
  private readonly route = inject(ActivatedRoute);
  private readonly notif = inject(NotificationService);
  readonly responsive = inject(ResponsiveService);

  private readonly gnfPipe = new GnfPipe();

  readonly projetId = signal('');
  readonly projet = signal<Projet | null>(null);
  readonly nonContributors = signal<Person[]>([]);
  readonly loading = signal(true);
  searchTerm = '';

  readonly columns = ['id', 'nom', 'nomPere', 'telephone', 'ville'];

  private readonly pdfColumns: PdfColumn[] = [
    { key: 'id', label: 'ID', width: 20 },
    { key: 'fullName', label: 'Nom complet' },
    { key: 'civilite', label: 'Civilité', width: 20 },
    { key: 'nom', label: 'Nom' },
    { key: 'prenom', label: 'Prénom' },
    { key: 'nomPere', label: 'Nom du père' },
    { key: 'telephone', label: 'Téléphone' },
    { key: 'adresse', label: 'Adresse' },
    { key: 'ville', label: 'Ville' },
    { key: 'pays', label: 'Pays' },
    { key: 'total', label: 'Total cotisé', align: 'right', width: 35 },
  ];

  readonly filteredPersons = computed(() => {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) return this.nonContributors();
    return this.nonContributors().filter(
      (p) =>
        p.nom.toLowerCase().includes(term) ||
        p.prenom.toLowerCase().includes(term) ||
        p.id.toLowerCase().includes(term) ||
        p.ville.toLowerCase().includes(term),
    );
  });

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.projetId.set(id);
    try {
      const [projet, persons, stats] = await Promise.all([
        this.projetsFacade.findById(id),
        this.personsFacade.findAll(),
        this.cotisationsFacade.getStatsByPersonForProjet(id),
      ]);
      this.projet.set(projet);

      const contributorIds = new Set(stats.keys());
      const nonContrib = persons
        .filter((p) => p.statut === 'Actif' && !contributorIds.has(p.id))
        .sort((a, b) => a.nom.localeCompare(b.nom, 'fr'));
      this.nonContributors.set(nonContrib);
    } catch (e: unknown) {
      this.notif.error(e instanceof Error ? e.message : 'Erreur');
    } finally {
      this.loading.set(false);
    }
  }

  exportPdf(): void {
    const projet = this.projet();
    if (!projet) return;

    const defaultSelected = ['fullName', 'nomPere', 'ville', 'total'];

    const ref = this.dialog.open(ColumnSelectionDialogComponent, {
      width: '500px',
      data: {
        title: 'Exporter la liste des non-contributeurs',
        columns: this.pdfColumns,
        defaultSelected,
      },
    });

    ref.afterClosed().subscribe((selectedKeys: string[] | null) => {
      if (!selectedKeys || selectedKeys.length === 0) return;

      const rows = this.filteredPersons();
      const dateSlug = new Date().toISOString().slice(0, 10);
      const projetSlug = projet.nom
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .toLowerCase()
        .slice(0, 40);

      this.pdfService.exportTable<Person>({
        title: "N'ont pas cotisé à ce projet",
        subtitle: `Projet : ${projet.nom}`,
        columns: this.pdfColumns,
        selectedColumnKeys: selectedKeys,
        stats: [
          { label: 'Personnes à relancer', value: String(rows.length) },
          { label: 'Statut filtré', value: 'Actif uniquement' },
        ],
        rows,
        cellValue: (p, key) => this.formatCell(p, key),
        filename: `non-contributeurs-${projetSlug}-${dateSlug}`,
      });

      this.notif.success('PDF téléchargé');
    });
  }

  private formatCell(p: Person, key: string): string {
    switch (key) {
      case 'id': return p.id;
      case 'fullName': return `${p.civilite} ${p.nom} ${p.prenom}`;
      case 'civilite': return p.civilite;
      case 'nom': return p.nom;
      case 'prenom': return p.prenom;
      case 'nomPere': return p.nomPere ?? '';
      case 'telephone': return p.telephone ?? '';
      case 'adresse': return p.adresse;
      case 'ville': return p.ville;
      case 'pays': return p.pays;
      case 'total': return this.gnfPipe.transform(0);
      default: return '';
    }
  }
}
