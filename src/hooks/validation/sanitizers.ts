
import { SecurityConfig } from './types';
import { sanitizeText, detectXSSAttempt, logSecurityEvent } from '@/utils/sanitization';

export const sanitizeInput = (input: string, config: SecurityConfig = {}): string => {
  if (!input || typeof input !== 'string') return '';
  
  // Detectar intentos de XSS antes de procesar
  if (detectXSSAttempt(input)) {
    logSecurityEvent('XSS_ATTEMPT', { input, context: 'input_sanitization' });
    // Para compatibilidad con el código existente, continuamos con la sanitización
  }
  
  let sanitized = input.trim();
  
  // Usar DOMPurify como sanitizador principal
  if (!config.allowHTML) {
    sanitized = sanitizeText(sanitized, 'STRICT');
  } else {
    // Si se permite HTML, usar perfil moderado
    sanitized = sanitizeText(sanitized, 'MODERATE');
  }
  
  // Limitar longitud
  if (config.maxLength) {
    sanitized = sanitized.substring(0, config.maxLength);
  }
  
  // Log si se aplicó sanitización
  if (sanitized !== input.trim()) {
    logSecurityEvent('SANITIZATION_APPLIED', { 
      input, 
      sanitized, 
      context: 'input_sanitization' 
    });
  }
  
  return sanitized;
};
