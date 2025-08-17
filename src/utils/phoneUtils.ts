/**
 * Normaliza un número de teléfono al formato E.164
 * @param phone - Número de teléfono sin normalizar
 * @returns Número en formato E.164 o null si es inválido
 */
export const normalizePhoneToE164 = (phone: string): string | null => {
  if (!phone || typeof phone !== 'string') return null;
  
  // Limpiar espacios, puntos, guiones y paréntesis
  const cleaned = phone.replace(/[\s\.\-\(\)]/g, '');
  
  // Si ya tiene +, validar formato E.164
  if (cleaned.startsWith('+')) {
    return /^\+[1-9]\d{1,14}$/.test(cleaned) ? cleaned : null;
  }
  
  // Números españoles: 9 dígitos empezando por 6,7,8,9
  if (/^[6789]\d{8}$/.test(cleaned)) {
    return `+34${cleaned}`;
  }
  
  // Otros países europeos comunes (Francia, Italia, Alemania, etc.)
  if (/^[1-9]\d{8,14}$/.test(cleaned)) {
    // Asumir formato internacional sin el +
    return `+${cleaned}`;
  }
  
  return null;
};

/**
 * Valida si un número está en formato E.164
 * @param phone - Número a validar
 * @returns true si es válido
 */
export const isValidE164 = (phone: string): boolean => {
  if (!phone) return false;
  return /^\+[1-9]\d{1,14}$/.test(phone);
};

/**
 * Formatea un número E.164 para mostrar de forma legible
 * @param phone - Número en formato E.164
 * @returns Número formateado para mostrar
 */
export const formatPhoneForDisplay = (phone: string): string => {
  if (!phone) return '';
  
  // Para números españoles (+34...)
  if (phone.startsWith('+34')) {
    const number = phone.slice(3);
    return `+34 ${number.slice(0, 3)} ${number.slice(3, 6)} ${number.slice(6)}`;
  }
  
  // Para otros números, mostrar con espacios cada 3 dígitos
  return phone.replace(/(\+\d{1,3})(\d{3})(\d{3})(\d+)/, '$1 $2 $3 $4');
};