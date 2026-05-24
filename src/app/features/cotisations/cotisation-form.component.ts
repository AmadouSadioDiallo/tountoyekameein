import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import {
  CotisationFormData,
  MODES_PAIEMENT,
  ModePaiement,
  Person,
  Projet,
} from '../../core/models';
import { CotisationsFacade } from '../../core/services/cotisations.facade';
import { PersonsFacade } from '../../core/services/persons.facade';
import { ProjetsFacade } from '../../core/services/projets.facade';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-cotisation-form',
  standalone: true,
  imports: [
    RouterLink,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatAutocompleteModule,
  ],
  template: `
    <div class="header">
      <a mat-icon-button routerLink="/cotisations">
        <mat-icon>arrow_back</mat-icon>
      </a>
      <h1>{{ isEdit() ? 'Modifier la cotisation' : 'Nouvelle cotisation' }}</h1>
    </div>

    @if (loading()) {
      <div class="loading">
        <mat-progress-spinner mode="indeterminate" diameter="50" />
      </div>
    } @else {
      <mat-card class="form-card">
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <h3 class="section-title">Lien personne et projet</h3>
          <div class="grid">
            <mat-form-field appearance="outline">
              <mat-label>Personne *</mat-label>
              <input
                type="text"
                matInput
                [matAutocomplete]="autoP"
                [(ngModel)]="personQuery"
                [ngModelOptions]="{ standalone: true }"
                (ngModelChange)="onPersonSearch($event)"
                placeholder="Tapez nom ou prénom..."
              />
              <mat-autocomplete #autoP="matAutocomplete" [displayWith]="displayPerson"
                (optionSelected)="onPersonSelected($event.option.value)">
                @for (p of filteredPersons(); track p.id) {
                  <mat-option [value]="p">
                    {{ p.civilite }} {{ p.nom }} {{ p.prenom }} ({{ p.id }})
                  </mat-option>
                }
              </mat-autocomplete>
              @if (form.controls.personId.touched && form.controls.personId.invalid) {
                <mat-error>Personne obligatoire</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Projet *</mat-label>
              <mat-select formControlName="projetId">
                @for (p of projets(); track p.id) {
                  <mat-option [value]="p.id">{{ p.nom }} ({{ p.statut }})</mat-option>
                }
              </mat-select>
              @if (form.controls.projetId.touched && form.controls.projetId.invalid) {
                <mat-error>Projet obligatoire</mat-error>
              }
              <mat-hint>Seuls les projets non archivés sont disponibles</mat-hint>
            </mat-form-field>
          </div>

          <h3 class="section-title">Paiement</h3>
          <div class="grid">
            <mat-form-field appearance="outline">
              <mat-label>Montant *</mat-label>
              <input matInput formControlName="montant" type="number" min="0" step="1" />
              <span matSuffix>GNF</span>
              @if (form.controls.montant.touched && form.controls.montant.invalid) {
                <mat-error>Montant obligatoire et > 0</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Date *</mat-label>
              <input matInput [matDatepicker]="picker" formControlName="date" />
              <mat-datepicker-toggle matIconSuffix [for]="picker" />
              <mat-datepicker #picker />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Mode de paiement *</mat-label>
              <mat-select formControlName="modePaiement">
                @for (m of modes; track m) {
                  <mat-option [value]="m">{{ m }}</mat-option>
                }
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Période *</mat-label>
              <input matInput formControlName="periode" placeholder="ex: 2026 ou 2026/2027" />
              @if (form.controls.periode.touched && form.controls.periode.invalid) {
                <mat-error>Période obligatoire</mat-error>
              }
            </mat-form-field>
          </div>

          <mat-form-field appearance="outline" class="full">
            <mat-label>Notes</mat-label>
            <textarea matInput formControlName="notes" rows="3"></textarea>
          </mat-form-field>

          <div class="actions">
            <a mat-button routerLink="/cotisations">Annuler</a>
            <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || submitting()">
              @if (submitting()) {
                <mat-progress-spinner mode="indeterminate" diameter="20" />
              } @else {
                <mat-icon>save</mat-icon>
              }
              {{ isEdit() ? 'Enregistrer' : 'Créer' }}
            </button>
          </div>
        </form>
      </mat-card>
    }
  `,
  styles: [
    `
      .header { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1.5rem; }
      .header h1 { margin: 0; }
      .loading { display: flex; justify-content: center; padding: 4rem; }
      .form-card { padding: 2rem; max-width: 900px; }
      .section-title {
        margin: 1.5rem 0 1rem;
        color: #3f51b5;
        font-size: 0.95rem;
        font-weight: 500;
        text-transform: uppercase;
      }
      .section-title:first-child { margin-top: 0; }
      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
        gap: 1rem 1.5rem;
        margin-bottom: 1rem;
      }
      .full { width: 100%; display: block; margin-top: 1rem; }
      .actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
        margin-top: 1.5rem;
        padding-top: 1.5rem;
        border-top: 1px solid #eee;
      }
    `,
  ],
})
export class CotisationFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly facade = inject(CotisationsFacade);
  private readonly personsFacade = inject(PersonsFacade);
  private readonly projetsFacade = inject(ProjetsFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly notif = inject(NotificationService);

  readonly modes = MODES_PAIEMENT;
  readonly loading = signal(false);
  readonly submitting = signal(false);
  readonly isEdit = signal(false);
  private editId: string | null = null;

  readonly persons = signal<Person[]>([]);
  readonly projets = signal<Projet[]>([]);
  personQuery = '';
  readonly filteredPersons = signal<Person[]>([]);

  readonly form = this.fb.nonNullable.group({
    personId: ['', [Validators.required]],
    projetId: ['', [Validators.required]],
    montant: [0, [Validators.required, Validators.min(1)]],
    date: [new Date(), [Validators.required]],
    modePaiement: ['Espèces' as ModePaiement, [Validators.required]],
    periode: [new Date().getFullYear().toString(), [Validators.required]],
    notes: [''],
  });

  async ngOnInit(): Promise<void> {
    this.loading.set(true);
    try {
      const [persons, projets] = await Promise.all([
        this.personsFacade.findAll(),
        this.projetsFacade.findAll(false),
      ]);
      this.persons.set(persons);
      this.projets.set(projets);
      this.filteredPersons.set(persons);

      const projetIdQuery = this.route.snapshot.queryParamMap.get('projetId');
      if (projetIdQuery) this.form.patchValue({ projetId: projetIdQuery });

      const id = this.route.snapshot.paramMap.get('id');
      if (!id) return;

      this.editId = id;
      this.isEdit.set(true);
      const cotisation = await this.facade.findById(id);
      if (!cotisation) {
        this.notif.error('Cotisation introuvable');
        this.router.navigate(['/cotisations']);
        return;
      }

      if (!projets.find((p) => p.id === cotisation.projetId)) {
        const allProjets = await this.projetsFacade.findAll(true);
        this.projets.set(allProjets);
      }

      const person = persons.find((p) => p.id === cotisation.personId);
      this.personQuery = person ? `${person.nom} ${person.prenom}` : '';
      this.form.patchValue({
        personId: cotisation.personId,
        projetId: cotisation.projetId,
        montant: cotisation.montant,
        date: new Date(cotisation.date),
        modePaiement: cotisation.modePaiement,
        periode: cotisation.periode,
        notes: cotisation.notes ?? '',
      });
    } catch (e: unknown) {
      this.notif.error(e instanceof Error ? e.message : 'Erreur de chargement');
    } finally {
      this.loading.set(false);
    }
  }

  onPersonSearch(query: string): void {
    if (typeof query !== 'string') return;
    const term = query.toLowerCase().trim();
    if (!term) {
      this.filteredPersons.set(this.persons());
      this.form.patchValue({ personId: '' });
      return;
    }
    this.filteredPersons.set(
      this.persons().filter(
        (p) =>
          p.nom.toLowerCase().includes(term) ||
          p.prenom.toLowerCase().includes(term) ||
          p.id.toLowerCase().includes(term),
      ),
    );
  }

  onPersonSelected(person: Person): void {
    this.form.patchValue({ personId: person.id });
    this.personQuery = `${person.nom} ${person.prenom}`;
  }

  displayPerson(p: Person | string): string {
    if (!p || typeof p === 'string') return '';
    return `${p.civilite} ${p.nom} ${p.prenom}`;
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    try {
      const raw = this.form.getRawValue();
      const data: CotisationFormData = {
        personId: raw.personId,
        projetId: raw.projetId,
        montant: Number(raw.montant),
        date: raw.date.toISOString().slice(0, 10),
        modePaiement: raw.modePaiement,
        periode: raw.periode,
        notes: raw.notes || undefined,
      };
      if (this.isEdit() && this.editId) {
        await this.facade.update(this.editId, data);
        this.notif.success('Cotisation modifiée');
      } else {
        await this.facade.create(data);
        this.notif.success('Cotisation créée');
      }
      this.router.navigate(['/cotisations']);
    } catch (e: unknown) {
      this.notif.error(e instanceof Error ? e.message : 'Erreur');
    } finally {
      this.submitting.set(false);
    }
  }
}
