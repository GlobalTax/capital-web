import { describe, it, expect } from 'vitest';
import { contactFormSchema, operationContactFormSchema, validateRequiredFields, getFieldErrors } from '../contactFormSchema';
import { z } from 'zod';

const validData = {
  fullName: 'Juan García',
  company: 'Empresa SL',
  email: 'juan@empresa.com',
  serviceType: 'vender' as const,
  website: '',
};

describe('contactFormSchema', () => {
  it('accepts valid data', () => {
    const result = contactFormSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('requires fullName', () => {
    const result = contactFormSchema.safeParse({ ...validData, fullName: '' });
    expect(result.success).toBe(false);
  });

  it('requires company', () => {
    const result = contactFormSchema.safeParse({ ...validData, company: '' });
    expect(result.success).toBe(false);
  });

  it('requires valid email', () => {
    const result = contactFormSchema.safeParse({ ...validData, email: 'invalid' });
    expect(result.success).toBe(false);
  });

  it('normalizes email to lowercase', () => {
    const result = contactFormSchema.safeParse({ ...validData, email: 'Juan@EMPRESA.com' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe('juan@empresa.com');
    }
  });

  it('requires serviceType', () => {
    const result = contactFormSchema.safeParse({ ...validData, serviceType: undefined });
    expect(result.success).toBe(false);
  });

  it('rejects invalid serviceType', () => {
    const result = contactFormSchema.safeParse({ ...validData, serviceType: 'invalid' });
    expect(result.success).toBe(false);
  });

  it('accepts valid Spanish phone +34695717490', () => {
    const result = contactFormSchema.safeParse({ ...validData, phone: '+34695717490' });
    expect(result.success).toBe(true);
  });

  it('accepts phone with spaces', () => {
    const result = contactFormSchema.safeParse({ ...validData, phone: '+34 695 717 490' });
    expect(result.success).toBe(true);
  });

  it('rejects invalid phone', () => {
    const result = contactFormSchema.safeParse({ ...validData, phone: '12345' });
    expect(result.success).toBe(false);
  });

  it('honeypot: rejects non-empty website', () => {
    const result = contactFormSchema.safeParse({ ...validData, website: 'spam.com' });
    expect(result.success).toBe(false);
  });

  it('accepts optional fields as undefined', () => {
    const result = contactFormSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });
});

describe('operationContactFormSchema', () => {
  it('requires operationId as UUID', () => {
    const result = operationContactFormSchema.safeParse({
      ...validData,
      operationId: 'not-a-uuid',
      companyName: 'Test Corp',
    });
    expect(result.success).toBe(false);
  });

  it('accepts valid UUID operationId', () => {
    const result = operationContactFormSchema.safeParse({
      ...validData,
      operationId: '550e8400-e29b-41d4-a716-446655440000',
      companyName: 'Test Corp',
    });
    expect(result.success).toBe(true);
  });
});

describe('validateRequiredFields', () => {
  it('returns true when all required fields present', () => {
    expect(validateRequiredFields(validData)).toBe(true);
  });

  it('returns false when email missing', () => {
    expect(validateRequiredFields({ ...validData, email: '' })).toBe(false);
  });
});

describe('getFieldErrors', () => {
  it('extracts field errors from ZodError', () => {
    const result = contactFormSchema.safeParse({ fullName: '', company: '', email: 'bad', serviceType: 'vender', website: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = getFieldErrors(result.error);
      expect(errors.fullName).toBeDefined();
    }
  });
});
