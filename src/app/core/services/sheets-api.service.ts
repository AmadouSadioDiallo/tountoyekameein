import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

declare const gapi: any;

/**
 * Wrapper bas niveau de l'API Google Sheets.
 * Aucune logique métier ici — uniquement des opérations CRUD sur des plages.
 *
 * Les repositories (PersonsRepository, etc.) appellent ces méthodes
 * et n'ont jamais à connaître gapi.
 */
@Injectable({ providedIn: 'root' })
export class SheetsApiService {
  private readonly spreadsheetId = environment.spreadsheetId;

  /** Lit toutes les lignes d'un onglet (sans la ligne d'en-têtes). */
  async readAll(sheetName: string): Promise<unknown[][]> {
    const response = await gapi.client.sheets.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range: `${sheetName}!A2:Z`,
    });
    return response.result.values ?? [];
  }

  /** Ajoute une ligne à la fin d'un onglet. */
  async append(sheetName: string, row: unknown[]): Promise<void> {
    await gapi.client.sheets.spreadsheets.values.append({
      spreadsheetId: this.spreadsheetId,
      range: `${sheetName}!A1`,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      resource: { values: [row] },
    });
  }

  /**
   * Met à jour une ligne précise (1-indexée, ligne 1 = en-têtes donc ligne réelle = index + 2).
   * @param rowIndexInData index dans le tableau retourné par readAll (0-based)
   */
  async updateRow(
    sheetName: string,
    rowIndexInData: number,
    row: unknown[],
  ): Promise<void> {
    const realRow = rowIndexInData + 2; // +1 pour 1-indexed, +1 pour skip header
    await gapi.client.sheets.spreadsheets.values.update({
      spreadsheetId: this.spreadsheetId,
      range: `${sheetName}!A${realRow}`,
      valueInputOption: 'USER_ENTERED',
      resource: { values: [row] },
    });
  }
}
