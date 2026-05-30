import { Injectable, inject } from '@angular/core';
import { SheetsApiService } from './sheets-api.service';
import { environment } from '../../../environments/environment';
import {
  Projet,
  ProjetFormData,
  PROJET_COLUMNS,
} from '../models';
import { objectToRow, rowToObject } from '../utils/sheet-mapper';
import { nextId } from '../utils/id-generator';

const SHEET = environment.sheets.projets;
const BOOLEAN_FIELDS = ['archive', 'supprime'] as const;
const NUMBER_FIELDS = ['coutEstime'] as const;

@Injectable({ providedIn: 'root' })
export class ProjetsRepository {
  private readonly api = inject(SheetsApiService);

  async findAll(includeArchived = false, includeDeleted = false): Promise<Projet[]> {
    const rows = await this.api.readAll(SHEET);
    let projets = rows.map((row) =>
      rowToObject<Projet>(row, PROJET_COLUMNS, BOOLEAN_FIELDS, NUMBER_FIELDS),
    );
    if (!includeDeleted) projets = projets.filter((p) => !p.supprime);
    if (!includeArchived) projets = projets.filter((p) => !p.archive);
    return projets;
  }

  async findById(id: string): Promise<Projet | null> {
    const all = await this.findAll(true, true);
    return all.find((p) => p.id === id) ?? null;
  }

  async create(data: ProjetFormData): Promise<Projet> {
    const all = await this.findAll(true, true);
    const now = new Date().toISOString();
    const projet: Projet = {
      ...data,
      id: nextId(all.map((p) => p.id), 'PROJ'),
      archive: false,
      dateCreation: now,
      dateModif: now,
      supprime: false,
    };
    await this.api.append(SHEET, objectToRow(projet, [...PROJET_COLUMNS]));
    return projet;
  }

  async update(id: string, data: ProjetFormData): Promise<Projet> {
    const rows = await this.api.readAll(SHEET);
    const idx = rows.findIndex((row) => row[0] === id);
    if (idx === -1) throw new Error(`Projet ${id} introuvable`);

    const existing = rowToObject<Projet>(rows[idx], PROJET_COLUMNS, BOOLEAN_FIELDS, NUMBER_FIELDS);
    const updated: Projet = {
      ...existing,
      ...data,
      id: existing.id,
      archive: existing.archive,
      dateCreation: existing.dateCreation,
      dateModif: new Date().toISOString(),
      supprime: existing.supprime,
    };
    await this.api.updateRow(SHEET, idx, objectToRow(updated, [...PROJET_COLUMNS]));
    return updated;
  }

  async setArchive(id: string, archive: boolean): Promise<Projet> {
    const rows = await this.api.readAll(SHEET);
    const idx = rows.findIndex((row) => row[0] === id);
    if (idx === -1) throw new Error(`Projet ${id} introuvable`);

    const existing = rowToObject<Projet>(rows[idx], PROJET_COLUMNS, BOOLEAN_FIELDS, NUMBER_FIELDS);
    const updated: Projet = {
      ...existing,
      archive,
      dateModif: new Date().toISOString(),
    };
    await this.api.updateRow(SHEET, idx, objectToRow(updated, [...PROJET_COLUMNS]));
    return updated;
  }

  async softDelete(id: string): Promise<void> {
    const rows = await this.api.readAll(SHEET);
    const idx = rows.findIndex((row) => row[0] === id);
    if (idx === -1) throw new Error(`Projet ${id} introuvable`);

    const existing = rowToObject<Projet>(rows[idx], PROJET_COLUMNS, BOOLEAN_FIELDS, NUMBER_FIELDS);
    const deleted: Projet = {
      ...existing,
      supprime: true,
      dateModif: new Date().toISOString(),
    };
    await this.api.updateRow(SHEET, idx, objectToRow(deleted, [...PROJET_COLUMNS]));
  }
}
