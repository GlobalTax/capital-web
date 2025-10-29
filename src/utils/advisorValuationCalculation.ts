import { AdvisorMultiple } from '@/hooks/useAdvisorValuationMultiples';
import { logger } from '@/utils/logger';

export interface AdvisorValuationInput {
  sector: string;
  revenue: number;
  ebitda: number;
  netProfit: number;
}

export interface MetricValuation {
  median: number;
  range: { min: number; max: number };
  multiple: number;
  metricValue: number;
}

export interface AdvisorValuationResult {
  revenueValuation: MetricValuation;
  ebitdaValuation: MetricValuation;
  netProfitValuation: MetricValuation;
  averageValuation: number;
  weightedAverage: number;
  recommendedRange: { min: number; max: number };
  confidence: 'high' | 'medium' | 'low';
  confidenceScore: number;
  recommendation: string;
  warnings: string[];
}

/**
 * Calcula la valoración de una empresa usando tres métricas:
 * - Facturación (Revenue)
 * - EBITDA
 * - Resultado Neto (Net Profit)
 */
export const calculateAdvisorValuation = (
  input: AdvisorValuationInput,
  multiples: AdvisorMultiple
): AdvisorValuationResult => {
  logger.info('Starting advisor valuation calculation', { 
    sector: input.sector,
    revenue: input.revenue,
    ebitda: input.ebitda,
    netProfit: input.netProfit
  }, { context: 'valuation', component: 'advisorValuationCalculation' });

  const warnings: string[] = [];

  // ===== VALIDACIONES =====
  if (input.revenue <= 0) {
    throw new Error('La facturación debe ser positiva');
  }

  if (input.ebitda < 0) {
    warnings.push('⚠️ EBITDA negativo: la empresa tiene pérdidas operativas');
  }

  if (input.ebitda > input.revenue) {
    warnings.push('⚠️ EBITDA superior a la facturación: revisar datos contables');
  }

  if (input.netProfit > input.ebitda && input.ebitda > 0) {
    warnings.push('⚠️ Resultado neto superior a EBITDA: situación contable inusual');
  }

  if (input.netProfit > input.revenue) {
    warnings.push('⚠️ Resultado neto superior a facturación: revisar datos');
  }

  // ===== CÁLCULO POR FACTURACIÓN =====
  const revenueValuation: MetricValuation = {
    median: input.revenue * multiples.revenue_multiple_median,
    range: {
      min: input.revenue * multiples.revenue_multiple_min,
      max: input.revenue * multiples.revenue_multiple_max
    },
    multiple: multiples.revenue_multiple_median,
    metricValue: input.revenue
  };

  // ===== CÁLCULO POR EBITDA =====
  const ebitdaValuation: MetricValuation = {
    median: input.ebitda * multiples.ebitda_multiple_median,
    range: {
      min: input.ebitda * multiples.ebitda_multiple_min,
      max: input.ebitda * multiples.ebitda_multiple_max
    },
    multiple: multiples.ebitda_multiple_median,
    metricValue: input.ebitda
  };

  // ===== CÁLCULO POR RESULTADO NETO =====
  const netProfitValuation: MetricValuation = {
    median: input.netProfit * multiples.net_profit_multiple_median,
    range: {
      min: input.netProfit * multiples.net_profit_multiple_min,
      max: input.netProfit * multiples.net_profit_multiple_max
    },
    multiple: multiples.net_profit_multiple_median,
    metricValue: input.netProfit
  };

  // Validar si alguna valoración es negativa
  if (revenueValuation.median < 0 || ebitdaValuation.median < 0 || netProfitValuation.median < 0) {
    warnings.push('⚠️ Valoración negativa detectada en alguna métrica');
  }

  // ===== PROMEDIO SIMPLE =====
  const averageValuation = Math.round(
    (revenueValuation.median + ebitdaValuation.median + netProfitValuation.median) / 3
  );

  // ===== PROMEDIO PONDERADO =====
  // EBITDA: 50%, Facturación: 25%, Resultado Neto: 25%
  const weightedAverage = Math.round(
    revenueValuation.median * 0.25 +
    ebitdaValuation.median * 0.50 +
    netProfitValuation.median * 0.25
  );

  // ===== RANGO RECOMENDADO =====
  const allMedians = [
    revenueValuation.median,
    ebitdaValuation.median,
    netProfitValuation.median
  ].filter(val => val > 0); // Filtrar valores negativos

  const minMedian = Math.min(...allMedians);
  const maxMedian = Math.max(...allMedians);

  const recommendedRange = {
    min: Math.round(minMedian * 0.9),
    max: Math.round(maxMedian * 1.1)
  };

  // ===== ANÁLISIS DE CONFIANZA =====
  const avgForSpread = allMedians.length > 0 
    ? allMedians.reduce((sum, val) => sum + val, 0) / allMedians.length 
    : 1;

  const spread = avgForSpread > 0 ? (maxMedian - minMedian) / avgForSpread : 0;

  let confidence: 'high' | 'medium' | 'low';
  let confidenceScore: number;
  let recommendation: string;

  if (spread < 0.20) {
    confidence = 'high';
    confidenceScore = 90;
    recommendation = 'Las tres métricas convergen en valores similares, lo que indica alta consistencia en la valoración. Los datos financieros muestran coherencia y la valoración es confiable.';
  } else if (spread < 0.40) {
    confidence = 'medium';
    confidenceScore = 70;
    recommendation = 'Existe una variabilidad moderada entre las métricas de valoración. Se recomienda realizar un análisis adicional de la estructura financiera y considerar factores cualitativos del negocio.';
  } else {
    confidence = 'low';
    confidenceScore = 45;
    recommendation = 'Se detecta alta dispersión entre las diferentes métricas de valoración. Es fundamental revisar los supuestos contables, la estructura financiera y considerar un análisis más profundo antes de tomar decisiones.';
  }

  // Ajustar confianza si hay warnings
  if (warnings.length > 0) {
    confidenceScore = Math.max(30, confidenceScore - (warnings.length * 10));
    if (confidenceScore < 60 && confidence === 'high') {
      confidence = 'medium';
    }
    if (confidenceScore < 40 && confidence === 'medium') {
      confidence = 'low';
    }
  }

  logger.info('Advisor valuation calculation completed', {
    weightedAverage,
    confidence,
    confidenceScore,
    warningsCount: warnings.length
  }, { context: 'valuation', component: 'advisorValuationCalculation' });

  return {
    revenueValuation,
    ebitdaValuation,
    netProfitValuation,
    averageValuation,
    weightedAverage,
    recommendedRange,
    confidence,
    confidenceScore,
    recommendation,
    warnings
  };
};

/**
 * Valida los datos de entrada antes del cálculo
 */
export const validateAdvisorInput = (input: AdvisorValuationInput): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!input.sector || input.sector.trim() === '') {
    errors.push('El sector es obligatorio');
  }

  if (input.revenue <= 0) {
    errors.push('La facturación debe ser mayor que cero');
  }

  if (input.revenue > 10_000_000_000) {
    errors.push('La facturación parece demasiado alta, verifica el valor');
  }

  if (input.ebitda > input.revenue) {
    errors.push('El EBITDA no puede ser mayor que la facturación');
  }

  if (input.netProfit < -input.revenue) {
    errors.push('Las pérdidas netas no pueden superar la facturación');
  }

  if (input.netProfit > input.revenue) {
    errors.push('El resultado neto no puede ser mayor que la facturación');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
