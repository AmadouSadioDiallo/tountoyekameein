import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

declare const gapi: any;

@Injectable({ providedIn: 'root' })
export class SheetsApiService {
  private readonly spreadsheetId = environment.spreadsheetId;

  async readAll(sheetName: string): Promise<unknown[][]> {
    try {
      const response = await gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: `${sheetName}!A2:Z`,
      });
      return response.result.values ?? [];
    } catch (error: unknown) {
      throw this.wrapError('Lecture', sheetName, error);
    }
  }

  async append(sheetName: string, row: unknown[]): Promise<void> {
    try {
      await gapi.client.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: `${sheetName}!A1`,
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',
        resource: { values: [row] },
      });
    } catch (error: unknown) {
      throw this.wrapError('Écriture', sheetName, error);
    }
  }

  async updateRow(
    sheetName: string,
    rowIndexInData: number,
    row: unknown[],
  ): Promise<void> {
    const realRow = rowIndexInData + 2;
    try {
      await gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: `${sheetName}!A${realRow}`,
        valueInputOption: 'USER_ENTERED',
        resource: { values: [row] },
      });
    } catch (error: unknown) {
      throw this.wrapError('Mise à jour', sheetName, error);
    }
  }

  private wrapError(operation: string, sheetName: string, error: unknown): Error {
    const detail = error instanceof Error
      ? error.message
      : (error as any)?.result?.error?.message ?? 'Erreur inconnue';
    return new Error(`${operation} échouée sur "${sheetName}" : ${detail}`);
  }
}
