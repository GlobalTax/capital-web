
// Validation utilities for forms and data
export const validationUtils = {
  // Email validation
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Phone validation (Spanish format)
  isValidPhone: (phone: string): boolean => {
    // Remove spaces, dashes, and parentheses
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    // Spanish phone format: 9 digits starting with 6, 7, 8, or 9
    const phoneRegex = /^[6789]\d{8}$/;
    return phoneRegex.test(cleanPhone);
  },

  // Company name validation
  isValidCompanyName: (name: string): boolean => {
    return name.trim().length >= 2 && name.trim().length <= 100;
  },

  // Required field validation
  isRequired: (value: string): boolean => {
    return value.trim().length > 0;
  },

  // Number validation with min/max
  isValidNumber: (value: string, min?: number, max?: number): boolean => {
    const num = parseFloat(value);
    if (isNaN(num)) return false;
    if (min !== undefined && num < min) return false;
    if (max !== undefined && num > max) return false;
    return true;
  },

  // URL validation
  isValidUrl: (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  // Year validation (reasonable business years)
  isValidYear: (year: number): boolean => {
    const currentYear = new Date().getFullYear();
    return year >= 1900 && year <= currentYear + 5;
  },

  // Sector validation (from available options)
  isValidSector: (sector: string): boolean => {
    const validSectors = [
      'Tecnología',
      'Industrial',
      'Servicios',
      'Retail',
      'Healthcare',
      'Financiero',
      'Energía',
      'Inmobiliario',
      'Otro'
    ];
    return validSectors.includes(sector);
  }
};
