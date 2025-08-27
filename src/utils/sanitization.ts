
import DOMPurify from 'dompurify';

// Configuraciones de sanitización por contexto
export const SANITIZATION_PROFILES = {
  STRICT: {
    ALLOWED_TAGS: [] as string[],
    ALLOWED_ATTR: [] as string[],
    KEEP_CONTENT: true,
    RETURN_DOM_FRAGMENT: false
  },
  MODERATE: {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'] as string[],
    ALLOWED_ATTR: [] as string[],
    KEEP_CONTENT: true,
    RETURN_DOM_FRAGMENT: false
  },
  PERMISSIVE: {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'a', 'ul', 'ol', 'li'] as string[],
    ALLOWED_ATTR: ['href', 'target'] as string[],
    KEEP_CONTENT: true,
    RETURN_DOM_FRAGMENT: false
  }
};

export type SanitizationProfile = keyof typeof SANITIZATION_PROFILES;

/**
 * Sanitiza texto usando DOMPurify con configuración específica
 */
export const sanitizeText = (
  input: string, 
  profile: SanitizationProfile = 'STRICT'
): string => {
  if (!input || typeof input !== 'string') {
    return '';
  }

  const config = SANITIZATION_PROFILES[profile];
  
  try {
    const sanitized = DOMPurify.sanitize(input.trim(), config);
    return typeof sanitized === 'string' ? sanitized : '';
  } catch (error) {
    console.warn('Error durante la sanitización:', error);
    return input.replace(/<[^>]*>/g, ''); // Fallback: remover todas las etiquetas HTML
  }
};

/**
 * Sanitiza múltiples campos de un objeto
 */
export const sanitizeObject = <T extends Record<string, any>>(
  obj: T,
  fieldProfiles: Partial<Record<keyof T, SanitizationProfile>> = {},
  defaultProfile: SanitizationProfile = 'STRICT'
): T => {
  const sanitized = { ...obj };
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      const profile = fieldProfiles[key as keyof T] || defaultProfile;
      sanitized[key as keyof T] = sanitizeText(value, profile) as T[keyof T];
    }
  }
  
  return sanitized;
};

/**
 * Sanitización específica para emails
 */
export const sanitizeEmail = (email: string): string => {
  if (!email) return '';
  
  // Sanitizar y validar formato básico
  const sanitized = sanitizeText(email, 'STRICT');
  
  // Remover caracteres peligrosos específicos para emails
  return sanitized
    .replace(/[<>'"]/g, '')
    .toLowerCase()
    .trim();
};

/**
 * Sanitización específica para teléfonos
 */
export const sanitizePhone = (phone: string): string => {
  if (!phone) return '';
  
  // Sanitizar y mantener solo números, espacios, +, -, (, )
  const sanitized = sanitizeText(phone, 'STRICT');
  return sanitized.replace(/[^0-9\s\+\-\(\)]/g, '').trim();
};

/**
 * Sanitización específica para nombres de empresa
 */
export const sanitizeCompanyName = (name: string): string => {
  if (!name) return '';
  
  const sanitized = sanitizeText(name, 'STRICT');
  
  // Permitir caracteres alfanuméricos, espacios y algunos símbolos comunes en nombres de empresa
  return sanitized
    .replace(/[<>'"&]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Sanitización específica para nombres de persona
 */
export const sanitizePerson = (name: string): string => {
  if (!name) return '';
  
  const sanitized = sanitizeText(name, 'STRICT');
  
  // Solo letras, espacios, guiones y apostrofes
  return sanitized
    .replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s\-']/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Detecta intentos potenciales de XSS
 */
export const detectXSSAttempt = (input: string): boolean => {
  if (!input || typeof input !== 'string') {
    return false;
  }

  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe/gi,
    /<object/gi,
    /<embed/gi,
    /vbscript:/gi,
    /expression\s*\(/gi
  ];

  return xssPatterns.some(pattern => pattern.test(input));
};

/**
 * Logging de seguridad para intentos de XSS
 */
export const logSecurityEvent = (
  eventType: 'XSS_ATTEMPT' | 'SANITIZATION_APPLIED',
  details: {
    input?: string;
    sanitized?: string;
    context?: string;
    userAgent?: string;
  }
): void => {
  const event = {
    timestamp: new Date().toISOString(),
    type: eventType,
    context: details.context || 'unknown',
    userAgent: details.userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent : 'server'),
    inputLength: details.input?.length || 0,
    sanitizedLength: details.sanitized?.length || 0,
    // No loguear el contenido completo por seguridad, solo indicadores
    hadScript: details.input?.includes('<script') || false,
    hadOnEvent: /on\w+\s*=/i.test(details.input || '') || false
  };

  console.warn(`[SECURITY] ${eventType}:`, event);
  
  // En producción, esto debería enviarse a un servicio de logging
  // sendSecurityEventToLoggingService(event);
};
