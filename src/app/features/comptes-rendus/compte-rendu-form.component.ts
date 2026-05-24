import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  CompteRenduFormData,
  CONTENU_MAX_LENGTH,
} from '../../core/models';
import { ComptesRendusFacade } from '../../core/services/comptes-rendus.facade';
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
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
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
          </div>

          <h3 class="section-title">Contenu</h3>
          <mat-form-field appearance="outline" class="full">
            <mat-label>Compte rendu *</mat-label>
            <textarea
              matInput
              formControlName="contenu"
              rows="12"
              [maxlength]="maxLength"
              placeholder="Rédigez ici le compte rendu..."
              spellcheck="true"
              lang="fr"
              autocorrect="on"
              autocapitalize="sentences"
            ></textarea>
            <mat-hint align="start" class="spell-hint">
              <mat-icon class="hint-icon">spellcheck</mat-icon>
              Correcteur orthographique activé (clic droit pour les suggestions)
            </mat-hint>
            <mat-hint align="end" [class.warn]="contenuLength() > maxLength * 0.9">
              {{ contenuLength() }} / {{ maxLength }} caractères
            </mat-hint>
            @if (form.controls.contenu.touched && form.controls.contenu.invalid) {
              @if (form.controls.contenu.errors?.['required']) {
                <mat-error>Contenu obligatoire</mat-error>
              } @else if (form.controls.contenu.errors?.['maxlength']) {
                <mat-error>Le contenu dépasse {{ maxLength }} caractères</mat-error>
              }
            }
          </mat-form-field>

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
  styles: [
    `
      .header { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1.5rem; }
      .header h1 { margin: 0; }
      .loading { display: flex; justify-content: center; padding: 4rem; }
      .form-card { padding: 2rem; max-width: 1000px; }
      .section-title {
        margin: 1.5rem 0 1rem;
        color: #3f51b5;
        font-size: 0.95rem;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      .section-title:first-child { margin-top: 0; }
      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
        gap: 1rem 1.5rem;
        margin-bottom: 1rem;
      }
      .full { grid-column: 1 / -1; width: 100%; }
      .actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
        margin-top: 1.5rem;
        padding-top: 1.5rem;
        border-top: 1px solid #eee;
      }
      .warn { color: #f57c00 !important; font-weight: 500; }
      .spell-hint {
        display: inline-flex !important;
        align-items: center;
        gap: 0.25rem;
        color: #4caf50 !important;
      }
      .hint-icon {
        font-size: 1rem !important;
        width: 1rem !important;
        height: 1rem !important;
        vertical-align: middle;
      }
    `,
  ],
})
export class CompteRenduFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly facade = inject(ComptesRendusFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly notif = inject(NotificationService);
  private readonly currentUser = inject(CurrentUserService);

  readonly maxLength = CONTENU_MAX_LENGTH;
  readonly loading = signal(false);
  readonly submitting = signal(false);
  readonly isEdit = signal(false);
  private editId: string | null = null;

  readonly form = this.fb.nonNullable.group({
    nomReunion: ['', [Validators.required, Validators.maxLength(250)]],
    date: [new Date(), [Validators.required]],
    lieu: ['', [Validators.maxLength(250)]],
    redacteur: ['', [Validators.required, Validators.maxLength(250)]],
    contenu: ['', [Validators.required, Validators.maxLength(CONTENU_MAX_LENGTH)]],
  });

  readonly contenuLength = signal(0);

  ngOnInit(): void {
    // Pré-remplir le rédacteur avec le nom de l'utilisateur connecté
    const u = this.currentUser.user();
    if (u && !this.isEdit()) {
      this.form.patchValue({ redacteur: u.name });
    }

    // Suivre la longueur du contenu pour le compteur
    this.form.controls.contenu.valueChanges.subscribe((v) => {
      this.contenuLength.set((v ?? '').length);
    });

    this.loadIfEdit();
  }

  private async loadIfEdit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.editId = id;
    this.isEdit.set(true);
    this.loading.set(true);
    try {
      const cr = await this.facade.findById(id);
      if (!cr) {
        this.notif.error('Compte rendu introuvable');
        this.router.navigate(['/comptes-rendus']);
        return;
      }
      this.form.patchValue({
        nomReunion: cr.nomReunion,
        date: new Date(cr.date),
        lieu: cr.lieu ?? '',
        redacteur: cr.redacteur,
        contenu: cr.contenu,
      });
      this.contenuLength.set(cr.contenu.length);
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
      const data: CompteRenduFormData = {
        nomReunion: raw.nomReunion,
        date: raw.date.toISOString().slice(0, 10),
        lieu: raw.lieu || undefined,
        redacteur: raw.redacteur,
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
