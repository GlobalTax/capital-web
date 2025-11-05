import { AdvisorFormData, AdvisorValuationSimpleResult } from '@/types/advisor';

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Valida que un número sea finito y positivo
 */
export const isValidPositiveNumber = (value: any): boolean => {
  return Number.isFinite(value) && value >= 0;
};

/**
 * Valida que un múltiplo sea razonable
 */
export const isValidMultiple = (value: any): boolean => {
  return Number.isFinite(value) && value > 0 && value <= 100;
};

/**
 * Valida que un rango sea válido (min < max)
 */
export const isValidRange = (min: number, max: number): boolean => {
  return isValidPositiveNumber(min) && 
         isValidPositiveNumber(max) && 
         min < max;
};

/**
 * Valida todos los datos antes de generar el PDF
 */
export const validateDataForPDF = (
  formData: AdvisorFormData,
  result: AdvisorValuationSimpleResult
): ValidationResult => {
  const errors: ValidationError[] = [];

  // Validar datos de empresa
  if (!formData.companyName?.trim()) {
    errors.push({ field: 'companyName', message: 'Nombre de empresa requerido' });
  }
  
  if (!formData.contactName?.trim()) {
    errors.push({ field: 'contactName', message: 'Nombre de contacto requerido' });
  }
  
  if (!formData.email?.includes('@')) {
    errors.push({ field: 'email', message: 'Email inválido' });
  }

  // Validar datos financieros
  if (!isValidPositiveNumber(formData.revenue)) {
    errors.push({ field: 'revenue', message: 'Facturación inválida' });
  }
  
  if (!isValidPositiveNumber(formData.ebitda)) {
    errors.push({ field: 'ebitda', message: 'EBITDA inválido' });
  }

  // Validar valoraciones
  if (!isValidPositiveNumber(result.ebitdaValuation)) {
    errors.push({ field: 'ebitdaValuation', message: 'Valoración EBITDA inválida' });
  }
  
  if (!isValidPositiveNumber(result.revenueValuation)) {
    errors.push({ field: 'revenueValuation', message: 'Valoración por facturación inválida' });
  }

  // Validar múltiplos
  if (!isValidMultiple(result.ebitdaMultiple)) {
    errors.push({ field: 'ebitdaMultiple', message: 'Múltiplo EBITDA inválido' });
  }
  
  if (!isValidMultiple(result.revenueMultiple)) {
    errors.push({ field: 'revenueMultiple', message: 'Múltiplo de facturación inválido' });
  }

  // Validar rangos
  if (!isValidRange(result.ebitdaRange.min, result.ebitdaRange.max)) {
    errors.push({ field: 'ebitdaRange', message: 'Rango EBITDA inválido' });
  }
  
  if (!isValidRange(result.revenueRange.min, result.revenueRange.max)) {
    errors.push({ field: 'revenueRange', message: 'Rango de facturación inválido' });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Valida un valor numérico con fallback
 */
export const safeNumber = (value: any, fallback: number = 0): number => {
  return isValidPositiveNumber(value) ? value : fallback;
};
