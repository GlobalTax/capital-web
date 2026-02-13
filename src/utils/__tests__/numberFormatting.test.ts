import { describe, it, expect } from 'vitest';
import { formatNumberWithDots, parseNumberWithDots } from '../numberFormatting';

describe('formatNumberWithDots', () => {
  it('formats 1000000 with dots', () => {
    const result = formatNumberWithDots(1000000);
    // es-ES locale uses dots for thousands
    expect(result).toBe('1.000.000');
  });

  it('formats small number without dots', () => {
    expect(formatNumberWithDots(999)).toBe('999');
  });

  it('handles 0', () => {
    expect(formatNumberWithDots(0)).toBe('0');
  });

  it('handles string input', () => {
    expect(formatNumberWithDots('500000')).toBe('500.000');
  });

  it('returns empty string for empty input', () => {
    expect(formatNumberWithDots('')).toBe('');
  });

  it('strips non-numeric characters from string', () => {
    expect(formatNumberWithDots('1.000.000')).toBe('1.000.000');
  });

  it('returns empty for null-ish non-zero values', () => {
    expect(formatNumberWithDots(undefined as any)).toBe('');
    expect(formatNumberWithDots(null as any)).toBe('');
  });
});

describe('parseNumberWithDots', () => {
  it('parses "1.000.000" to 1000000', () => {
    expect(parseNumberWithDots('1.000.000')).toBe(1000000);
  });

  it('parses plain number string', () => {
    expect(parseNumberWithDots('500000')).toBe(500000);
  });

  it('returns 0 for empty string', () => {
    expect(parseNumberWithDots('')).toBe(0);
  });

  it('returns 0 for non-numeric string', () => {
    expect(parseNumberWithDots('abc')).toBe(0);
  });

  it('parses "999" correctly', () => {
    expect(parseNumberWithDots('999')).toBe(999);
  });
});
