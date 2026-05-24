import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProjetFormData, STATUTS_PROJET } from '../../core/models';
import { ProjetsFacade } from '../../core/services/projets.facade';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-projet-form',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="header">
      <a mat-icon-button routerLink="/projets">
        <mat-icon>arrow_back</mat-icon>
      </a>
      <h1>{{ isEdit() ? 'Modifier le projet' : 'Nouveau projet' }}</h1>
    </div>

    @if (loading()) {
      <div class="loading">
        <mat-progress-spinner mode="indeterminate" diameter="50" />
      </div>
    } @else {
      <mat-card class="form-card">
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <mat-form-field appearance="outline" class="full">
            <mat-label>Nom du projet *</mat-label>
            <input matInput formControlName="nom" maxlength="250" />
            <mat-hint align="end">{{ form.controls.nom.value.length }}/250</mat-hint>
            @if (form.controls.nom.touched && form.controls.nom.invalid) {
              <mat-error>Nom obligatoire</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline" class="full">
            <mat-label>Description</mat-label>
            <textarea matInput formControlName="description" rows="4"></textarea>
          </mat-form-field>

          <div class="row">
            <mat-form-field appearance="outline">
              <mat-label>Coût estimé (GNF) *</mat-label>
              <input matInput formControlName="coutEstime" type="number" min="0" step="1" />
              <span matSuffix>GNF</span>
              @if (form.controls.coutEstime.touched && form.controls.coutEstime.invalid) {
                <mat-error>Montant invalide</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Statut *</mat-label>
              <mat-select formControlName="statut">
                @for (s of statuts; track s) {
                  <mat-option [value]="s">{{ s }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
          </div>

          <div class="actions">
            <a mat-button routerLink="/projets">Annuler</a>
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
      .form-card { padding: 2rem; max-width: 800px; }
      .full { width: 100%; display: block; margin-bottom: 1rem; }
      .row {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 1rem 1.5rem;
        margin-bottom: 1rem;
      }
      .row mat-form-field { width: 100%; }
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
export class ProjetFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly facade = inject(ProjetsFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly notif = inject(NotificationService);

  readonly statuts = STATUTS_PROJET;
  readonly loading = signal(false);
  readonly submitting = signal(false);
  readonly isEdit = signal(false);
  private editId: string | null = null;

  readonly form = this.fb.nonNullable.group({
    nom: ['', [Validators.required, Validators.maxLength(250)]],
    description: [''],
    coutEstime: [0, [Validators.required, Validators.min(0)]],
    statut: ['Actif' as const, [Validators.required]],
  });

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.editId = id;
    this.isEdit.set(true);
    this.loading.set(true);
    try {
      const projet = await this.facade.findById(id);
      if (!projet) {
        this.notif.error('Projet introuvable');
        this.router.navigate(['/projets']);
        return;
      }
      this.form.patchValue({
        nom: projet.nom,
        description: projet.description ?? '',
        coutEstime: projet.coutEstime,
        statut: projet.statut,
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
      const data: ProjetFormData = {
        nom: raw.nom,
        description: raw.description || undefined,
        coutEstime: Number(raw.coutEstime),
        statut: raw.statut,
      };
      if (this.isEdit() && this.editId) {
        await this.facade.update(this.editId, data);
        this.notif.success('Projet modifié');
      } else {
        await this.facade.create(data);
        this.notif.success('Projet créé');
      }
      this.router.navigate(['/projets']);
    } catch (e: unknown) {
      this.notif.error(e instanceof Error ? e.message : 'Erreur');
    } finally {
      this.submitting.set(false);
    }
  }
}
