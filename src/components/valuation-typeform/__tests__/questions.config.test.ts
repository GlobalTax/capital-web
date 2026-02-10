import { describe, it, expect } from 'vitest';
import { TYPEFORM_STEPS, interpolateText } from '../questions.config';

describe('TYPEFORM_STEPS config', () => {
  it('has at least 1 step', () => {
    expect(TYPEFORM_STEPS.length).toBeGreaterThanOrEqual(1);
  });

  it('every step has at least 1 field', () => {
    TYPEFORM_STEPS.forEach((step) => {
      expect(step.fields.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('all step IDs are unique', () => {
    const ids = TYPEFORM_STEPS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every step has a title', () => {
    TYPEFORM_STEPS.forEach((step) => {
      expect(step.title).toBeTruthy();
    });
  });

  it('required fields are marked', () => {
    const requiredFields = TYPEFORM_STEPS.flatMap((s) =>
      s.fields.filter((f) => f.required)
    );
    expect(requiredFields.length).toBeGreaterThan(0);
  });

  it('select fields have options', () => {
    const selectFields = TYPEFORM_STEPS.flatMap((s) =>
      s.fields.filter((f) => f.type === 'select')
    );
    selectFields.forEach((field) => {
      expect(field.options).toBeDefined();
      expect(field.options!.length).toBeGreaterThan(0);
    });
  });

  it('field names are valid ExtendedCompanyData keys', () => {
    const validKeys = [
      'contactName', 'companyName', 'email', 'phone', 'phone_e164',
      'industry', 'cif', 'revenue', 'ebitda', 'whatsapp_opt_in',
      'activityDescription', 'employeeRange', 'location',
      'ownershipParticipation', 'competitiveAdvantage',
      'hasAdjustments', 'adjustmentAmount', 'baseValuation',
      'yearsOfOperation', 'growthRate', 'netProfitMargin',
    ];
    TYPEFORM_STEPS.forEach((step) => {
      step.fields.forEach((field) => {
        expect(validKeys).toContain(field.field);
      });
    });
  });
});

describe('interpolateText', () => {
  it('replaces placeholders with data values', () => {
    const result = interpolateText('Hola {name}, tu empresa es {company}', {
      name: 'María',
      company: 'TechSL',
    });
    expect(result).toBe('Hola María, tu empresa es TechSL');
  });

  it('keeps key name if value is missing', () => {
    const result = interpolateText('Hola {name}', {});
    expect(result).toBe('Hola name');
  });

  it('returns text unchanged without placeholders', () => {
    const result = interpolateText('Sin variables', { name: 'test' });
    expect(result).toBe('Sin variables');
  });
});
