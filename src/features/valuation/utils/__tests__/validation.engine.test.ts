import { describe, it, expect } from 'vitest';
import {
  validateEmail,
  validatePhone,
  validateCIF,
  validateFinancialData,
  validateCalculatorData,
  validateBusinessLogic,
  isStepComplete,
} from '../validation.engine';
import { ExtendedCompanyData } from '../../types/unified.types';
import { V1_CONFIG, V2_B_CONFIG, MASTER_CONFIG } from '../../configs/calculator.configs';

// Helper: base company data
const baseData: ExtendedCompanyData = {
  contactName: 'María García',
  companyName: 'Tech SL',
  email: 'maria@tech.com',
  phone: '+34600000000',
  phone_e164: '+34600000000',
  industry: 'Tecnología',
  cif: 'B12345674',
  revenue: 1000000,
  ebitda: 200000,
  whatsapp_opt_in: false,
  activityDescription: 'Desarrollo de software para retail',
  employeeRange: '11-50',
  location: 'Madrid',
  ownershipParticipation: 'alta',
  competitiveAdvantage: 'Patentes propias',
  hasAdjustments: false,
  adjustmentAmount: 0,
  baseValuation: 0,
};

// ============= EMAIL VALIDATION =============
describe('validateEmail', () => {
  it('accepts valid emails', () => {
    expect(validateEmail('user@example.com')).toBe(true);
    expect(validateEmail('name.surname@company.co.uk')).toBe(true);
    expect(validateEmail('test+tag@gmail.com')).toBe(true);
  });

  it('rejects invalid emails', () => {
    expect(validateEmail('')).toBe(false);
    expect(validateEmail('noat')).toBe(false);
    expect(validateEmail('@nodomain')).toBe(false);
    expect(validateEmail('user@')).toBe(false);
    expect(validateEmail('user@.com')).toBe(false);
  });
});

// ============= PHONE VALIDATION =============
describe('validatePhone', () => {
  it('accepts valid phones', () => {
    expect(validatePhone('+34 600 000 000')).toBe(true);
    expect(validatePhone('612345678')).toBe(true);
    expect(validatePhone('+1 (555) 123-4567')).toBe(true);
  });

  it('accepts empty phone (optional)', () => {
    expect(validatePhone('')).toBe(true);
  });

  it('rejects invalid phones', () => {
    expect(validatePhone('abc')).toBe(false);
    expect(validatePhone('phone!')).toBe(false);
  });
});

// ============= CIF VALIDATION =============
describe('validateCIF', () => {
  it('accepts valid CIFs', () => {
    expect(validateCIF('B12345674')).toBe(true);
    expect(validateCIF('A00000000')).toBe(true);
  });

  it('accepts empty CIF (optional)', () => {
    expect(validateCIF('')).toBe(true);
  });

  it('rejects invalid CIFs', () => {
    expect(validateCIF('12345678')).toBe(false);
    expect(validateCIF('Z12345674')).toBe(false);
    expect(validateCIF('B1234')).toBe(false);
  });
});

// ============= FINANCIAL DATA VALIDATION =============
describe('validateFinancialData', () => {
  it('accepts valid revenue and ebitda', () => {
    const result = validateFinancialData(1000000, 200000);
    expect(result.isValid).toBe(true);
  });

  it('rejects zero revenue', () => {
    const result = validateFinancialData(0, 100000);
    expect(result.isValid).toBe(false);
  });

  it('rejects negative ebitda', () => {
    const result = validateFinancialData(500000, -10000);
    expect(result.isValid).toBe(false);
  });

  it('rejects ebitda greater than revenue', () => {
    const result = validateFinancialData(100000, 200000);
    expect(result.isValid).toBe(false);
    expect(result.message).toContain('EBITDA');
  });
});

// ============= STEP VALIDATION (V1/MASTER) =============
describe('validateCalculatorData - V1/Master', () => {
  it('step 1 valid with all contact fields', () => {
    const result = validateCalculatorData(baseData, 1, V1_CONFIG);
    expect(result.isValid).toBe(true);
    expect(Object.keys(result.errors)).toHaveLength(0);
  });

  it('step 1 invalid without contactName', () => {
    const data = { ...baseData, contactName: '' };
    const result = validateCalculatorData(data, 1, V1_CONFIG);
    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveProperty('contactName');
  });

  it('step 2 valid with financial data', () => {
    const result = validateCalculatorData(baseData, 2, V1_CONFIG);
    expect(result.isValid).toBe(true);
  });

  it('step 2 invalid with zero revenue', () => {
    const data = { ...baseData, revenue: 0 };
    const result = validateCalculatorData(data, 2, V1_CONFIG);
    expect(result.isValid).toBe(false);
    expect(result.errors).toHaveProperty('revenue');
  });

  it('step 3 validates characteristics (location optional)', () => {
    const result = validateCalculatorData(baseData, 3, V1_CONFIG);
    expect(result.isValid).toBe(true);
  });
});

// ============= OPTIONAL FIELDS (V2_B_CONFIG) =============
describe('validateCalculatorData - optionalFields override', () => {
  it('phone with value passes in V2_B_CONFIG', () => {
    // When phone has a valid value, it should pass even though it's optional
    const data = { ...baseData, phone: '+34600000000' };
    const result = validateCalculatorData(data, 1, V2_B_CONFIG);
    expect(result.errors).not.toHaveProperty('phone');
  });

  it('ebitda is optional in V2_B_CONFIG', () => {
    const data = { ...baseData, ebitda: 0 };
    const result = validateCalculatorData(data, 1, V2_B_CONFIG);
    expect(result.errors).not.toHaveProperty('ebitda');
  });
});

// ============= BUSINESS LOGIC =============
describe('validateBusinessLogic', () => {
  it('warns on very high EBITDA margin', () => {
    const data = { ...baseData, revenue: 100000, ebitda: 80000 };
    const result = validateBusinessLogic(data);
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings[0]).toContain('margen EBITDA');
  });

  it('warns on very low EBITDA margin', () => {
    const data = { ...baseData, revenue: 1000000, ebitda: 10000 };
    const result = validateBusinessLogic(data);
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it('no warnings for normal margin', () => {
    const data = { ...baseData, revenue: 1000000, ebitda: 200000 };
    const result = validateBusinessLogic(data);
    expect(result.isValid).toBe(true);
  });
});

// ============= isStepComplete =============
describe('isStepComplete', () => {
  it('returns true for complete step 1', () => {
    expect(isStepComplete(1, baseData, V1_CONFIG)).toBe(true);
  });

  it('returns false for incomplete step 1', () => {
    const data = { ...baseData, email: '' };
    expect(isStepComplete(1, data, V1_CONFIG)).toBe(false);
  });
});
