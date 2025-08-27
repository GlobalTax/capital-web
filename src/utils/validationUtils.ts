import { sanitizeText, sanitizeEmail, sanitizePhone, sanitizeCompanyName, sanitizePerson, detectXSSAttempt, logSecurityEvent } from './sanitization';

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
  sanitizedValue?: string;
}

// Email validation function with sanitization
export const validateEmail = (email: any): ValidationResult => {
  // Convertir a string si no lo es
  const emailStr = String(email || '');
  
  // Detectar intentos de XSS
  if (detectXSSAttempt(emailStr)) {
    logSecurityEvent('XSS_ATTEMPT', { input: emailStr, context: 'email_validation' });
    return {
      isValid: false,
      message: 'El email contiene caracteres no válidos'
    };
  }

  const sanitizedEmail = sanitizeEmail(emailStr);
  const isValid = validationUtils.isValidEmail(sanitizedEmail);
  
  if (sanitizedEmail !== emailStr) {
    logSecurityEvent('SANITIZATION_APPLIED', { 
      input: emailStr, 
      sanitized: sanitizedEmail, 
      context: 'email_validation' 
    });
  }

  return {
    isValid,
    message: isValid ? undefined : 'El email no es válido',
    sanitizedValue: sanitizedEmail
  };
};

// Company name validation function with sanitization
export const validateCompanyName = (name: any): ValidationResult => {
  // Convertir a string si no lo es
  const nameStr = String(name || '');
  
  // Detectar intentos de XSS
  if (detectXSSAttempt(nameStr)) {
    logSecurityEvent('XSS_ATTEMPT', { input: nameStr, context: 'company_name_validation' });
    return {
      isValid: false,
      message: 'El nombre de la empresa contiene caracteres no válidos'
    };
  }

  const sanitizedName = sanitizeCompanyName(nameStr);
  const isValid = validationUtils.isValidCompanyName(sanitizedName);
  
  if (sanitizedName !== nameStr) {
    logSecurityEvent('SANITIZATION_APPLIED', { 
      input: nameStr, 
      sanitized: sanitizedName, 
      context: 'company_name_validation' 
    });
  }

  return {
    isValid,
    message: isValid ? undefined : 'El nombre de la empresa debe tener entre 2 y 100 caracteres',
    sanitizedValue: sanitizedName
  };
};

// Contact name validation function with sanitization
export const validateContactName = (name: any): ValidationResult => {
  // Convertir a string si no lo es
  const nameStr = String(name || '');
  
  // Detectar intentos de XSS
  if (detectXSSAttempt(nameStr)) {
    logSecurityEvent('XSS_ATTEMPT', { input: nameStr, context: 'contact_name_validation' });
    return {
      isValid: false,
      message: 'El nombre contiene caracteres no válidos'
    };
  }

  const sanitizedName = sanitizePerson(nameStr);
  const isValid = validationUtils.isRequired(sanitizedName);
  
  if (sanitizedName !== nameStr) {
    logSecurityEvent('SANITIZATION_APPLIED', { 
      input: nameStr, 
      sanitized: sanitizedName, 
      context: 'contact_name_validation' 
    });
  }

  return {
    isValid,
    message: isValid ? undefined : 'El nombre de contacto es obligatorio',
    sanitizedValue: sanitizedName
  };
};

// Spanish phone validation function with sanitization
export const validateSpanishPhone = (phone: any): ValidationResult => {
  // Convertir a string si no lo es
  const phoneStr = String(phone || '');
  
  // Detectar intentos de XSS
  if (detectXSSAttempt(phoneStr)) {
    logSecurityEvent('XSS_ATTEMPT', { input: phoneStr, context: 'phone_validation' });
    return {
      isValid: false,
      message: 'El teléfono contiene caracteres no válidos'
    };
  }

  const sanitizedPhone = sanitizePhone(phoneStr);
  const isValid = validationUtils.isValidPhone(sanitizedPhone);
  
  if (sanitizedPhone !== phoneStr) {
    logSecurityEvent('SANITIZATION_APPLIED', { 
      input: phoneStr, 
      sanitized: sanitizedPhone, 
      context: 'phone_validation' 
    });
  }

  return {
    isValid,
    message: isValid ? undefined : 'El teléfono debe ser un número español válido (9 dígitos empezando por 6, 7, 8 o 9)',
    sanitizedValue: sanitizedPhone
  };
};

// Spanish phone formatter function with sanitization
export const formatSpanishPhone = (phone: string): string => {
  // Primero sanitizar
  const sanitizedPhone = sanitizePhone(phone);
  
  // Remove all non-digit characters
  const digits = sanitizedPhone.replace(/\D/g, '');
  
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

// Nueva función para sanitizar cualquier campo de texto
export const sanitizeAndValidateText = (
  text: string, 
  context: string = 'generic'
): ValidationResult => {
  // Detectar intentos de XSS
  if (detectXSSAttempt(text)) {
    logSecurityEvent('XSS_ATTEMPT', { input: text, context });
    return {
      isValid: false,
      message: 'El campo contiene caracteres no válidos'
    };
  }

  const sanitizedText = sanitizeText(text, 'STRICT');
  
  if (sanitizedText !== text) {
    logSecurityEvent('SANITIZATION_APPLIED', { 
      input: text, 
      sanitized: sanitizedText, 
      context 
    });
  }

  return {
    isValid: true,
    sanitizedValue: sanitizedText
  };
};
