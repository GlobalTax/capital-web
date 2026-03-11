/**
 * Shared financial range filter constants and helpers for campaign steps.
 */

export const FINANCIAL_RANGES = [
  { value: '0-100000', label: '< 100K€', min: 0, max: 100000 },
  { value: '100000-500000', label: '100K€ - 500K€', min: 100000, max: 500000 },
  { value: '500000-1000000', label: '500K€ - 1M€', min: 500000, max: 1000000 },
  { value: '1000000-2000000', label: '1M€ - 2M€', min: 1000000, max: 2000000 },
  { value: '2000000-5000000', label: '2M€ - 5M€', min: 2000000, max: 5000000 },
  { value: '5000000-10000000', label: '5M€ - 10M€', min: 5000000, max: 10000000 },
  { value: '10000000-Infinity', label: '> 10M€', min: 10000000, max: Infinity },
] as const;

export function parseRangeFilter(value: string | null): { min: number; max: number } | null {
  if (!value) return null;
  const range = FINANCIAL_RANGES.find(r => r.value === value);
  return range ? { min: range.min, max: range.max } : null;
}

export function matchesRange(amount: number | null | undefined, range: { min: number; max: number } | null): boolean {
  if (!range) return true;
  const val = amount || 0;
  return val >= range.min && val < range.max;
}
