import { objectToRow, rowToObject } from './sheet-mapper';

interface TestEntity {
  id: string;
  name: string;
  age: number;
  active: boolean;
}

const COLUMNS = ['id', 'name', 'age', 'active'] as const;

describe('objectToRow', () => {
  it('should convert an object to a row array following column order', () => {
    const obj: TestEntity = { id: 'T-001', name: 'Alice', age: 30, active: true };
    const row = objectToRow(obj, COLUMNS);
    expect(row).toEqual(['T-001', 'Alice', 30, 'TRUE']);
  });

  it('should convert false booleans to "FALSE"', () => {
    const obj: TestEntity = { id: 'T-001', name: 'Bob', age: 25, active: false };
    const row = objectToRow(obj, COLUMNS);
    expect(row[3]).toBe('FALSE');
  });

  it('should convert null and undefined values to empty string', () => {
    const obj = { id: 'T-001', name: null, age: undefined, active: true };
    const row = objectToRow(obj as unknown as TestEntity, COLUMNS);
    expect(row[1]).toBe('');
    expect(row[2]).toBe('');
  });
});

describe('rowToObject', () => {
  it('should convert a row array to an object', () => {
    const row = ['T-001', 'Alice', '30', 'TRUE'];
    const obj = rowToObject<TestEntity>(row, COLUMNS, ['active'], ['age']);
    expect(obj).toEqual({ id: 'T-001', name: 'Alice', age: 30, active: true });
  });

  it('should handle boolean fields correctly', () => {
    const rowTrue = ['T-001', 'A', '0', 'TRUE'];
    const rowFalse = ['T-001', 'A', '0', 'FALSE'];
    expect(rowToObject<TestEntity>(rowTrue, COLUMNS, ['active']).active).toBe(true);
    expect(rowToObject<TestEntity>(rowFalse, COLUMNS, ['active']).active).toBe(false);
  });

  it('should handle number fields with empty or invalid values', () => {
    const row = ['T-001', 'A', '', 'TRUE'];
    const obj = rowToObject<TestEntity>(row, COLUMNS, ['active'], ['age']);
    expect(obj.age).toBe(0);

    const rowNaN = ['T-001', 'A', 'abc', 'TRUE'];
    const objNaN = rowToObject<TestEntity>(rowNaN, COLUMNS, ['active'], ['age']);
    expect(objNaN.age).toBe(0);
  });

  it('should handle null/undefined values in row as empty string', () => {
    const row = ['T-001', null, undefined, 'FALSE'];
    const obj = rowToObject<TestEntity>(row as unknown[], COLUMNS, ['active']);
    expect(obj.name).toBe('');
    expect(obj.age).toBe('');
  });

  it('should handle rows shorter than columns', () => {
    const row = ['T-001', 'Alice'];
    const obj = rowToObject<TestEntity>(row, COLUMNS, ['active'], ['age']);
    expect(obj.age).toBe(0);
    expect(obj.active).toBe(false);
  });
});
