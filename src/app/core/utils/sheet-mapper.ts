/**
 * Utilitaires de conversion entre lignes du Sheet (any[]) et objets typés.
 * Le Sheet renvoie des tableaux indexés par colonne ; on convertit via les
 * en-têtes définis dans les modèles (ex: PERSON_COLUMNS).
 */

/** Convertit un objet en ligne (tableau) selon l'ordre des colonnes. */
export function objectToRow<T extends Record<string, unknown>>(
  obj: T,
  columns: readonly (keyof T & string)[],
): unknown[] {
  return columns.map((col) => {
    const val = obj[col];
    if (val === undefined || val === null) return '';
    if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
    return val;
  });
}

/** Convertit une ligne (tableau) en objet selon l'ordre des colonnes. */
export function rowToObject<T extends Record<string, unknown>>(
  row: unknown[],
  columns: readonly (keyof T & string)[],
  booleanFields: readonly (keyof T)[] = [],
  numberFields: readonly (keyof T)[] = [],
): T {
  const obj = {} as T;
  columns.forEach((col, i) => {
    const raw = row[i];
    if (booleanFields.includes(col)) {
      (obj as Record<string, unknown>)[col] = raw === 'TRUE' || raw === true;
    } else if (numberFields.includes(col)) {
      (obj as Record<string, unknown>)[col] = raw === '' || raw == null ? 0 : Number(raw);
    } else {
      (obj as Record<string, unknown>)[col] = raw ?? '';
    }
  });
  return obj;
}
