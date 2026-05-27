import { Injectable, inject } from '@angular/core';
import { SheetsApiService } from './sheets-api.service';
import { environment } from '../../../environments/environment';
import {
  Cotisation,
  CotisationFormData,
  COTISATION_COLUMNS,
} from '../models/cotisation.model';
import { objectToRow, rowToObject } from '../utils/sheet-mapper';
import { nextId } from '../utils/id-generator';

const SHEET = environment.sheets.cotisations;
const BOOLEAN_FIELDS = ['supprime'] as const;
const NUMBER_FIELDS = ['montant'] as const;

@Injectable({ providedIn: 'root' })
export class CotisationsRepository {
  private readonly api = inject(SheetsApiService);

  async findAll(includeDeleted = false): Promise<Cotisation[]> {
    const rows = await this.api.readAll(SHEET);
    const cotisations = rows.map((row) =>
      rowToObject<Cotisation>(row, COTISATION_COLUMNS, BOOLEAN_FIELDS, NUMBER_FIELDS),
    );
    return includeDeleted ? cotisations : cotisations.filter((c) => !c.supprime);
  }

  async findById(id: string): Promise<Cotisation | null> {
    const all = await this.findAll(true);
    return all.find((c) => c.id === id) ?? null;
  }

  async findByPersonId(personId: string): Promise<Cotisation[]> {
    const all = await this.findAll();
    return all.filter((c) => c.personId === personId);
  }

  async findByProjetId(projetId: string): Promise<Cotisation[]> {
    const all = await this.findAll();
    return all.filter((c) => c.projetId === projetId);
  }

  async create(data: CotisationFormData): Promise<Cotisation> {
    const all = await this.findAll(true);
    const cotisation: Cotisation = {
      ...data,
      id: nextId(all.map((c) => c.id), 'COT'),
      supprime: false,
    };
    await this.api.append(SHEET, objectToRow(cotisation, [...COTISATION_COLUMNS]));
    return cotisation;
  }

  async update(id: string, data: CotisationFormData): Promise<Cotisation> {
    const rows = await this.api.readAll(SHEET);
    const idx = rows.findIndex((row) => row[0] === id);
    if (idx === -1) throw new Error(`Cotisation ${id} introuvable`);

    const existing = rowToObject<Cotisation>(rows[idx], COTISATION_COLUMNS, BOOLEAN_FIELDS, NUMBER_FIELDS);
    const updated: Cotisation = { ...existing, ...data, id: existing.id, supprime: existing.supprime };
    await this.api.updateRow(SHEET, idx, objectToRow(updated, [...COTISATION_COLUMNS]));
    return updated;
  }

  async softDelete(id: string): Promise<void> {
    const rows = await this.api.readAll(SHEET);
    const idx = rows.findIndex((row) => row[0] === id);
    if (idx === -1) throw new Error(`Cotisation ${id} introuvable`);

    const existing = rowToObject<Cotisation>(rows[idx], COTISATION_COLUMNS, BOOLEAN_FIELDS, NUMBER_FIELDS);
    const deleted: Cotisation = { ...existing, supprime: true };
    await this.api.updateRow(SHEET, idx, objectToRow(deleted, [...COTISATION_COLUMNS]));
  }

  /** Renvoie un Map personId -> total cotisé. */
  async getTotalsByPerson(): Promise<Map<string, number>> {
    const all = await this.findAll();
    const totals = new Map<string, number>();
    for (const c of all) {
      totals.set(c.personId, (totals.get(c.personId) ?? 0) + c.montant);
    }
    return totals;
  }

  /** Renvoie un Map projetId -> total collecté. */
  async getTotalsByProjet(): Promise<Map<string, number>> {
    const all = await this.findAll();
    const totals = new Map<string, number>();
    for (const c of all) {
      totals.set(c.projetId, (totals.get(c.projetId) ?? 0) + c.montant);
    }
    return totals;
  }

  /**
   * Pour un projet donné, renvoie un Map personId -> { total, count }.
   * Permet de savoir qui a cotisé et combien à ce projet.
   */
  async getStatsByPersonForProjet(projetId: string): Promise<Map<string, { total: number; count: number }>> {
    const cotisationsProjet = await this.findByProjetId(projetId);
    const stats = new Map<string, { total: number; count: number }>();
    for (const c of cotisationsProjet) {
      const current = stats.get(c.personId) ?? { total: 0, count: 0 };
      stats.set(c.personId, {
        total: current.total + c.montant,
        count: current.count + 1,
      });
    }
    return stats;
  }
}
