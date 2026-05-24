export function objectToRow<T extends object>(
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

export function rowToObject<T extends object>(
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
      const num = Number(raw);
      (obj as Record<string, unknown>)[col] = raw === '' || raw == null || isNaN(num) ? 0 : num;
    } else {
      (obj as Record<string, unknown>)[col] = raw ?? '';
    }
  });
  return obj;
}
