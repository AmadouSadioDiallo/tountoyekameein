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
import jsPDF from 'jspdf';

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
      @if (cr()) {
        <button mat-flat-button color="primary" (click)="exportPdf()">
          <mat-icon>picture_as_pdf</mat-icon>
          Exporter PDF
        </button>
      }
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

  exportPdf(): void {
    const c = this.cr();
    if (!c) return;

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const marginX = 14;
    const contentWidth = pageWidth - 2 * marginX;
    let y = 15;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(63, 81, 181);
    doc.text('Tountoye ka méïn', marginX, y);

    y += 8;
    doc.setFontSize(13);
    doc.setTextColor(60, 60, 60);
    doc.text('Compte rendu de réunion', marginX, y);

    y += 5;
    doc.setDrawColor(200, 200, 200);
    doc.line(marginX, y, pageWidth - marginX, y);
    y += 8;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(33, 33, 33);
    const titleLines = doc.splitTextToSize(c.nomReunion, contentWidth);
    doc.text(titleLines, marginX, y);
    y += titleLines.length * 6 + 4;

    const datePipe = new DatePipe('fr-FR');
    const fields: { label: string; value: string }[] = [
      { label: 'Date', value: datePipe.transform(c.date, 'EEEE d MMMM y') ?? c.date },
      { label: 'Rédacteur', value: c.redacteur },
    ];
    if (c.lieu) fields.push({ label: 'Lieu', value: c.lieu });
    const p = this.projet();
    fields.push({ label: 'Projet', value: p ? p.nom : 'Réunion générale' });

    doc.setFillColor(245, 245, 247);
    doc.rect(marginX, y - 4, contentWidth, fields.length * 7 + 4, 'F');

    for (const field of fields) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(120, 120, 120);
      doc.text(`${field.label} :`, marginX + 3, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(50, 50, 50);
      doc.text(field.value, marginX + 30, y);
      y += 7;
    }

    y += 6;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(63, 81, 181);
    doc.text('CONTENU', marginX, y);
    y += 2;
    doc.setDrawColor(63, 81, 181);
    doc.line(marginX, y, marginX + 25, y);
    y += 6;

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = c.contenu;
    const plainText = tempDiv.textContent ?? '';

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(50, 50, 50);
    const lines = doc.splitTextToSize(plainText, contentWidth);
    const pageHeight = doc.internal.pageSize.getHeight();

    for (const line of lines) {
      if (y > pageHeight - 20) {
        doc.addPage();
        y = 15;
      }
      doc.text(line, marginX, y);
      y += 5;
    }

    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Page ${i} / ${pageCount}`,
        pageWidth - marginX,
        pageHeight - 8,
        { align: 'right' },
      );
      doc.text('Tountoye ka méïn — Gestion adhérents', marginX, pageHeight - 8);
    }

    const dateSlug = new Date().toISOString().slice(0, 10);
    const slug = c.nomReunion
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .toLowerCase()
      .slice(0, 40);
    doc.save(`compte-rendu-${slug}-${dateSlug}.pdf`);
    this.notif.success('PDF téléchargé');
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