import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';
import { AuditAction, AuditEntry } from '../../core/models';
import { AuditService } from '../../core/services/audit.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-historique',
  standalone: true,
  imports: [
    FormsModule,
    DatePipe,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatExpansionModule,
  ],
  template: `
    <h1>Historique des actions</h1>

    <div class="filters">
      <mat-form-field appearance="outline" class="search-field">
        <mat-label>Rechercher</mat-label>
        <mat-icon matPrefix>search</mat-icon>
        <input matInput [(ngModel)]="searchTerm" (ngModelChange)="resetPage()" />
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Action</mat-label>
        <mat-select [(ngModel)]="filterAction" (ngModelChange)="resetPage()">
          <mat-option value="">Toutes</mat-option>
          <mat-option value="CREATE">Création</mat-option>
          <mat-option value="UPDATE">Modification</mat-option>
          <mat-option value="DELETE">Suppression</mat-option>
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Entité</mat-label>
        <mat-select [(ngModel)]="filterEntity" (ngModelChange)="resetPage()">
          <mat-option value="">Toutes</mat-option>
          <mat-option value="Person">Personne</mat-option>
          <mat-option value="Cotisation">Cotisation</mat-option>
        </mat-select>
      </mat-form-field>
    </div>

    @if (loading()) {
      <div class="loading">
        <mat-progress-spinner mode="indeterminate" diameter="50" />
      </div>
    } @else {
      <mat-accordion class="entries">
        @for (entry of paginatedEntries(); track entry.timestamp + entry.entityId) {
          <mat-expansion-panel>
            <mat-expansion-panel-header>
              <mat-panel-title>
                <span class="badge badge-{{ entry.action.toLowerCase() }}">
                  {{ entry.action }}
                </span>
                <span class="entity">{{ entry.entity }}</span>
                <span class="entity-id">{{ entry.entityId }}</span>
              </mat-panel-title>
              <mat-panel-description>
                <span class="user">{{ entry.userEmail }}</span>
                <span class="time">{{ entry.timestamp | date: 'dd/MM/yyyy HH:mm:ss' }}</span>
              </mat-panel-description>
            </mat-expansion-panel-header>
            <pre class="details">{{ formatDetails(entry.details) }}</pre>
          </mat-expansion-panel>
        } @empty {
          <p class="empty">Aucune entrée d'historique.</p>
        }
      </mat-accordion>

      <mat-paginator
        [length]="filteredEntries().length"
        [pageSize]="pageSize()"
        [pageSizeOptions]="[10, 25, 50, 100]"
        [pageIndex]="pageIndex()"
        (page)="onPageChange($event)"
        showFirstLastButtons
      />
    }
  `,
  styles: [
    `
      h1 { margin-bottom: 1.5rem; }
      .filters {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
        margin-bottom: 1rem;
      }
      .search-field { flex: 1; min-width: 280px; }
      .loading { display: flex; justify-content: center; padding: 4rem; }
      .entries { display: block; margin-bottom: 1rem; }
      mat-expansion-panel { margin-bottom: 4px; }
      mat-panel-title { gap: 1rem; align-items: center; }
      mat-panel-description { justify-content: flex-end; gap: 1rem; }
      .badge {
        font-size: 0.7rem;
        font-weight: 600;
        padding: 3px 8px;
        border-radius: 4px;
        color: white;
      }
      .badge-create { background: #4caf50; }
      .badge-update { background: #2196f3; }
      .badge-delete { background: #f44336; }
      .entity { font-weight: 500; }
      .entity-id { color: #666; font-size: 0.9rem; }
      .user { color: #555; }
      .time { color: #888; font-size: 0.85rem; }
      .details {
        background: #f5f5f5;
        padding: 1rem;
        border-radius: 4px;
        font-size: 0.85rem;
        max-height: 400px;
        overflow: auto;
        margin: 0;
      }
      .empty { color: #888; font-style: italic; text-align: center; padding: 2rem; }
    `,
  ],
})
export class HistoriqueComponent implements OnInit {
  private readonly audit = inject(AuditService);
  private readonly notif = inject(NotificationService);

  readonly loading = signal(true);
  readonly entries = signal<AuditEntry[]>([]);
  readonly pageIndex = signal(0);
  readonly pageSize = signal(25);
  searchTerm = '';
  filterAction: AuditAction | '' = '';
  filterEntity: 'Person' | 'Cotisation' | '' = '';

  readonly filteredEntries = computed(() => {
    const term = this.searchTerm.toLowerCase().trim();
    return this.entries().filter((e) => {
      if (this.filterAction && e.action !== this.filterAction) return false;
      if (this.filterEntity && e.entity !== this.filterEntity) return false;
      if (!term) return true;
      return (
        e.userEmail.toLowerCase().includes(term) ||
        e.entityId.toLowerCase().includes(term) ||
        e.details.toLowerCase().includes(term)
      );
    });
  });

  readonly paginatedEntries = computed(() => {
    const start = this.pageIndex() * this.pageSize();
    return this.filteredEntries().slice(start, start + this.pageSize());
  });

  async ngOnInit(): Promise<void> {
    try {
      this.entries.set(await this.audit.findAll());
    } catch (e: unknown) {
      this.notif.error(e instanceof Error ? e.message : 'Erreur');
    } finally {
      this.loading.set(false);
    }
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  resetPage(): void {
    this.pageIndex.set(0);
  }

  formatDetails(raw: string): string {
    try {
      return JSON.stringify(JSON.parse(raw), null, 2);
    } catch {
      return raw;
    }
  }
}
