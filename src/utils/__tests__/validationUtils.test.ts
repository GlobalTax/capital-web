
import { validationUtils } from '../validationUtils';

describe('validationUtils', () => {
  describe('isValidEmail', () => {
    it('validates correct email formats', () => {
      expect(validationUtils.isValidEmail('test@example.com')).toBe(true);
      expect(validationUtils.isValidEmail('user.name@domain.co.uk')).toBe(true);
      expect(validationUtils.isValidEmail('admin@capittal.es')).toBe(true);
    });

    it('rejects invalid email formats', () => {
      expect(validationUtils.isValidEmail('invalid.email')).toBe(false);
      expect(validationUtils.isValidEmail('@domain.com')).toBe(false);
      expect(validationUtils.isValidEmail('user@')).toBe(false);
      expect(validationUtils.isValidEmail('')).toBe(false);
    });
  });

  describe('isValidPhone', () => {
    it('validates Spanish phone numbers', () => {
      expect(validationUtils.isValidPhone('612345678')).toBe(true);
      expect(validationUtils.isValidPhone('722334455')).toBe(true);
      expect(validationUtils.isValidPhone('856789012')).toBe(true);
      expect(validationUtils.isValidPhone('987654321')).toBe(true);
    });

    it('validates phone numbers with formatting', () => {
      expect(validationUtils.isValidPhone('612 345 678')).toBe(true);
      expect(validationUtils.isValidPhone('722-334-455')).toBe(true);
      expect(validationUtils.isValidPhone('(856) 789-012')).toBe(true);
    });

    it('rejects invalid phone numbers', () => {
      expect(validationUtils.isValidPhone('512345678')).toBe(false); // starts with 5
      expect(validationUtils.isValidPhone('12345678')).toBe(false); // too short
      expect(validationUtils.isValidPhone('6123456789')).toBe(false); // too long
      expect(validationUtils.isValidPhone('')).toBe(false);
    });
  });

  describe('isValidCompanyName', () => {
    it('validates proper company names', () => {
      expect(validationUtils.isValidCompanyName('Capittal')).toBe(true);
      expect(validationUtils.isValidCompanyName('Tech Solutions S.L.')).toBe(true);
      expect(validationUtils.isValidCompanyName('AB')).toBe(true); // minimum length
    });

    it('rejects invalid company names', () => {
      expect(validationUtils.isValidCompanyName('A')).toBe(false); // too short
      expect(validationUtils.isValidCompanyName('')).toBe(false);
      expect(validationUtils.isValidCompanyName('   ')).toBe(false); // only spaces
      expect(validationUtils.isValidCompanyName('A'.repeat(101))).toBe(false); // too long
    });
  });

  describe('isRequired', () => {
    it('validates required fields', () => {
      expect(validationUtils.isRequired('some value')).toBe(true);
      expect(validationUtils.isRequired('a')).toBe(true);
    });

    it('rejects empty required fields', () => {
      expect(validationUtils.isRequired('')).toBe(false);
      expect(validationUtils.isRequired('   ')).toBe(false);
      expect(validationUtils.isRequired('\t\n')).toBe(false);
    });
  });

  describe('isValidNumber', () => {
    it('validates numbers without constraints', () => {
      expect(validationUtils.isValidNumber('123')).toBe(true);
      expect(validationUtils.isValidNumber('0')).toBe(true);
      expect(validationUtils.isValidNumber('-45')).toBe(true);
      expect(validationUtils.isValidNumber('3.14')).toBe(true);
    });

    it('validates numbers with min constraint', () => {
      expect(validationUtils.isValidNumber('10', 5)).toBe(true);
      expect(validationUtils.isValidNumber('5', 5)).toBe(true);
      expect(validationUtils.isValidNumber('3', 5)).toBe(false);
    });

    it('validates numbers with max constraint', () => {
      expect(validationUtils.isValidNumber('8', undefined, 10)).toBe(true);
      expect(validationUtils.isValidNumber('10', undefined, 10)).toBe(true);
      expect(validationUtils.isValidNumber('12', undefined, 10)).toBe(false);
    });

    it('rejects non-numeric values', () => {
      expect(validationUtils.isValidNumber('abc')).toBe(false);
      expect(validationUtils.isValidNumber('')).toBe(false);
      expect(validationUtils.isValidNumber('12abc')).toBe(false);
    });
  });

  describe('isValidUrl', () => {
    it('validates proper URLs', () => {
      expect(validationUtils.isValidUrl('https://www.capittal.es')).toBe(true);
      expect(validationUtils.isValidUrl('http://example.com')).toBe(true);
      expect(validationUtils.isValidUrl('https://subdomain.example.co.uk/path')).toBe(true);
    });

    it('rejects invalid URLs', () => {
      expect(validationUtils.isValidUrl('not-a-url')).toBe(false);
      expect(validationUtils.isValidUrl('www.example.com')).toBe(false); // missing protocol
      expect(validationUtils.isValidUrl('')).toBe(false);
    });
  });

  describe('isValidYear', () => {
    it('validates reasonable business years', () => {
      const currentYear = new Date().getFullYear();
      expect(validationUtils.isValidYear(2024)).toBe(true);
      expect(validationUtils.isValidYear(2000)).toBe(true);
      expect(validationUtils.isValidYear(1950)).toBe(true);
      expect(validationUtils.isValidYear(currentYear + 2)).toBe(true);
    });

    it('rejects unreasonable years', () => {
      const currentYear = new Date().getFullYear();
      expect(validationUtils.isValidYear(1800)).toBe(false); // too old
      expect(validationUtils.isValidYear(currentYear + 10)).toBe(false); // too far in future
    });
  });

  describe('isValidSector', () => {
    it('validates known sectors', () => {
      expect(validationUtils.isValidSector('Tecnología')).toBe(true);
      expect(validationUtils.isValidSector('Industrial')).toBe(true);
      expect(validationUtils.isValidSector('Servicios')).toBe(true);
      expect(validationUtils.isValidSector('Healthcare')).toBe(true);
    });

    it('rejects unknown sectors', () => {
      expect(validationUtils.isValidSector('Unknown Sector')).toBe(false);
      expect(validationUtils.isValidSector('')).toBe(false);
      expect(validationUtils.isValidSector('tecnología')).toBe(false); // case sensitive
    });
  });
});
