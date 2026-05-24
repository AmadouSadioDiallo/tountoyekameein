import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CompteRendu, Projet } from '../../core/models';
import { ComptesRendusFacade } from '../../core/services/comptes-rendus.facade';
import { ProjetsFacade } from '../../core/services/projets.facade';
import { CurrentUserService } from '../../core/services/current-user.service';
import { NotificationService } from '../../core/services/notification.service';
import { ConfirmDialogComponent } from '../shared/confirm-dialog.component';

@Component({
  selector: 'app-compte-rendu-detail',
  standalone: true,
  imports: [
    RouterLink,
    DatePipe,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDialogModule,
  ],
  template: `
    <div class="header">
      <a mat-icon-button routerLink="/comptes-rendus">
        <mat-icon>arrow_back</mat-icon>
      </a>
      <h1>Compte rendu</h1>
      @if (isAdmin() && cr()) {
        <a mat-flat-button color="primary" [routerLink]="['/comptes-rendus', cr()!.id, 'edit']">
          <mat-icon>edit</mat-icon>
          Modifier
        </a>
        <button mat-stroked-button color="warn" (click)="confirmDelete()">
          <mat-icon>delete</mat-icon>
          Supprimer
        </button>
      }
    </div>

    @if (loading()) {
      <div class="loading">
        <mat-progress-spinner mode="indeterminate" diameter="50" />
      </div>
    } @else if (cr(); as c) {
      <mat-card class="detail-card">
        <div class="cr-header">
          <h2>{{ c.nomReunion }}</h2>
          <span class="cr-id">{{ c.id }}</span>
        </div>

        <div class="meta-grid">
          <div class="field">
            <mat-icon>event</mat-icon>
            <div>
              <label>Date de réunion</label>
              <span>{{ c.date | date: 'EEEE d MMMM y' }}</span>
            </div>
          </div>
          <div class="field">
            <mat-icon>person</mat-icon>
            <div>
              <label>Rédacteur</label>
              <span>{{ c.redacteur }}</span>
            </div>
          </div>
          @if (c.lieu) {
            <div class="field">
              <mat-icon>place</mat-icon>
              <div>
                <label>Lieu</label>
                <span>{{ c.lieu }}</span>
              </div>
            </div>
          }
          <div class="field">
            <mat-icon>folder</mat-icon>
            <div>
              <label>Projet</label>
              @if (projet(); as p) {
                <a [routerLink]="['/projets', p.id]" class="projet-link">{{ p.nom }}</a>
              } @else {
                <span class="muted">Réunion générale (sans projet)</span>
              }
            </div>
          </div>
        </div>

        <h3 class="section-title">Compte rendu</h3>
        <div class="content ql-editor" [innerHTML]="c.contenu"></div>

        <div class="meta-footer">
          <span>Créé le {{ c.dateCreation | date: 'dd/MM/yyyy HH:mm' }}</span>
          <span>Modifié le {{ c.dateModif | date: 'dd/MM/yyyy HH:mm' }}</span>
        </div>
      </mat-card>
    }
  `,
  styles: [
    `
      .header { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
      .header h1 { margin: 0; flex: 1; }
      .loading { display: flex; justify-content: center; padding: 4rem; }
      .detail-card { padding: 2rem; }
      .cr-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 1rem;
        margin-bottom: 1.5rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid #eee;
      }
      .cr-header h2 { margin: 0; font-size: 1.5rem; }
      .cr-id {
        background: #e8eaf6;
        color: #3f51b5;
        padding: 4px 10px;
        border-radius: 12px;
        font-size: 0.85rem;
        font-weight: 500;
        white-space: nowrap;
      }
      .meta-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 1.5rem;
        margin-bottom: 2rem;
      }
      .field { display: flex; align-items: center; gap: 0.75rem; }
      .field mat-icon { color: #3f51b5; }
      .field label {
        font-size: 0.7rem;
        text-transform: uppercase;
        color: #888;
        letter-spacing: 0.05em;
        display: block;
      }
      .field span { font-size: 1rem; }
      .projet-link {
        color: #3f51b5;
        text-decoration: none;
        font-weight: 500;
      }
      .projet-link:hover { text-decoration: underline; }
      .muted { color: #888; font-style: italic; }
      .section-title {
        margin: 0 0 1rem;
        color: #3f51b5;
        font-size: 0.95rem;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      .content {
        background: #fafafa;
        padding: 1.5rem;
        border-radius: 4px;
        line-height: 1.6;
        font-size: 1rem;
        color: #333;
        border-left: 3px solid #3f51b5;
      }
      .content h1, .content h2, .content h3 { margin: 0.5rem 0; }
      .content ul, .content ol { padding-left: 1.5rem; margin: 0.5rem 0; }
      .content p { margin: 0.25rem 0; }
      .meta-footer {
        margin-top: 1.5rem;
        padding-top: 1rem;
        border-top: 1px solid #eee;
        display: flex;
        gap: 2rem;
        color: #888;
        font-size: 0.85rem;
        flex-wrap: wrap;
      }
    `,
  ],
})
export class CompteRenduDetailComponent implements OnInit {
  private readonly facade = inject(ComptesRendusFacade);
  private readonly projetsFacade = inject(ProjetsFacade);
  private readonly currentUser = inject(CurrentUserService);
  private readonly route = inject(ActivatedRoute);
  private readonly notif = inject(NotificationService);
  private readonly dialog = inject(MatDialog);

  readonly cr = signal<CompteRendu | null>(null);
  readonly projet = signal<Projet | null>(null);
  readonly loading = signal(true);
  readonly isAdmin = this.currentUser.isAdmin;

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    try {
      const cr = await this.facade.findById(id);
      this.cr.set(cr);
      if (cr?.projetId) {
        const p = await this.projetsFacade.findById(cr.projetId);
        this.projet.set(p);
      }
    } catch (e: unknown) {
      this.notif.error(e instanceof Error ? e.message : 'Erreur');
    } finally {
      this.loading.set(false);
    }
  }

  confirmDelete(): void {
    const c = this.cr();
    if (!c) return;
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirmer la suppression',
        message: `Supprimer le compte rendu "${c.nomReunion}" ?`,
        confirmLabel: 'Supprimer',
        color: 'warn',
      },
    });
    ref.afterClosed().subscribe(async (ok) => {
      if (!ok) return;
      try {
        await this.facade.delete(c.id);
        this.notif.success('Compte rendu supprimé');
        history.back();
      } catch (e: unknown) {
        this.notif.error(e instanceof Error ? e.message : 'Erreur');
      }
    });
  }
}