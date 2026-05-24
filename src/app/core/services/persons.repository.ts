import { Injectable, inject } from '@angular/core';
import { SheetsApiService } from './sheets-api.service';
import { environment } from '../../../environments/environment';
import {
  Person,
  PersonFormData,
  PERSON_COLUMNS,
} from '../models/person.model';
import { objectToRow, rowToObject } from '../utils/sheet-mapper';
import { nextId } from '../utils/id-generator';

const SHEET = environment.sheets.persons;
const BOOLEAN_FIELDS = ['supprime'] as const;

@Injectable({ providedIn: 'root' })
export class PersonsRepository {
  private readonly api = inject(SheetsApiService);

  async findAll(includeDeleted = false): Promise<Person[]> {
    const rows = await this.api.readAll(SHEET);
    const persons = rows.map((row) =>
      rowToObject<Person>(row, PERSON_COLUMNS, BOOLEAN_FIELDS),
    );
    return includeDeleted ? persons : persons.filter((p) => !p.supprime);
  }

  async findById(id: string): Promise<Person | null> {
    const all = await this.findAll(true);
    return all.find((p) => p.id === id) ?? null;
  }

  async existsByEmail(email: string, exceptId?: string): Promise<boolean> {
    const all = await this.findAll(true);
    return all.some(
      (p) =>
        p.email.toLowerCase() === email.toLowerCase() &&
        p.id !== exceptId &&
        !p.supprime,
    );
  }

  async create(data: PersonFormData): Promise<Person> {
    const all = await this.findAll(true);
    const now = new Date().toISOString();
    const person: Person = {
      ...data,
      id: nextId(all.map((p) => p.id), 'PERS'),
      dateCreation: now,
      dateModif: now,
      supprime: false,
    };
    await this.api.append(SHEET, objectToRow(person, [...PERSON_COLUMNS]));
    return person;
  }

  async update(id: string, data: PersonFormData): Promise<Person> {
    const rows = await this.api.readAll(SHEET);
    const idx = rows.findIndex((row) => row[0] === id);
    if (idx === -1) throw new Error(`Person ${id} not found`);

    const existing = rowToObject<Person>(rows[idx], PERSON_COLUMNS, BOOLEAN_FIELDS);
    const updated: Person = {
      ...existing,
      ...data,
      id: existing.id,
      dateCreation: existing.dateCreation,
      dateModif: new Date().toISOString(),
      supprime: existing.supprime,
    };
    await this.api.updateRow(SHEET, idx, objectToRow(updated, [...PERSON_COLUMNS]));
    return updated;
  }

  async softDelete(id: string): Promise<void> {
    const rows = await this.api.readAll(SHEET);
    const idx = rows.findIndex((row) => row[0] === id);
    if (idx === -1) throw new Error(`Person ${id} not found`);

    const existing = rowToObject<Person>(rows[idx], PERSON_COLUMNS, BOOLEAN_FIELDS);
    const deleted: Person = {
      ...existing,
      supprime: true,
      dateModif: new Date().toISOString(),
    };
    await this.api.updateRow(SHEET, idx, objectToRow(deleted, [...PERSON_COLUMNS]));
  }
}
