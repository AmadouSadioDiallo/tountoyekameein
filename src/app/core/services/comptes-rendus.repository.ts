import { Injectable, inject } from '@angular/core';
import { SheetsApiService } from './sheets-api.service';
import { environment } from '../../../environments/environment';
import {
  CompteRendu,
  CompteRenduFormData,
  COMPTE_RENDU_COLUMNS,
} from '../models/compte-rendu.model';
import { objectToRow, rowToObject } from '../utils/sheet-mapper';
import { nextId } from '../utils/id-generator';

const SHEET = environment.sheets.comptesRendus;
const BOOLEAN_FIELDS = ['supprime'] as const;

@Injectable({ providedIn: 'root' })
export class ComptesRendusRepository {
  private readonly api = inject(SheetsApiService);

  async findAll(includeDeleted = false): Promise<CompteRendu[]> {
    const rows = await this.api.readAll(SHEET);
    const crs = rows.map((row) =>
      rowToObject<CompteRendu>(row, COMPTE_RENDU_COLUMNS, BOOLEAN_FIELDS),
    );
    return includeDeleted ? crs : crs.filter((c) => !c.supprime);
  }

  async findById(id: string): Promise<CompteRendu | null> {
    const all = await this.findAll(true);
    return all.find((c) => c.id === id) ?? null;
  }

  async findByProjetId(projetId: string): Promise<CompteRendu[]> {
    const all = await this.findAll();
    return all.filter((c) => c.projetId === projetId);
  }

  async getCountsByProjet(): Promise<Map<string, number>> {
    const all = await this.findAll();
    const counts = new Map<string, number>();
    for (const cr of all) {
      if (cr.projetId) {
        counts.set(cr.projetId, (counts.get(cr.projetId) ?? 0) + 1);
      }
    }
    return counts;
  }

  async create(data: CompteRenduFormData): Promise<CompteRendu> {
    const all = await this.findAll(true);
    const now = new Date().toISOString();
    const cr: CompteRendu = {
      ...data,
      id: nextId(all.map((c) => c.id), 'CR'),
      dateCreation: now,
      dateModif: now,
      supprime: false,
    };
    await this.api.append(SHEET, objectToRow(cr, [...COMPTE_RENDU_COLUMNS]));
    return cr;
  }

  async update(id: string, data: CompteRenduFormData): Promise<CompteRendu> {
    const rows = await this.api.readAll(SHEET);
    const idx = rows.findIndex((row) => row[0] === id);
    if (idx === -1) throw new Error(`Compte rendu ${id} introuvable`);

    const existing = rowToObject<CompteRendu>(rows[idx], COMPTE_RENDU_COLUMNS, BOOLEAN_FIELDS);
    const updated: CompteRendu = {
      ...existing,
      ...data,
      id: existing.id,
      dateCreation: existing.dateCreation,
      dateModif: new Date().toISOString(),
      supprime: existing.supprime,
    };
    await this.api.updateRow(SHEET, idx, objectToRow(updated, [...COMPTE_RENDU_COLUMNS]));
    return updated;
  }

  async softDelete(id: string): Promise<void> {
    const rows = await this.api.readAll(SHEET);
    const idx = rows.findIndex((row) => row[0] === id);
    if (idx === -1) throw new Error(`Compte rendu ${id} introuvable`);

    const existing = rowToObject<CompteRendu>(rows[idx], COMPTE_RENDU_COLUMNS, BOOLEAN_FIELDS);
    const deleted: CompteRendu = {
      ...existing,
      supprime: true,
      dateModif: new Date().toISOString(),
    };
    await this.api.updateRow(SHEET, idx, objectToRow(deleted, [...COMPTE_RENDU_COLUMNS]));
  }
}
