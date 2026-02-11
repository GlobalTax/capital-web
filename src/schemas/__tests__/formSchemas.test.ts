import { describe, it, expect } from 'vitest';
import {
  newsletterSchema,
  ventaEmpresasSchema,
  compraEmpresasSchema,
  collaboratorSchema,
  professionalValuationSchema,
} from '../formSchemas';

describe('newsletterSchema', () => {
  it('accepts valid email', () => {
    expect(newsletterSchema.safeParse({ email: 'test@test.com' }).success).toBe(true);
  });

  it('rejects empty email', () => {
    expect(newsletterSchema.safeParse({ email: '' }).success).toBe(false);
  });

  it('rejects invalid email', () => {
    expect(newsletterSchema.safeParse({ email: 'not-email' }).success).toBe(false);
  });
});

describe('ventaEmpresasSchema', () => {
  const valid = {
    name: 'Juan García',
    email: 'juan@test.com',
    phone: '695717490',
    company: 'Empresa SL',
    revenue: '2.500.000',
    urgency: 'alta',
  };

  it('accepts valid data', () => {
    expect(ventaEmpresasSchema.safeParse(valid).success).toBe(true);
  });

  it('requires name', () => {
    expect(ventaEmpresasSchema.safeParse({ ...valid, name: '' }).success).toBe(false);
  });

  it('requires email', () => {
    expect(ventaEmpresasSchema.safeParse({ ...valid, email: '' }).success).toBe(false);
  });

  it('requires phone (min 9 digits)', () => {
    expect(ventaEmpresasSchema.safeParse({ ...valid, phone: '123' }).success).toBe(false);
  });

  it('requires company', () => {
    expect(ventaEmpresasSchema.safeParse({ ...valid, company: '' }).success).toBe(false);
  });

  it('requires revenue', () => {
    expect(ventaEmpresasSchema.safeParse({ ...valid, revenue: '' }).success).toBe(false);
  });

  it('CIF is optional', () => {
    expect(ventaEmpresasSchema.safeParse({ ...valid, cif: '' }).success).toBe(true);
    expect(ventaEmpresasSchema.safeParse(valid).success).toBe(true);
  });

  it('accepts EBITDA in Spanish format', () => {
    expect(ventaEmpresasSchema.safeParse({ ...valid, ebitda: '500.000' }).success).toBe(true);
  });

  it('rejects negative EBITDA', () => {
    expect(ventaEmpresasSchema.safeParse({ ...valid, ebitda: '-100' }).success).toBe(false);
  });
});

describe('compraEmpresasSchema', () => {
  const valid = {
    fullName: 'Ana López',
    company: 'Inversiones SA',
    email: 'ana@test.com',
  };

  it('accepts valid data with required fields only', () => {
    expect(compraEmpresasSchema.safeParse(valid).success).toBe(true);
  });

  it('requires fullName', () => {
    expect(compraEmpresasSchema.safeParse({ ...valid, fullName: '' }).success).toBe(false);
  });

  it('phone is optional', () => {
    expect(compraEmpresasSchema.safeParse(valid).success).toBe(true);
  });

  it('accepts all optional fields', () => {
    expect(compraEmpresasSchema.safeParse({
      ...valid,
      phone: '695717490',
      investmentBudget: '1m-5m',
      sectorsOfInterest: 'tech',
      targetTimeline: '6 meses',
      message: 'Test message',
    }).success).toBe(true);
  });
});

describe('collaboratorSchema', () => {
  const valid = {
    fullName: 'Carlos Ruiz',
    email: 'carlos@test.com',
    phone: '695717490',
    profession: 'Abogado M&A',
  };

  it('accepts valid data', () => {
    expect(collaboratorSchema.safeParse(valid).success).toBe(true);
  });

  it('requires profession', () => {
    expect(collaboratorSchema.safeParse({ ...valid, profession: '' }).success).toBe(false);
  });

  it('experience is optional', () => {
    expect(collaboratorSchema.safeParse(valid).success).toBe(true);
    expect(collaboratorSchema.safeParse({ ...valid, experience: '10 años' }).success).toBe(true);
  });
});

describe('professionalValuationSchema', () => {
  const valid = {
    name: 'María Sánchez',
    email: 'maria@test.com',
    company: 'Consulting SA',
    revenue_range: '1m-5m',
  };

  it('accepts valid data', () => {
    expect(professionalValuationSchema.safeParse(valid).success).toBe(true);
  });

  it('requires revenue_range', () => {
    expect(professionalValuationSchema.safeParse({ ...valid, revenue_range: '' }).success).toBe(false);
  });

  it('message is optional', () => {
    expect(professionalValuationSchema.safeParse(valid).success).toBe(true);
  });
});
