/**
 * Formatea un número con separadores de miles (puntos)
 * Ejemplo: 1000000 → "1.000.000"
 */
export const formatNumberWithDots = (value: number | string): string => {
  if (!value && value !== 0) return '';
  
  // Convertir a string y remover caracteres no numéricos
  const numStr = String(value).replace(/[^\d]/g, '');
  
  if (!numStr) return '';
  
  // Formatear con puntos como separadores de miles
  return parseInt(numStr, 10).toLocaleString('es-ES', {
    useGrouping: true,
    maximumFractionDigits: 0
  });
};

/**
 * Parsea un string con puntos a número
 * Ejemplo: "1.000.000" → 1000000
 */
export const parseNumberWithDots = (value: string): number => {
  if (!value) return 0;
  
  // Remover todos los puntos y convertir a número
  const numStr = value.replace(/\./g, '');
  const parsed = parseInt(numStr, 10);
  
  return isNaN(parsed) ? 0 : parsed;
};
