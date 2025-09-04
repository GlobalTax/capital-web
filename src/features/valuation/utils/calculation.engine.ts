// ============= UNIFIED CALCULATION ENGINE =============
// Single calculation engine for all calculator versions

import { 
  ExtendedCompanyData, 
  SectorMultiple, 
  ValuationResult, 
  ComprehensiveResult,
  ScenarioResult,
  TaxData,
  ValuationScenario,
  TaxCalculationResult
} from '../types/unified.types';
import { getSectorMultiplesByEbitda } from '@/utils/ebitdaMatrix';

// ============= CALCULATION OPTIONS =============
interface CalculationOptions {
  version: string;
  includeTaxCalculation?: boolean;
  includeScenarios?: boolean;
  taxData?: TaxData;
  customMultipliers?: number[];
}

// ============= DEFAULT SCENARIOS =============
const DEFAULT_SCENARIOS: ValuationScenario[] = [
  {
    id: 'conservative',
    name: 'Conservador',
    type: 'conservative',
    multiplier: 0.8,
    description: 'Escenario pesimista con múltiplos reducidos',
    color: '#ef4444'
  },
  {
    id: 'base',
    name: 'Base',
    type: 'base',
    multiplier: 1.0,
    description: 'Valoración estándar del mercado',
    color: '#3b82f6'
  },
  {
    id: 'optimistic',
    name: 'Optimista',
    type: 'optimistic',
    multiplier: 1.2,
    description: 'Escenario favorable con prima de mercado',
    color: '#10b981'
  },
  {
    id: 'custom',
    name: 'Personalizado',
    type: 'custom',
    multiplier: 1.0,
    description: 'Valor personalizable por el usuario',
    color: '#8b5cf6'
  }
];

// ============= MAIN CALCULATION FUNCTION =============
export const calculateUnifiedValuation = async (
  companyData: ExtendedCompanyData,
  sectorMultiples: SectorMultiple[],
  options: CalculationOptions
): Promise<ValuationResult | ComprehensiveResult> => {
  
  // Simulate calculation time for UX
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Get base valuation
  const baseResult = await calculateBaseValuation(companyData, sectorMultiples);

  // If scenarios not requested, return simple result
  if (!options.includeScenarios) {
    return baseResult;
  }

  // Calculate scenario results
  const scenarios = await calculateScenarioResults(
    companyData, 
    baseResult, 
    options.taxData
  );

  // Find best scenario
  const bestScenario = scenarios.reduce((best, current) => 
    current.netReturn > best.netReturn ? current : best
  );

  // Generate recommendations
  const recommendations = generateRecommendations(scenarios, options.taxData);

  return {
    baseResult,
    scenarios,
    bestScenario,
    recommendations
  };
};

// ============= BASE VALUATION CALCULATION =============
const calculateBaseValuation = async (
  companyData: ExtendedCompanyData,
  sectorMultiples: SectorMultiple[]
): Promise<ValuationResult> => {
  
  const industryToUse = companyData.industry || 'servicios';
  const employeeRangeToUse = companyData.employeeRange || '2-5';
  const ebitdaToUse = companyData.ebitda || 100000;

  // Try EBITDA matrix first
  const byEbitda = getSectorMultiplesByEbitda(industryToUse, ebitdaToUse);
  if (byEbitda && byEbitda.metric === 'EV/EBITDA') {
    const avgMultiple = (byEbitda.low + byEbitda.high) / 2;
    const ebitdaValuation = ebitdaToUse * avgMultiple;
    const finalValuation = Math.round(ebitdaValuation);

    return {
      finalValuation,
      ebitdaMultiple: Math.round(ebitdaValuation),
      valuationRange: {
        min: Math.round(ebitdaToUse * byEbitda.low),
        max: Math.round(ebitdaToUse * byEbitda.high)
      },
      multiples: {
        ebitdaMultipleUsed: avgMultiple
      }
    };
  }

  // Fallback to sector multiples
  let sectorData = sectorMultiples.find(s => 
    s.sector_name === industryToUse && 
    s.employee_range === employeeRangeToUse
  );

  if (!sectorData) {
    sectorData = {
      sector_name: industryToUse,
      employee_range: employeeRangeToUse,
      ebitda_multiple: ebitdaToUse >= 1000000 ? 6.0 : 4.5,
      revenue_multiple: 1.0,
      description: 'Valores estimados'
    };
  }

  const ebitdaValuation = ebitdaToUse * sectorData.ebitda_multiple;
  const finalValuation = Math.round(ebitdaValuation);

  return {
    finalValuation,
    ebitdaMultiple: Math.round(ebitdaValuation),
    valuationRange: {
      min: Math.round(finalValuation * 0.8),
      max: Math.round(finalValuation * 1.2)
    },
    multiples: {
      ebitdaMultipleUsed: sectorData.ebitda_multiple
    }
  };
};

