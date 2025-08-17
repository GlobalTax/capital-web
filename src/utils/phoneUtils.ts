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
 * Normaliza un número de teléfono al formato E.164 con validación estricta
 * @param phone - Número de teléfono sin normalizar
 * @param defaultCountry - País por defecto ('ES', 'FR', etc.)
 * @returns Número en formato E.164 o null si es inválido
 */
export const normalizeToE164 = (phone: string, defaultCountry: string = 'ES'): string | null => {
  if (!phone || typeof phone !== 'string') return null;
  
  // Limpiar todos los separadores (espacios, puntos, guiones, paréntesis)
  const cleaned = phone.replace(/[\s\.\-\(\)\+]/g, '');
  
  // Si está vacío después de limpiar
  if (!cleaned) return null;
  
  let normalized = '';
  
  // Si el número original tenía +, reconstruir con el prefijo
  if (phone.includes('+')) {
    normalized = `+${cleaned}`;
  } else {
    // Aplicar prefijo de país por defecto
    const countryPrefixes: Record<string, string> = {
      'ES': '34',
      'FR': '33',
      'IT': '39',
      'DE': '49',
      'GB': '44',
      'US': '1',
      'MX': '52'
    };
    
    const prefix = countryPrefixes[defaultCountry] || countryPrefixes['ES'];
    
    // Para España, números de 9 dígitos empezando por 6,7,8,9
    if (defaultCountry === 'ES' && /^[6789]\d{8}$/.test(cleaned)) {
      normalized = `+34${cleaned}`;
    } else {
      normalized = `+${prefix}${cleaned}`;
    }
  }
  
  // Validación estricta E.164: + seguido de 1-3 dígitos de país + 4-14 dígitos
  if (!/^\+[1-9]\d{1,3}\d{4,14}$/.test(normalized)) {
    return null;
  }
  
  // Verificar longitud total (10-15 dígitos después del +)
  const digitsAfterPlus = normalized.slice(1);
  if (digitsAfterPlus.length < 10 || digitsAfterPlus.length > 15) {
    return null;
  }
  
  return normalized;
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