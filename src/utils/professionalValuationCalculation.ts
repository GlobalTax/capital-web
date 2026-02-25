// =============================================
// CÁLCULOS: Sistema de Valoración Profesional
// Motor de cálculo para Valoraciones Pro
// =============================================

import { 
  FinancialYear, 
  NormalizationAdjustment, 
  SensitivityMatrix,
  ValuationCalculationResult 
} from '@/types/professionalValuation';
import { getSectorMultiplesByEbitda } from './ebitdaMatrix';

/**
 * Calcular EBITDA normalizado a partir del EBITDA reportado y ajustes
 */
export function calculateNormalizedEbitda(
  reportedEbitda: number,
  adjustments: NormalizationAdjustment[]
): number {
  let normalized = reportedEbitda;
  
  for (const adj of adjustments) {
    if (adj.type === 'add') {
      normalized += adj.amount;
    } else {
      normalized -= adj.amount;
    }
  }
  
  return normalized;
}

/**
 * Obtener el EBITDA del último año de los datos financieros
 */
export function getLatestEbitda(financialYears: FinancialYear[]): number {
  if (!financialYears || financialYears.length === 0) return 0;
  
  // Ordenar por año descendente y tomar el más reciente
  const sorted = [...financialYears].sort((a, b) => b.year - a.year);
  return sorted[0].ebitda || 0;
}

/**
 * Calcular EBITDA promedio de los últimos años
 */
export function getAverageEbitda(financialYears: FinancialYear[], years: number = 3): number {
  if (!financialYears || financialYears.length === 0) return 0;
  
  const sorted = [...financialYears].sort((a, b) => b.year - a.year);
  const selected = sorted.slice(0, years);
  
  const sum = selected.reduce((acc, fy) => acc + (fy.ebitda || 0), 0);
  return sum / selected.length;
}

/**
 * Obtener múltiplos EBITDA según sector y tamaño
 */
export function getEbitdaMultiples(
  sector: string,
  normalizedEbitda: number
): { low: number; high: number } {
  // Intentar usar la matriz EBITDA existente
  const matrixResult = getSectorMultiplesByEbitda(sector, normalizedEbitda);
  
  if (matrixResult) {
    return { low: matrixResult.low, high: matrixResult.high };
  }
  
  // Fallback: múltiplos genéricos basados en tamaño de EBITDA
  const ebitdaM = normalizedEbitda / 1_000_000;
  
  if (ebitdaM < 0.3) {
    return { low: 3.5, high: 5.5 };
  } else if (ebitdaM < 0.6) {
    return { low: 4.0, high: 6.0 };
  } else if (ebitdaM < 1.0) {
    return { low: 4.5, high: 6.5 };
  } else if (ebitdaM < 1.5) {
    return { low: 5.0, high: 7.0 };
  } else if (ebitdaM < 2.0) {
    return { low: 5.5, high: 7.5 };
  } else {
    return { low: 6.0, high: 8.0 };
  }
}

/**
 * Calcular valoración a partir de EBITDA y múltiplo
 */
export function calculateValuation(ebitda: number, multiple: number): number {
  return ebitda * multiple;
}

/**
 * Generar matriz de sensibilidad
 */
export function generateSensitivityMatrix(
  normalizedEbitda: number,
  multipleLow: number,
  multipleHigh: number
): SensitivityMatrix {
  // Variaciones de EBITDA: -20%, -10%, base, +10%, +20%
  const ebitdaVariations = [
    { label: '-20%', factor: 0.8 },
    { label: '-10%', factor: 0.9 },
    { label: 'Base', factor: 1.0 },
    { label: '+10%', factor: 1.1 },
    { label: '+20%', factor: 1.2 },
  ];
  
  // Generar rango de múltiplos (5 valores entre low y high)
  const multipleStep = (multipleHigh - multipleLow) / 4;
  const multiples = [
    multipleLow,
    multipleLow + multipleStep,
    multipleLow + multipleStep * 2,
    multipleLow + multipleStep * 3,
    multipleHigh,
  ].map(m => Math.round(m * 10) / 10);
  
  const rows = ebitdaVariations.map(ev => ({
    label: ev.label,
    ebitdaFactor: ev.factor,
    cells: multiples.map(multiple => ({
      ebitdaVariation: (ev.factor - 1) * 100,
      multiple,
      valuation: Math.round(normalizedEbitda * ev.factor * multiple),
    })),
  }));
  
  return { rows, multiples };
}

