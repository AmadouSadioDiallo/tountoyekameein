import { nextId } from './id-generator';

describe('nextId', () => {
  it('should return first ID when no existing IDs', () => {
    expect(nextId([], 'PERS')).toBe('PERS-0001');
  });

  it('should increment from the highest existing ID', () => {
    const existing = ['PERS-0001', 'PERS-0002', 'PERS-0003'];
    expect(nextId(existing, 'PERS')).toBe('PERS-0004');
  });

  it('should ignore IDs with different prefixes', () => {
    const existing = ['COT-0005', 'PERS-0002', 'PROJ-0010'];
    expect(nextId(existing, 'PERS')).toBe('PERS-0003');
  });

  it('should handle gaps in IDs', () => {
    const existing = ['PERS-0001', 'PERS-0010'];
    expect(nextId(existing, 'PERS')).toBe('PERS-0011');
  });

  it('should use custom padding', () => {
    expect(nextId([], 'X', 6)).toBe('X-000001');
  });

  it('should handle null or undefined IDs in the list', () => {
    const existing = [null as unknown as string, 'PERS-0003', undefined as unknown as string];
    expect(nextId(existing, 'PERS')).toBe('PERS-0004');
  });

  it('should handle non-numeric suffixes gracefully', () => {
    const existing = ['PERS-abc', 'PERS-0002'];
    expect(nextId(existing, 'PERS')).toBe('PERS-0003');
  });
});
