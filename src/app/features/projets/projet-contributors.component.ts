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

interface ContributorRow {
  person: Person;
  total: number;
  count: number;
}

@Component({
  selector: 'app-projet-contributors',
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
        <mat-icon class="title-icon">paid</mat-icon>
        Ont cotisé à ce projet
      </h1>
      @if (rows().length > 0) {
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
        <div class="summary-row">
          <div class="summary-item">
            <mat-icon class="icon-success">people</mat-icon>
            <div>
              <div class="metric-value">{{ filteredRows().length }}</div>
              <div class="metric-label">Contributeur(s)</div>
            </div>
          </div>
          <div class="summary-item">
            <mat-icon class="icon-primary">paid</mat-icon>
            <div>
              <div class="metric-value">{{ totalCollecte() | gnf }}</div>
              <div class="metric-label">Total collecté</div>
            </div>
          </div>
          <div class="summary-item">
            <mat-icon class="icon-warning-alt">receipt</mat-icon>
            <div>
              <div class="metric-value">{{ totalCotisations() }}</div>
              <div class="metric-label">Cotisation(s)</div>
            </div>
          </div>
        </div>
      </mat-card>

      <mat-form-field appearance="outline" class="search">
        <mat-label>Rechercher</mat-label>
        <mat-icon matPrefix>search</mat-icon>
        <input matInput [(ngModel)]="searchTerm" placeholder="Nom, prénom, ID..." />
      </mat-form-field>

      @if (responsive.isMobile()) {
        <div class="cards-grid">
          @for (r of filteredRows(); track r.person.id) {
            <mat-card class="contrib-card" [routerLink]="['/persons', r.person.id]">
              <div class="card-header">
                <strong>{{ r.person.civilite }} {{ r.person.nom }} {{ r.person.prenom }}</strong>
                <span class="card-id">{{ r.person.id }}</span>
              </div>
              @if (r.person.nomPere) {
                <div class="card-pere">
                  <mat-icon>family_restroom</mat-icon>
                  <span>Père : {{ r.person.nomPere }}</span>
                </div>
              }
              <div class="card-amounts">
                <div>
                  <span class="label">Total</span>
                  <strong>{{ r.total | gnf }}</strong>
                </div>
                <div>
                  <span class="label">Cotisations</span>
                  <strong>{{ r.count }}</strong>
                </div>
              </div>
            </mat-card>
          } @empty {
            <mat-card class="empty-card">Aucun contributeur trouvé.</mat-card>
          }
        </div>
      } @else {
        <div class="table-wrap">
          <table mat-table [dataSource]="filteredRows()" class="mat-elevation-z2">
            <ng-container matColumnDef="id">
              <th mat-header-cell *matHeaderCellDef>ID</th>
              <td mat-cell *matCellDef="let r">{{ r.person.id }}</td>
            </ng-container>
            <ng-container matColumnDef="nom">
              <th mat-header-cell *matHeaderCellDef>Nom complet</th>
              <td mat-cell *matCellDef="let r">
                <a [routerLink]="['/persons', r.person.id]" class="link">
                  {{ r.person.civilite }} {{ r.person.nom }} {{ r.person.prenom }}
                </a>
              </td>
            </ng-container>
            <ng-container matColumnDef="nomPere">
              <th mat-header-cell *matHeaderCellDef>Nom du père</th>
              <td mat-cell *matCellDef="let r">{{ r.person.nomPere || '—' }}</td>
            </ng-container>
            <ng-container matColumnDef="telephone">
              <th mat-header-cell *matHeaderCellDef>Téléphone</th>
              <td mat-cell *matCellDef="let r">{{ r.person.telephone || '—' }}</td>
            </ng-container>
            <ng-container matColumnDef="count">
              <th mat-header-cell *matHeaderCellDef>Nb cotisations</th>
              <td mat-cell *matCellDef="let r"><strong>{{ r.count }}</strong></td>
            </ng-container>
            <ng-container matColumnDef="total">
              <th mat-header-cell *matHeaderCellDef>Total cotisé</th>
              <td mat-cell *matCellDef="let r"><strong class="total">{{ r.total | gnf }}</strong></td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="columns"></tr>
            <tr mat-row *matRowDef="let row; columns: columns"></tr>
            <tr class="mat-row" *matNoDataRow>
              <td class="mat-cell no-data" [attr.colspan]="columns.length">
                Aucun contributeur pour ce projet.
              </td>
            </tr>
          </table>
        </div>
      }
    }
  `,
  styleUrl: './projet-contributors.component.scss',
})
export class ProjetContributorsComponent implements OnInit {
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
  readonly rows = signal<ContributorRow[]>([]);
  readonly loading = signal(true);
  searchTerm = '';

  readonly columns = ['id', 'nom', 'nomPere', 'telephone', 'count', 'total'];

  private readonly pdfColumns: PdfColumn[] = [
    { key: 'id', label: 'ID', width: 20 },
    { key: 'fullName', label: 'Nom complet' },
    { key: 'civilite', label: 'Civilité', width: 20 },
    { key: 'nom', label: 'Nom' },
    { key: 'prenom', label: 'Prénom' },
    { key: 'nomPere', label: 'Nom du père' },
    { key: 'telephone', label: 'Téléphone' },
    { key: 'ville', label: 'Ville' },
    { key: 'pays', label: 'Pays' },
    { key: 'count', label: 'Nb cotisations', align: 'center', width: 25 },
    { key: 'total', label: 'Total cotisé', align: 'right', width: 35 },
  ];

  readonly filteredRows = computed(() => {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) return this.rows();
    return this.rows().filter(
      (r) =>
        r.person.nom.toLowerCase().includes(term) ||
        r.person.prenom.toLowerCase().includes(term) ||
        r.person.id.toLowerCase().includes(term),
    );
  });

  readonly totalCollecte = computed(() =>
    this.filteredRows().reduce((s, r) => s + r.total, 0),
  );

  readonly totalCotisations = computed(() =>
    this.filteredRows().reduce((s, r) => s + r.count, 0),
  );

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

      const personById = new Map(persons.map((p) => [p.id, p]));
      const rows: ContributorRow[] = [];
      for (const [personId, s] of stats.entries()) {
        const person = personById.get(personId);
        if (person) {
          rows.push({ person, total: s.total, count: s.count });
        }
      }
      rows.sort((a, b) => b.total - a.total);
      this.rows.set(rows);
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
        title: 'Exporter la liste des contributeurs',
        columns: this.pdfColumns,
        defaultSelected,
      },
    });

    ref.afterClosed().subscribe((selectedKeys: string[] | null) => {
      if (!selectedKeys || selectedKeys.length === 0) return;

      const rows = this.filteredRows();
      const dateSlug = new Date().toISOString().slice(0, 10);
      const projetSlug = projet.nom
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .toLowerCase()
        .slice(0, 40);

      this.pdfService.exportTable<ContributorRow>({
        title: 'Liste des contributeurs',
        subtitle: `Projet : ${projet.nom}`,
        columns: this.pdfColumns,
        selectedColumnKeys: selectedKeys,
        stats: [
          { label: 'Contributeurs', value: String(rows.length) },
          { label: 'Total collecté', value: this.gnfPipe.transform(this.totalCollecte()) },
          { label: 'Cotisations', value: String(this.totalCotisations()) },
        ],
        rows,
        cellValue: (r, key) => this.formatCell(r, key),
        filename: `contributeurs-${projetSlug}-${dateSlug}`,
      });

      this.notif.success('PDF téléchargé');
    });
  }

  private formatCell(row: ContributorRow, key: string): string {
    const p = row.person;
    switch (key) {
      case 'id': return p.id;
      case 'fullName': return `${p.civilite} ${p.nom} ${p.prenom}`;
      case 'civilite': return p.civilite;
      case 'nom': return p.nom;
      case 'prenom': return p.prenom;
      case 'nomPere': return p.nomPere ?? '';
      case 'telephone': return p.telephone ?? '';
      case 'ville': return p.ville;
      case 'pays': return p.pays;
      case 'count': return String(row.count);
      case 'total': return this.gnfPipe.transform(row.total);
      default: return '';
    }
  }
}