// ============= SCENARIO CALCULATIONS =============
const calculateScenarioResults = async (
  companyData: ExtendedCompanyData,
  baseResult: ValuationResult,
  taxData?: TaxData
): Promise<ScenarioResult[]> => {
  
  const scenarios = DEFAULT_SCENARIOS.map(scenario => {
    const valuation = Math.round(baseResult.finalValuation * scenario.multiplier);
    
    let taxCalculation: TaxCalculationResult | undefined;
    let totalTax = 0;
    let netReturn = valuation;
    let roi = 0;
    let effectiveTaxRate = 0;

    // Calculate tax if data provided
    if (taxData) {
      taxCalculation = calculateTaxScenario(valuation, taxData);
      totalTax = taxCalculation.totalTax;
      netReturn = taxCalculation.netAfterTax;
      roi = taxData.acquisitionValue > 0 
        ? ((netReturn - taxData.acquisitionValue) / taxData.acquisitionValue) * 100
        : 0;
      effectiveTaxRate = taxCalculation.effectiveTaxRate;
    }

    return {
      scenario,
      valuation,
      totalTax,
      netReturn,
      roi,
      effectiveTaxRate,
      taxCalculation
    };
  });

  return scenarios;
};

// ============= TAX CALCULATION =============
const calculateTaxScenario = (
  salePrice: number,
  taxData: TaxData
): TaxCalculationResult => {
  
  const adjustedSalePrice = salePrice * (taxData.salePercentage / 100);
  const capitalGain = Math.max(0, adjustedSalePrice - taxData.acquisitionValue);
  
  // Basic tax calculation for Spain
  const baseRate = taxData.taxpayerType === 'individual' ? 0.23 : 0.25;
  let baseTax = capitalGain * baseRate;
  
  // Apply reductions
  let reinvestmentBenefit = 0;
  let vitaliciaBenefit = 0;
  let abatementBenefit = 0;

  if (taxData.reinvestmentPlan && taxData.reinvestmentAmount > 0) {
    reinvestmentBenefit = Math.min(capitalGain * 0.5, taxData.reinvestmentAmount * 0.5);
    baseTax -= reinvestmentBenefit;
  }

  if (taxData.vitaliciaPlan && taxData.vitaliciaAmount > 0) {
    vitaliciaBenefit = Math.min(capitalGain * 0.3, taxData.vitaliciaAmount * 0.3);
    baseTax -= vitaliciaBenefit;
  }

  // Age-based abatement (simplified)
  if (taxData.taxpayerType === 'individual') {
    abatementBenefit = Math.min(capitalGain * 0.1, 50000);
    baseTax -= abatementBenefit;
  }

  const totalTax = Math.max(0, baseTax);
  const netAfterTax = adjustedSalePrice - totalTax;
  const effectiveTaxRate = adjustedSalePrice > 0 ? (totalTax / adjustedSalePrice) * 100 : 0;

  return {
    salePrice: adjustedSalePrice,
    acquisitionValue: taxData.acquisitionValue,
    capitalGain,
    deductibleExpenses: 0,
    taxableGain: capitalGain,
    totalTax,
    netAfterTax,
    effectiveTaxRate,
    reinvestmentBenefit,
    vitaliciaBenefit,
    abatementBenefit,
    taxBreakdown: [
      {
        description: 'Impuesto base',
        amount: capitalGain * baseRate,
        rate: baseRate * 100
      },
      {
        description: 'Reducción por reinversión',
        amount: -reinvestmentBenefit,
        rate: 0
      },
      {
        description: 'Reducción por renta vitalicia',
        amount: -vitaliciaBenefit,
        rate: 0
      },
      {
        description: 'Reducción por edad',
        amount: -abatementBenefit,
        rate: 0
      }
    ].filter(item => item.amount !== 0)
  };
};

// ============= RECOMMENDATIONS =============
const generateRecommendations = (
  scenarios: ScenarioResult[],
  taxData?: TaxData
): string[] => {
  const recommendations: string[] = [];
  
  const bestScenario = scenarios.reduce((best, current) => 
    current.netReturn > best.netReturn ? current : best
  );

  recommendations.push(
    `El escenario ${bestScenario.scenario.name} ofrece el mejor retorno neto con ${formatCurrency(bestScenario.netReturn)}`
  );

  if (taxData) {
    const highTaxScenarios = scenarios.filter(s => s.effectiveTaxRate > 20);
    if (highTaxScenarios.length > 0) {
      recommendations.push(
        'Considera estrategias de optimización fiscal como la reinversión o renta vitalicia'
      );
    }

    if (bestScenario.taxCalculation?.reinvestmentBenefit === 0 && taxData.acquisitionValue > 0) {
      recommendations.push(
        'Evalúa activar el plan de reinversión para reducir la carga fiscal'
      );
    }
  }

  // Performance-based recommendations
  const roiScenarios = scenarios.filter(s => s.roi > 100);
  if (roiScenarios.length > 0) {
    recommendations.push(
      'El ROI proyectado es excelente. Considera acelerar el proceso de venta'
    );
  }

  return recommendations;
};

// ============= UTILITIES =============
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};