/**
 * Calcular valoración completa
 */
export function calculateProfessionalValuation(
  financialYears: FinancialYear[],
  adjustments: NormalizationAdjustment[],
  sector: string,
  customMultiple?: number
): ValuationCalculationResult {
  // 1. Obtener EBITDA reportado (del último año)
  const reportedEbitda = getLatestEbitda(financialYears);
  
  // 2. Calcular EBITDA normalizado
  const normalizedEbitda = calculateNormalizedEbitda(reportedEbitda, adjustments);
  
  // 3. Obtener múltiplos según sector y tamaño
  const { low: multipleLow, high: multipleHigh } = getEbitdaMultiples(sector, normalizedEbitda);
  
  // 4. Múltiplo a usar (personalizado o punto medio)
  const multipleUsed = customMultiple ?? (multipleLow + multipleHigh) / 2;
  
  // 5. Calcular valoraciones - usar múltiplos efectivos cuando hay customMultiple
  const effectiveLow = customMultiple ? customMultiple - 1 : multipleLow;
  const effectiveHigh = customMultiple ? customMultiple + 1 : multipleHigh;
  const valuationLow = calculateValuation(normalizedEbitda, effectiveLow);
  const valuationHigh = calculateValuation(normalizedEbitda, effectiveHigh);
  const valuationCentral = calculateValuation(normalizedEbitda, multipleUsed);
  
  // 6. Generar matriz de sensibilidad
  const sensitivityMatrix = generateSensitivityMatrix(normalizedEbitda, effectiveLow, effectiveHigh);
  
  return {
    normalizedEbitda,
    multipleLow: effectiveLow,
    multipleHigh: effectiveHigh,
    multipleUsed,
    valuationLow,
    valuationHigh,
    valuationCentral,
    sensitivityMatrix,
  };
}

/**
 * Formatear número como moneda EUR
 */
export function formatCurrencyEUR(value: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Formatear número con separador de miles
 */
export function formatNumber(value: number, decimals: number = 0): string {
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Calcular tendencia de crecimiento (CAGR)
 */
export function calculateCAGR(
  financialYears: FinancialYear[],
  metric: 'revenue' | 'ebitda' | 'netProfit'
): number | null {
  if (!financialYears || financialYears.length < 2) return null;
  
  const sorted = [...financialYears].sort((a, b) => a.year - b.year);
  const first = sorted[0][metric];
  const last = sorted[sorted.length - 1][metric];
  const years = sorted.length - 1;
  
  if (first <= 0 || last <= 0 || years <= 0) return null;
  
  // CAGR = (Valor Final / Valor Inicial)^(1/años) - 1
  const cagr = Math.pow(last / first, 1 / years) - 1;
  return cagr * 100; // Como porcentaje
}

/**
 * Calcular margen EBITDA
 */
export function calculateEbitdaMargin(ebitda: number, revenue: number): number {
  if (revenue <= 0) return 0;
  return (ebitda / revenue) * 100;
}

/**
 * Validar datos financieros mínimos
 */
export function validateFinancialData(financialYears: FinancialYear[]): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (!financialYears || financialYears.length === 0) {
    errors.push('Se requiere al menos un año de datos financieros');
    return { isValid: false, errors };
  }
  
  for (const fy of financialYears) {
    if (!fy.year || fy.year < 2000 || fy.year > new Date().getFullYear() + 1) {
      errors.push(`Año inválido: ${fy.year}`);
    }
    if (fy.revenue < 0) {
      errors.push(`Facturación negativa en ${fy.year}`);
    }
    if (fy.ebitda === undefined || fy.ebitda === null) {
      errors.push(`EBITDA no especificado en ${fy.year}`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}
