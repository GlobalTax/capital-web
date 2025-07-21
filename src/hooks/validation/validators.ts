
import { ValidationResult, SecurityConfig } from './types';
import { sanitizeInput } from './sanitizers';

export const validateEmail = (email: string): ValidationResult => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const sanitizedEmail = sanitizeInput(email, { maxLength: 254 });
  
  if (!emailRegex.test(sanitizedEmail)) {
    return { isValid: false, message: 'Email inválido' };
  }
  
  return { isValid: true, sanitizedValue: sanitizedEmail };
};

export const validateURL = (url: string, config: SecurityConfig = {}): ValidationResult => {
  try {
    const urlObj = new URL(url);
    
    if (config.requireHttps && urlObj.protocol !== 'https:') {
      return { isValid: false, message: 'Se requiere HTTPS' };
    }
    
    if (config.allowedDomains && !config.allowedDomains.includes(urlObj.hostname)) {
      return { isValid: false, message: 'Dominio no permitido' };
    }
    
    return { isValid: true, sanitizedValue: url };
  } catch {
    return { isValid: false, message: 'URL inválida' };
  }
};

export const validateRequired = (value: any): ValidationResult => {
  if (value === null || value === undefined || value === '') {
    return { isValid: false, message: 'Campo requerido' };
  }
  return { isValid: true };
};

export const validateNumber = (value: any): ValidationResult => {
  const num = Number(value);
  if (isNaN(num)) {
    return { isValid: false, message: 'Debe ser un número válido' };
  }
  return { isValid: true, sanitizedValue: num };
};

export const validateText = (value: string, config: SecurityConfig): ValidationResult => {
  return { 
    isValid: true, 
    sanitizedValue: sanitizeInput(value, config) 
  };
};
