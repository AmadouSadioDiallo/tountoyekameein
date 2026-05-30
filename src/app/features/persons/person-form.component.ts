import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  CIVILITES,
  Civilite,
  PersonFormData,
  STATUTS,
  Statut,
} from '../../core/models';
import { PersonsFacade } from '../../core/services/persons.facade';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-person-form',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="header">
      <a mat-icon-button routerLink="/persons">
        <mat-icon>arrow_back</mat-icon>
      </a>
      <h1>{{ isEdit() ? 'Modifier la personne' : 'Nouvelle personne' }}</h1>
    </div>

    @if (loading()) {
      <div class="loading">
        <mat-progress-spinner mode="indeterminate" diameter="50" />
      </div>
    } @else {
      <mat-card class="form-card">
        <form [formGroup]="form" (ngSubmit)="onSubmit()">

          <h3 class="section-title">État civil</h3>
          <div class="grid">
            <mat-form-field appearance="outline">
              <mat-label>Civilité *</mat-label>
              <mat-select formControlName="civilite">
                @for (c of civilites; track c) {
                  <mat-option [value]="c">{{ c }}</mat-option>
                }
              </mat-select>
              @if (form.controls.civilite.touched && form.controls.civilite.invalid) {
                <mat-error>Champ obligatoire</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Nom *</mat-label>
              <input matInput formControlName="nom" maxlength="250" />
              <mat-hint align="end">{{ form.controls.nom.value.length }}/250</mat-hint>
              @if (form.controls.nom.touched && form.controls.nom.invalid) {
                <mat-error>Nom obligatoire</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Prénom *</mat-label>
              <input matInput formControlName="prenom" maxlength="250" />
              <mat-hint align="end">{{ form.controls.prenom.value.length }}/250</mat-hint>
              @if (form.controls.prenom.touched && form.controls.prenom.invalid) {
                <mat-error>Prénom obligatoire</mat-error>
              }
            </mat-form-field>
          </div>

          <mat-divider />

          <h3 class="section-title">Naissance</h3>
          <div class="grid">
            <mat-form-field appearance="outline">
              <mat-label>Date de naissance</mat-label>
              <input matInput [matDatepicker]="picker" formControlName="dateNaissance" />
              <mat-datepicker-toggle matIconSuffix [for]="picker" />
              <mat-datepicker #picker />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Ville de naissance *</mat-label>
              <input matInput formControlName="villeNaissance" maxlength="250" />
              @if (form.controls.villeNaissance.touched && form.controls.villeNaissance.invalid) {
                <mat-error>Ville de naissance obligatoire</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Pays de naissance *</mat-label>
              <input matInput formControlName="paysNaissance" maxlength="250" />
              @if (form.controls.paysNaissance.touched && form.controls.paysNaissance.invalid) {
                <mat-error>Pays de naissance obligatoire</mat-error>
              }
            </mat-form-field>
          </div>

          <mat-divider />

          <h3 class="section-title">Filiation <span class="optional">(optionnel)</span></h3>
          <div class="grid">
            <mat-form-field appearance="outline">
              <mat-label>Nom du père</mat-label>
              <input matInput formControlName="nomPere" maxlength="250" />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Nom de la mère</mat-label>
              <input matInput formControlName="nomMere" maxlength="250" />
            </mat-form-field>
          </div>

          <mat-divider />

          <h3 class="section-title">Contact</h3>
          <div class="grid">
            <mat-form-field appearance="outline">
              <mat-label>Email</mat-label>
              <input matInput formControlName="email" type="email" />
              @if (form.controls.email.touched && form.controls.email.errors?.['email']) {
                <mat-error>Email invalide</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Téléphone</mat-label>
              <input matInput formControlName="telephone" placeholder="06 12 34 56 78" />
              @if (form.controls.telephone.touched && form.controls.telephone.errors?.['pattern']) {
                <mat-error>Format invalide</mat-error>
              }
            </mat-form-field>
          </div>

          <mat-divider />

          <h3 class="section-title">Adresse</h3>
          <div class="grid">
            <mat-form-field appearance="outline" class="full">
              <mat-label>Adresse *</mat-label>
              <textarea matInput formControlName="adresse" rows="2"></textarea>
              @if (form.controls.adresse.touched && form.controls.adresse.invalid) {
                <mat-error>Adresse obligatoire</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Ville *</mat-label>
              <input matInput formControlName="ville" />
              @if (form.controls.ville.touched && form.controls.ville.invalid) {
                <mat-error>Ville obligatoire</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Pays *</mat-label>
              <input matInput formControlName="pays" />
              @if (form.controls.pays.touched && form.controls.pays.invalid) {
                <mat-error>Pays obligatoire</mat-error>
              }
            </mat-form-field>
          </div>

          <mat-divider />

          <h3 class="section-title">Complément</h3>
          <div class="grid">
            <mat-form-field appearance="outline">
              <mat-label>Statut *</mat-label>
              <mat-select formControlName="statut">
                @for (s of statuts; track s) {
                  <mat-option [value]="s">{{ s }}</mat-option>
                }
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full">
              <mat-label>Notes</mat-label>
              <textarea matInput formControlName="notes" rows="3"></textarea>
            </mat-form-field>
          </div>

          <div class="actions">
            <a mat-button routerLink="/persons">Annuler</a>
            <button
              mat-flat-button
              color="primary"
              type="submit"
              [disabled]="form.invalid || submitting()"
            >
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
  styleUrl: './person-form.component.scss',
})
export class PersonFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly facade = inject(PersonsFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly notif = inject(NotificationService);

  readonly civilites = CIVILITES;
  readonly statuts = STATUTS;
  readonly loading = signal(false);
  readonly submitting = signal(false);
  readonly isEdit = signal(false);
  private editId: string | null = null;

  readonly form = this.fb.nonNullable.group({
    civilite: ['M.' as Civilite, [Validators.required]],
    nom: ['', [Validators.required, Validators.maxLength(250)]],
    prenom: ['', [Validators.required, Validators.maxLength(250)]],
    email: ['', [Validators.email]],
    telephone: ['', [Validators.pattern(/^[\d\s+\-().]{6,20}$/)]],
    dateNaissance: [null as Date | null],
    villeNaissance: ['', [Validators.required, Validators.maxLength(250)]],
    paysNaissance: ['', [Validators.required, Validators.maxLength(250)]],
    nomPere: ['', [Validators.maxLength(250)]],
    nomMere: ['', [Validators.maxLength(250)]],
    adresse: ['', [Validators.required]],
    ville: ['', [Validators.required]],
    pays: ['Guinée', [Validators.required]],
    statut: ['Actif' as Statut, [Validators.required]],
    notes: [''],
  });

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.editId = id;
    this.isEdit.set(true);
    this.loading.set(true);
    try {
      const person = await this.facade.findById(id);
      if (!person) {
        this.notif.error('Personne introuvable');
        this.router.navigate(['/persons']);
        return;
      }
      this.form.patchValue({
        civilite: person.civilite,
        nom: person.nom,
        prenom: person.prenom,
        email: person.email,
        telephone: person.telephone ?? '',
        dateNaissance: person.dateNaissance ? new Date(person.dateNaissance) : null,
        villeNaissance: person.villeNaissance,
        paysNaissance: person.paysNaissance,
        nomPere: person.nomPere ?? '',
        nomMere: person.nomMere ?? '',
        adresse: person.adresse,
        ville: person.ville,
        pays: person.pays,
        statut: person.statut,
        notes: person.notes ?? '',
      });
    } catch (e: unknown) {
      this.notif.error(e instanceof Error ? e.message : 'Erreur de chargement');
    } finally {
      this.loading.set(false);
    }
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    try {
      const raw = this.form.getRawValue();
      const data: PersonFormData = {
        ...raw,
        dateNaissance: raw.dateNaissance ? raw.dateNaissance.toISOString().slice(0, 10) : undefined,
        telephone: raw.telephone || undefined,
        nomPere: raw.nomPere || undefined,
        nomMere: raw.nomMere || undefined,
        notes: raw.notes || undefined,
      };
      if (this.isEdit() && this.editId) {
        await this.facade.update(this.editId, data);
        this.notif.success('Personne modifiée');
      } else {
        await this.facade.create(data);
        this.notif.success('Personne créée');
      }
      this.router.navigate(['/persons']);
    } catch (e: unknown) {
      this.notif.error(e instanceof Error ? e.message : 'Erreur');
    } finally {
      this.submitting.set(false);
    }
  }
}
