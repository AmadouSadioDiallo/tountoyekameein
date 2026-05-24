import { Injectable, inject } from '@angular/core';
import { SheetsApiService } from './sheets-api.service';
import { environment } from '../../../environments/environment';
import {
  AuditAction,
  AuditEntity,
  AuditEntry,
  AUDIT_COLUMNS,
} from '../models/audit.model';
import { objectToRow, rowToObject } from '../utils/sheet-mapper';
import { CurrentUserService } from './current-user.service';

const SHEET = environment.sheets.historique;

/**
 * Service d'audit : log toute action CREATE/UPDATE/DELETE
 * dans la feuille Historique.
 */
@Injectable({ providedIn: 'root' })
export class AuditService {
  private readonly api = inject(SheetsApiService);
  private readonly currentUser = inject(CurrentUserService);

  async log(
    action: AuditAction,
    entity: AuditEntity,
    entityId: string,
    details: Record<string, unknown> = {},
  ): Promise<void> {
    const user = this.currentUser.user();
    const entry: AuditEntry = {
      timestamp: new Date().toISOString(),
      userEmail: user?.email ?? 'unknown',
      action,
      entity,
      entityId,
      details: JSON.stringify(details),
    };
    await this.api.append(SHEET, objectToRow(entry, [...AUDIT_COLUMNS]));
  }

  async findAll(): Promise<AuditEntry[]> {
    const rows = await this.api.readAll(SHEET);
    const entries = rows.map((row) =>
      rowToObject<AuditEntry>(row, AUDIT_COLUMNS),
    );
    // tri décroissant par timestamp
    return entries.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }
}
