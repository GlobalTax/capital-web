
import { sanitizeText, detectXSSAttempt, logSecurityEvent } from './sanitization';
import { logger } from './logger';

// Dominios de email temporales/desechables más comunes
const DISPOSABLE_EMAIL_DOMAINS = [
  '10minutemail.com',
  'guerrillamail.com',
  'mailinator.com',
  'tempmail.org',
  'yopmail.com',
  'throwaway.email',
  'temp-mail.org',
  '20minutemail.com',
  'mailnesia.com',
  'trashmail.com'
];

// TLDs válidos comunes (lista reducida para rendimiento)
const VALID_TLDS = [
  'com', 'org', 'net', 'edu', 'gov', 'mil', 'int', 'arpa',
  'es', 'pt', 'fr', 'de', 'uk', 'it', 'nl', 'be', 'ch', 'at',
  'co', 'io', 'me', 'tv', 'cc', 'info', 'biz', 'name', 'pro'
];

export interface EmailValidationResult {
  isValid: boolean;
  message?: string;
  sanitizedValue?: string;
  warnings?: string[];
  metadata?: {
    localPart: string;
    domain: string;
    tld: string;
    isDisposable: boolean;
    hasInternationalChars: boolean;
  };
}

export interface EmailValidationConfig {
  maxLength?: number;
  maxLocalLength?: number;
  allowDisposable?: boolean;
  allowInternational?: boolean;
  strictTldCheck?: boolean;
  customDomainWhitelist?: string[];
  customDomainBlacklist?: string[];
}

const DEFAULT_CONFIG: EmailValidationConfig = {
  maxLength: 254, // RFC 5321 limite
  maxLocalLength: 64, // RFC 5321 limite para parte local
  allowDisposable: false,
  allowInternational: true,
  strictTldCheck: false,
  customDomainWhitelist: [],
  customDomainBlacklist: []
};

/**
 * Validación robusta de email siguiendo RFC 5322 con mejoras de seguridad
 */
