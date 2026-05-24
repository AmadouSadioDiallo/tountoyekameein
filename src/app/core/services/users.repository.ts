import { Injectable, inject } from '@angular/core';
import { SheetsApiService } from './sheets-api.service';
import { environment } from '../../../environments/environment';
import { AppUser, USER_COLUMNS } from '../models/user.model';
import { rowToObject } from '../utils/sheet-mapper';

const SHEET = environment.sheets.users;
const BOOLEAN_FIELDS = ['actif'] as const;

@Injectable({ providedIn: 'root' })
export class UsersRepository {
  private readonly api = inject(SheetsApiService);

  async findAll(): Promise<AppUser[]> {
    const rows = await this.api.readAll(SHEET);
    return rows.map((row) =>
      rowToObject<AppUser>(row, USER_COLUMNS, BOOLEAN_FIELDS),
    );
  }

  async findByEmail(email: string): Promise<AppUser | null> {
    const all = await this.findAll();
    const found = all.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.actif,
    );
    return found ?? null;
  }
}
