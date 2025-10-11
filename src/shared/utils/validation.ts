// ============= VALIDATION UTILITIES =============
// Utilidades para validación de datos

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate Spanish phone number
 */
export const isValidPhone = (phone: string): boolean => {
  // Spanish phone: +34 XXX XXX XXX or 9 digits
  const phoneRegex = /^(\+34)?[6-9]\d{8}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

/**
 * Validate URL format
 */
export const isValidURL = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validate Spanish NIF/CIF
 */
export const isValidNIF = (nif: string): boolean => {
  const nifRegex = /^[0-9]{8}[A-Z]$/;
  return nifRegex.test(nif.toUpperCase());
};

/**
 * Validate Spanish postal code
 */
export const isValidPostalCode = (postalCode: string): boolean => {
  const postalCodeRegex = /^[0-5]\d{4}$/;
  return postalCodeRegex.test(postalCode);
};

/**
 * Sanitize input string (remove HTML tags)
 */
export const sanitizeInput = (input: string): string => {
  return input.replace(/<[^>]*>/g, '');
};

/**
 * Validate password strength
 * Returns: { valid: boolean, score: number, feedback: string[] }
 */
export const validatePasswordStrength = (password: string): {
  valid: boolean;
  score: number;
  feedback: string[];
} => {
  const feedback: string[] = [];
  let score = 0;
  
  if (password.length >= 8) score++;
  else feedback.push('Mínimo 8 caracteres');
  
  if (/[a-z]/.test(password)) score++;
  else feedback.push('Al menos una minúscula');
  
  if (/[A-Z]/.test(password)) score++;
  else feedback.push('Al menos una mayúscula');
  
  if (/\d/.test(password)) score++;
  else feedback.push('Al menos un número');
  
  if (/[@$!%*?&#]/.test(password)) score++;
  else feedback.push('Al menos un carácter especial');
  
  return {
    valid: score >= 4,
    score,
    feedback
  };
};

/**
 * Validate IBAN format
 */
export const isValidIBAN = (iban: string): boolean => {
  const ibanRegex = /^ES\d{22}$/;
  return ibanRegex.test(iban.replace(/\s/g, ''));
};

/**
 * Check if string is empty or whitespace
 */
export const isEmpty = (value: string | null | undefined): boolean => {
  return !value || value.trim().length === 0;
};

/**
 * Check if value is numeric
 */
export const isNumeric = (value: string): boolean => {
  return !isNaN(parseFloat(value)) && isFinite(Number(value));
};
