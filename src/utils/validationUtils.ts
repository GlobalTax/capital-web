
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

// Individual validation functions that return ValidationResult interface
interface ValidationResult {
  isValid: boolean;
  message?: string;
}

// Email validation function
export const validateEmail = (email: string): ValidationResult => {
  const isValid = validationUtils.isValidEmail(email);
  return {
    isValid,
    message: isValid ? undefined : 'El email no es válido'
  };
};

// Company name validation function
export const validateCompanyName = (name: string): ValidationResult => {
  const isValid = validationUtils.isValidCompanyName(name);
  return {
    isValid,
    message: isValid ? undefined : 'El nombre de la empresa debe tener entre 2 y 100 caracteres'
  };
};

// Contact name validation function
export const validateContactName = (name: string): ValidationResult => {
  const isValid = validationUtils.isRequired(name);
  return {
    isValid,
    message: isValid ? undefined : 'El nombre de contacto es obligatorio'
  };
};

// Spanish phone validation function
export const validateSpanishPhone = (phone: string): ValidationResult => {
  const isValid = validationUtils.isValidPhone(phone);
  return {
    isValid,
    message: isValid ? undefined : 'El teléfono debe ser un número español válido (9 dígitos empezando por 6, 7, 8 o 9)'
  };
};

// Spanish phone formatter function
export const formatSpanishPhone = (phone: string): string => {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // If it starts with +34, remove it
  const cleanDigits = digits.startsWith('34') ? digits.slice(2) : digits;
  
  // Format as XXX XXX XXX
  if (cleanDigits.length >= 9) {
    return cleanDigits.slice(0, 9).replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');
  }
  
  // Return partial formatting for incomplete numbers
  if (cleanDigits.length >= 6) {
    return cleanDigits.replace(/(\d{3})(\d{3})(\d*)/, '$1 $2 $3').trim();
  }
  
  if (cleanDigits.length >= 3) {
    return cleanDigits.replace(/(\d{3})(\d*)/, '$1 $2').trim();
  }
  
  return cleanDigits;
};
