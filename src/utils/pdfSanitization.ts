import DOMPurify from 'dompurify';

/**
 * Sanitiza texto para uso seguro en PDFs
 * Elimina HTML tags y limita la longitud
 */
export const sanitizeForPDF = (input: string | null | undefined, maxLength: number = 200): string => {
  if (!input) return '';
  
  // Eliminar HTML tags usando DOMPurify
  const cleaned = DOMPurify.sanitize(input, { 
    ALLOWED_TAGS: [], 
    ALLOWED_ATTR: [] 
  });
  
  // Limitar longitud y eliminar espacios extras
  return cleaned.trim().substring(0, maxLength);
};

/**
 * Valida y sanitiza email
 */
export const sanitizeEmail = (email: string | null | undefined): string => {
  if (!email) return '';
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const cleaned = email.trim().toLowerCase();
  
  return emailRegex.test(cleaned) ? cleaned : '';
};

/**
 * Sanitiza teléfono permitiendo solo caracteres válidos
 */
export const sanitizePhone = (phone: string | null | undefined): string => {
  if (!phone) return '';
  
  // Solo números y caracteres permitidos: + - ( ) espacios
  return phone.replace(/[^\d\s\+\-\(\)]/g, '').substring(0, 20);
};

/**
 * Sanitiza nombre de archivo eliminando caracteres peligrosos
 */
export const sanitizeFileName = (fileName: string, maxLength: number = 50): string => {
  if (!fileName?.trim()) return 'documento';
  
  // Caracteres peligrosos en nombres de archivo
  const dangerousChars = /[\/\\\:*?"<>|]/g;
  
  const sanitized = fileName
    .replace(dangerousChars, '')
    .replace(/\s+/g, '-')
    .toLowerCase()
    .substring(0, maxLength);
  
  return sanitized || 'documento';
};

/**
 * Sanitiza CIF/NIF
 */
export const sanitizeCIF = (cif: string | null | undefined): string => {
  if (!cif) return '';
  
  // Solo letras y números, máximo 9 caracteres
  return cif.replace(/[^A-Z0-9]/gi, '').toUpperCase().substring(0, 9);
};