export const validateEmailRobust = (
  email: string, 
  config: EmailValidationConfig = {}
): EmailValidationResult => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const warnings: string[] = [];

  // Validación inicial de entrada
  if (!email || typeof email !== 'string') {
    return {
      isValid: false,
      message: 'Email es requerido'
    };
  }

  // Detectar intentos de XSS antes de procesar
  if (detectXSSAttempt(email)) {
    logSecurityEvent('XSS_ATTEMPT', { 
      input: email, 
      context: 'email_validation_robust' 
    });
    return {
      isValid: false,
      message: 'El email contiene caracteres peligrosos'
    };
  }

  // Sanitizar entrada
  const sanitizedEmail = sanitizeText(email.trim().toLowerCase(), 'STRICT');
  
  if (sanitizedEmail !== email.trim().toLowerCase()) {
    logSecurityEvent('SANITIZATION_APPLIED', {
      input: email,
      sanitized: sanitizedEmail,
      context: 'email_validation_robust'
    });
  }

  // Validación de longitud total
  if (sanitizedEmail.length > finalConfig.maxLength!) {
    return {
      isValid: false,
      message: `El email no puede tener más de ${finalConfig.maxLength} caracteres`
    };
  }

  if (sanitizedEmail.length < 3) {
    return {
      isValid: false,
      message: 'El email es demasiado corto'
    };
  }

  // RFC 5322 regex mejorado - más estricto y completo
  const emailRegexRFC5322 = /^[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?$/;

  if (!emailRegexRFC5322.test(sanitizedEmail)) {
    return {
      isValid: false,
      message: 'El formato del email no es válido'
    };
  }

  // Dividir email en partes local y dominio
  const atIndex = sanitizedEmail.lastIndexOf('@');
  if (atIndex === -1) {
    return {
      isValid: false,
      message: 'Email debe contener el símbolo @'
    };
  }

  const localPart = sanitizedEmail.substring(0, atIndex);
  const domainPart = sanitizedEmail.substring(atIndex + 1);

  // Validar parte local
  if (localPart.length === 0) {
    return {
      isValid: false,
      message: 'La parte local del email no puede estar vacía'
    };
  }

  if (localPart.length > finalConfig.maxLocalLength!) {
    return {
      isValid: false,
      message: `La parte local no puede tener más de ${finalConfig.maxLocalLength} caracteres`
    };
  }

  // Validar que no empiece o termine con punto
  if (localPart.startsWith('.') || localPart.endsWith('.')) {
    return {
      isValid: false,
      message: 'La parte local no puede empezar o terminar con punto'
    };
  }

  // Validar que no tenga puntos consecutivos
  if (localPart.includes('..')) {
    return {
      isValid: false,
      message: 'La parte local no puede tener puntos consecutivos'
    };
  }

  // Validar dominio
  if (domainPart.length === 0) {
    return {
      isValid: false,
      message: 'El dominio no puede estar vacío'
    };
  }

  if (domainPart.length > 253) {
    return {
      isValid: false,
      message: 'El dominio es demasiado largo'
    };
  }

  // Validar formato del dominio
  const domainRegex = /^[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)*$/;
  if (!domainRegex.test(domainPart)) {
    return {
      isValid: false,
      message: 'El formato del dominio no es válido'
    };
  }

  // Extraer TLD
  const domainParts = domainPart.split('.');
  if (domainParts.length < 2) {
    return {
      isValid: false,
      message: 'El dominio debe tener al menos un punto'
    };
  }

  const tld = domainParts[domainParts.length - 1].toLowerCase();

  // Validar TLD si está habilitado
  if (finalConfig.strictTldCheck && !VALID_TLDS.includes(tld)) {
    return {
      isValid: false,
      message: 'El dominio no tiene una extensión válida'
    };
  }

  // Verificar lista blanca de dominios
  if (finalConfig.customDomainWhitelist && finalConfig.customDomainWhitelist.length > 0) {
    if (!finalConfig.customDomainWhitelist.includes(domainPart)) {
      return {
        isValid: false,
        message: 'Este dominio no está permitido'
      };
    }
  }

  // Verificar lista negra de dominios
  if (finalConfig.customDomainBlacklist && finalConfig.customDomainBlacklist.includes(domainPart)) {
    return {
      isValid: false,
      message: 'Este dominio no está permitido'
    };
  }

  // Verificar emails desechables
  const isDisposable = DISPOSABLE_EMAIL_DOMAINS.includes(domainPart);
  if (!finalConfig.allowDisposable && isDisposable) {
    logger.warn('Disposable email blocked', { domain: domainPart }, { 
      context: 'security', 
      component: 'emailValidation' 
    });
    return {
      isValid: false,
      message: 'No se permiten emails temporales o desechables'
    };
  }

  if (isDisposable) {
    warnings.push('Este es un email temporal o desechable');
  }

  // Detectar caracteres internacionales
  const hasInternationalChars = /[^\x00-\x7F]/.test(sanitizedEmail);
  if (!finalConfig.allowInternational && hasInternationalChars) {
    return {
      isValid: false,
      message: 'No se permiten caracteres internacionales en el email'
    };
  }

  // Validación exitosa
  const result: EmailValidationResult = {
    isValid: true,
    sanitizedValue: sanitizedEmail,
    warnings: warnings.length > 0 ? warnings : undefined,
    metadata: {
      localPart,
      domain: domainPart,
      tld,
      isDisposable,
      hasInternationalChars
    }
  };

  // Log para análisis estadístico (solo en desarrollo)
  if (process.env.NODE_ENV === 'development') {
    logger.debug('Email validation successful', {
      domain: domainPart,
      tld,
      isDisposable,
      hasWarnings: warnings.length > 0
    }, { context: 'form', component: 'emailValidation' });
  }

  return result;
};

/**
 * Función simplificada para compatibilidad con código existente
 */
export const isValidEmailRobust = (email: string, config?: EmailValidationConfig): boolean => {
  return validateEmailRobust(email, config).isValid;
};

/**
 * Validador específico para formularios con configuración predefinida
 */
export const validateEmailForContact = (email: string): EmailValidationResult => {
  return validateEmailRobust(email, {
    allowDisposable: false,
    strictTldCheck: false,
    allowInternational: true
  });
};

/**
 * Validador permisivo para suscripciones
 */
export const validateEmailForNewsletter = (email: string): EmailValidationResult => {
  return validateEmailRobust(email, {
    allowDisposable: true,
    strictTldCheck: false,
    allowInternational: true
  });
};
