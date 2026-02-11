import { describe, it, expect } from 'vitest';
import { campaignValuationSchema } from '../campaignValuationSchema';

const valid = {
  email: 'test@empresa.com',
  cif: 'B12345678',
  revenue: 1000000,
  ebitda: 200000,
  website: '',
};

describe('campaignValuationSchema', () => {
  it('accepts valid data', () => {
    expect(campaignValuationSchema.safeParse(valid).success).toBe(true);
  });

  it('requires email', () => {
    expect(campaignValuationSchema.safeParse({ ...valid, email: '' }).success).toBe(false);
  });

  it('rejects invalid email', () => {
    expect(campaignValuationSchema.safeParse({ ...valid, email: 'bad' }).success).toBe(false);
  });

  it('requires CIF', () => {
    expect(campaignValuationSchema.safeParse({ ...valid, cif: '' }).success).toBe(false);
  });

  it('validates CIF format (letter + 7 digits + alphanumeric)', () => {
    expect(campaignValuationSchema.safeParse({ ...valid, cif: 'B12345678' }).success).toBe(true);
    expect(campaignValuationSchema.safeParse({ ...valid, cif: 'A1234567B' }).success).toBe(true);
    expect(campaignValuationSchema.safeParse({ ...valid, cif: '12345678B' }).success).toBe(false);
    expect(campaignValuationSchema.safeParse({ ...valid, cif: 'b12345678' }).success).toBe(false); // lowercase
  });

  it('requires positive revenue', () => {
    expect(campaignValuationSchema.safeParse({ ...valid, revenue: -100 }).success).toBe(false);
    expect(campaignValuationSchema.safeParse({ ...valid, revenue: 0 }).success).toBe(false);
  });

  it('requires ebitda', () => {
    expect(campaignValuationSchema.safeParse({ ...valid, ebitda: undefined }).success).toBe(false);
  });

  it('honeypot: rejects non-empty website', () => {
    expect(campaignValuationSchema.safeParse({ ...valid, website: 'spam' }).success).toBe(false);
  });

  it('phone is optional', () => {
    expect(campaignValuationSchema.safeParse(valid).success).toBe(true);
    expect(campaignValuationSchema.safeParse({ ...valid, phone: '+34695717490' }).success).toBe(true);
  });

  it('rejects invalid phone format', () => {
    expect(campaignValuationSchema.safeParse({ ...valid, phone: 'abc' }).success).toBe(false);
  });
});
