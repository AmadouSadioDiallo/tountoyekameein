import { Component, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { PdfColumn } from '../../core/services/pdf-export.service';

export interface ColumnSelectionData {
  title: string;
  columns: PdfColumn[];
  defaultSelected: string[];
}

@Component({
  selector: 'app-column-selection-dialog',
  standalone: true,
  imports: [
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon class="title-icon">picture_as_pdf</mat-icon>
      {{ data.title }}
    </h2>

    <mat-dialog-content>
      <p class="hint">Choisissez les colonnes à inclure dans le PDF :</p>

      <div class="actions-toolbar">
        <button mat-button color="primary" type="button" (click)="selectAll()">
          <mat-icon>check_box</mat-icon>
          Tout cocher
        </button>
        <button mat-button type="button" (click)="selectNone()">
          <mat-icon>check_box_outline_blank</mat-icon>
          Tout décocher
        </button>
      </div>

      <div class="columns-list">
        @for (col of data.columns; track col.key) {
          <mat-checkbox
            [checked]="selected().includes(col.key)"
            (change)="toggle(col.key, $event.checked)"
          >
            {{ col.label }}
          </mat-checkbox>
        }
      </div>

      @if (selected().length === 0) {
        <p class="warn">Sélectionnez au moins une colonne</p>
      }
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="cancel()">Annuler</button>
      <button
        mat-flat-button
        color="primary"
        [disabled]="selected().length === 0"
        (click)="confirm()"
      >
        <mat-icon>download</mat-icon>
        Télécharger le PDF
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      h2 { display: flex; align-items: center; gap: 0.5rem; }
      .title-icon { color: #d32f2f; }
      .hint { color: #666; margin-bottom: 1rem; }
      .actions-toolbar {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 1rem;
        padding-bottom: 0.75rem;
        border-bottom: 1px solid #eee;
      }
      .columns-list {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        max-height: 360px;
        overflow-y: auto;
      }
      .warn {
        color: #f57c00;
        font-size: 0.85rem;
        margin-top: 0.75rem;
        margin-bottom: 0;
      }
    `,
  ],
})
export class ColumnSelectionDialogComponent {
  readonly data = inject<ColumnSelectionData>(MAT_DIALOG_DATA);
  private readonly ref = inject(MatDialogRef<ColumnSelectionDialogComponent>);

  readonly selected = signal<string[]>([...this.data.defaultSelected]);

  toggle(key: string, checked: boolean): void {
    const current = this.selected();
    if (checked && !current.includes(key)) {
      this.selected.set([...current, key]);
    } else if (!checked) {
      this.selected.set(current.filter((k) => k !== key));
    }
  }

  selectAll(): void {
    this.selected.set(this.data.columns.map((c) => c.key));
  }

  selectNone(): void {
    this.selected.set([]);
  }

  cancel(): void {
    this.ref.close(null);
  }

  confirm(): void {
    const orderedKeys = this.data.columns
      .map((c) => c.key)
      .filter((k) => this.selected().includes(k));
    this.ref.close(orderedKeys);
  }
}
