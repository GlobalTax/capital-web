
import { SecurityConfig } from './types';

export const sanitizeInput = (input: string, config: SecurityConfig = {}): string => {
  if (!input || typeof input !== 'string') return '';
  
  let sanitized = input.trim();
  
  // Remover HTML si no está permitido
  if (!config.allowHTML) {
    sanitized = sanitized.replace(/<[^>]*>/g, '');
  }
  
  // Limitar longitud
  if (config.maxLength) {
    sanitized = sanitized.substring(0, config.maxLength);
  }
  
  // Escapar caracteres especiales para prevenir XSS
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
  
  return sanitized;
};
