export function nextId(existingIds: string[], prefix: string, padding = 4): string {
  const max = existingIds
    .filter((id) => id?.startsWith(`${prefix}-`))
    .map((id) => parseInt(id.slice(prefix.length + 1), 10))
    .filter((n) => !isNaN(n))
    .reduce((acc, n) => Math.max(acc, n), 0);
  const next = (max + 1).toString().padStart(padding, '0');
  return `${prefix}-${next}`;
}
