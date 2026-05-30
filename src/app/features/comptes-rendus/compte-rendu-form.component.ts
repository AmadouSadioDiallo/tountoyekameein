import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { QuillModule } from 'ngx-quill';
import {
  CompteRenduFormData,
  CONTENU_MAX_LENGTH,
  Projet,
} from '../../core/models';
import { ComptesRendusFacade } from '../../core/services/comptes-rendus.facade';
import { ProjetsFacade } from '../../core/services/projets.facade';
import { NotificationService } from '../../core/services/notification.service';
import { CurrentUserService } from '../../core/services/current-user.service';

@Component({
  selector: 'app-compte-rendu-form',
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
    MatProgressSpinnerModule,
    QuillModule,
  ],
  template: `
    <div class="header">
      <a mat-icon-button routerLink="/comptes-rendus">
        <mat-icon>arrow_back</mat-icon>
      </a>
      <h1>{{ isEdit() ? 'Modifier le compte rendu' : 'Nouveau compte rendu' }}</h1>
    </div>

    @if (loading()) {
      <div class="loading">
        <mat-progress-spinner mode="indeterminate" diameter="50" />
      </div>
    } @else {
      <mat-card class="form-card">
        <form [formGroup]="form" (ngSubmit)="onSubmit()">

          <h3 class="section-title">Informations de la réunion</h3>
          <div class="grid">
            <mat-form-field appearance="outline" class="full">
              <mat-label>Nom de la réunion *</mat-label>
              <input matInput formControlName="nomReunion" maxlength="250" />
              <mat-hint align="end">{{ form.controls.nomReunion.value.length }}/250</mat-hint>
              @if (form.controls.nomReunion.touched && form.controls.nomReunion.invalid) {
                <mat-error>Nom obligatoire</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Date de la réunion *</mat-label>
              <input matInput [matDatepicker]="picker" formControlName="date" />
              <mat-datepicker-toggle matIconSuffix [for]="picker" />
              <mat-datepicker #picker />
              @if (form.controls.date.touched && form.controls.date.invalid) {
                <mat-error>Date obligatoire</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Lieu</mat-label>
              <input matInput formControlName="lieu" maxlength="250" />
            </mat-form-field>

            <mat-form-field appearance="outline" class="full">
              <mat-label>Rédacteur *</mat-label>
              <input matInput formControlName="redacteur" maxlength="250" />
              @if (form.controls.redacteur.touched && form.controls.redacteur.invalid) {
                <mat-error>Rédacteur obligatoire</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full">
              <mat-label>Projet lié (optionnel)</mat-label>
              <mat-select formControlName="projetId">
                <mat-option [value]="''">— Aucun projet (réunion générale) —</mat-option>
                @for (p of projets(); track p.id) {
                  <mat-option [value]="p.id">{{ p.nom }} ({{ p.statut }})</mat-option>
                }
              </mat-select>
              <mat-hint>Laissez vide pour une réunion générale (AG, bureau...). Seuls les projets actifs sont listés.</mat-hint>
            </mat-form-field>
          </div>

          <h3 class="section-title">Contenu</h3>
          <div class="quill-wrapper" [class.invalid]="form.controls.contenu.touched && form.controls.contenu.invalid">
            <quill-editor
              formControlName="contenu"
              placeholder="Rédigez ici le compte rendu..."
              [modules]="quillModules"
              (onContentChanged)="onContentChanged($event)"
            />
            <div class="quill-footer">
              @if (form.controls.contenu.touched && form.controls.contenu.invalid) {
                <span class="quill-error">
                  @if (form.controls.contenu.errors?.['required']) {
                    Contenu obligatoire
                  } @else if (form.controls.contenu.errors?.['maxlength']) {
                    Le contenu dépasse {{ maxLength }} caractères
                  }
                </span>
              }
              <span class="quill-count" [class.warn]="contenuLength() > maxLength * 0.9">
                {{ contenuLength() }} / {{ maxLength }} caractères
              </span>
            </div>
          </div>

          <div class="actions">
            <a mat-button routerLink="/comptes-rendus">Annuler</a>
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
  styleUrl: './compte-rendu-form.component.scss',
})
export class CompteRenduFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly facade = inject(ComptesRendusFacade);
  private readonly projetsFacade = inject(ProjetsFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly notif = inject(NotificationService);
  private readonly currentUser = inject(CurrentUserService);

  readonly maxLength = CONTENU_MAX_LENGTH;
  readonly quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['clean'],
    ],
  };
  readonly loading = signal(false);
  readonly submitting = signal(false);
  readonly isEdit = signal(false);
  readonly projets = signal<Projet[]>([]);
  private editId: string | null = null;

  readonly form = this.fb.nonNullable.group({
    nomReunion: ['', [Validators.required, Validators.maxLength(250)]],
    date: [new Date(), [Validators.required]],
    lieu: ['', [Validators.maxLength(250)]],
    redacteur: ['', [Validators.required, Validators.maxLength(250)]],
    projetId: [''],
    contenu: ['', [Validators.required]],
  });

  readonly contenuLength = signal(0);

  async ngOnInit(): Promise<void> {
    this.loading.set(true);
    try {
      const projets = await this.projetsFacade.findAll(false);
      this.projets.set(projets);

      const u = this.currentUser.user();

      const projetIdQuery = this.route.snapshot.queryParamMap.get('projetId');
      if (projetIdQuery) {
        this.form.patchValue({ projetId: projetIdQuery });
      }


      const id = this.route.snapshot.paramMap.get('id');
      if (!id) {
        if (u) this.form.patchValue({ redacteur: u.name });
        return;
      }

      this.editId = id;
      this.isEdit.set(true);
      const cr = await this.facade.findById(id);
      if (!cr) {
        this.notif.error('Compte rendu introuvable');
        this.router.navigate(['/comptes-rendus']);
        return;
      }

      if (cr.projetId && !projets.find((p) => p.id === cr.projetId)) {
        const allProjets = await this.projetsFacade.findAll(true);
        this.projets.set(allProjets);
      }

      this.form.patchValue({
        nomReunion: cr.nomReunion,
        date: new Date(cr.date),
        lieu: cr.lieu ?? '',
        redacteur: cr.redacteur,
        projetId: cr.projetId ?? '',
        contenu: cr.contenu,
      });
      this.contenuLength.set(cr.contenu.length);
    } catch (e: unknown) {
      this.notif.error(e instanceof Error ? e.message : 'Erreur de chargement');
    } finally {
      this.loading.set(false);
    }
  }

  onContentChanged(event: { text: string }): void {
    const len = (event.text ?? '').trim().length;
    this.contenuLength.set(len);
    if (len > this.maxLength) {
      this.form.controls.contenu.setErrors({ maxlength: true });
    } else {
      this.form.controls.contenu.updateValueAndValidity();
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
      const data: CompteRenduFormData = {
        nomReunion: raw.nomReunion,
        date: raw.date.toISOString().slice(0, 10),
        lieu: raw.lieu || undefined,
        redacteur: raw.redacteur,
        projetId: raw.projetId || undefined,
        contenu: raw.contenu,
      };
      if (this.isEdit() && this.editId) {
        await this.facade.update(this.editId, data);
        this.notif.success('Compte rendu modifié');
      } else {
        await this.facade.create(data);
        this.notif.success('Compte rendu créé');
      }
      this.router.navigate(['/comptes-rendus']);
    } catch (e: unknown) {
      this.notif.error(e instanceof Error ? e.message : 'Erreur');
    } finally {
      this.submitting.set(false);
    }
  }
}