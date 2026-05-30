import { GnfPipe } from './gnf.pipe';

describe('GnfPipe', () => {
  let pipe: GnfPipe;

  beforeEach(() => {
    pipe = new GnfPipe();
  });

  it('should format a simple number with GNF suffix', () => {
    expect(pipe.transform(1000)).toBe('1 000 GNF');
  });

  it('should format large numbers with space separators', () => {
    expect(pipe.transform(1500000)).toBe('1 500 000 GNF');
  });

  it('should return "0 GNF" for null', () => {
    expect(pipe.transform(null)).toBe('0 GNF');
  });

  it('should return "0 GNF" for undefined', () => {
    expect(pipe.transform(undefined)).toBe('0 GNF');
  });

  it('should return "0 GNF" for NaN', () => {
    expect(pipe.transform(NaN)).toBe('0 GNF');
  });

  it('should round decimal values', () => {
    expect(pipe.transform(1234.7)).toBe('1 235 GNF');
  });

  it('should format without suffix when withSuffix is false', () => {
    expect(pipe.transform(5000, false)).toBe('5 000');
  });

  it('should return "0" without suffix for null', () => {
    expect(pipe.transform(null, false)).toBe('0');
  });

  it('should handle zero', () => {
    expect(pipe.transform(0)).toBe('0 GNF');
  });

  it('should handle small numbers without separator', () => {
    expect(pipe.transform(500)).toBe('500 GNF');
  });
});
