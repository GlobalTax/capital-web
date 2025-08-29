import { CompanyDataV3, ScenarioConfig, ScenarioResult, TaxScenarioData } from '@/types/valuationV3';
import { calculateSpanishTaxImpact } from '@/utils/taxCalculationV2';

// Configuraciones predefinidas de escenarios
export const defaultScenarios: ScenarioConfig[] = [
  {
    id: 'conservative',
    name: 'Conservador',
    type: 'conservative',
    multiplier: 0.85,
    description: 'Valoración prudente (-15%)',
    color: 'hsl(var(--destructive))'
  },
  {
    id: 'base',
    name: 'Base',
    type: 'base', 
    multiplier: 1.0,
    description: 'Valoración de referencia',
    color: 'hsl(var(--primary))'
  },
  {
    id: 'optimistic',
    name: 'Optimista',
    type: 'optimistic',
    multiplier: 1.15,
    description: 'Valoración favorable (+15%)',
    color: 'hsl(var(--accent))'
  },
  {
    id: 'custom',
    name: 'Personalizado',
    type: 'custom',
    multiplier: 1.0,
    description: 'Valor personalizable',
    color: 'hsl(var(--secondary))'
  }
];

export const calculateScenarioResults = (
  companyData: CompanyDataV3,
  scenarios: ScenarioConfig[],
  taxData: TaxScenarioData,
  customValue?: number
): ScenarioResult[] => {
  return scenarios.map(scenario => {
    let valuation: number;
    
    if (scenario.type === 'custom' && customValue) {
      valuation = customValue;
    } else {
      valuation = Math.round(companyData.baseValuation * scenario.multiplier);
    }
    
    // Calcular impacto fiscal para este escenario
    const taxCalculation = calculateSpanishTaxImpact(
      {
        ...taxData,
        acquisitionValue: taxData.acquisitionValue,
        acquisitionDate: taxData.acquisitionDate,
        yearsHeld: 0, // No usado en V3
        reinvestmentQualifies: taxData.reinvestmentPlan
      },
      valuation
    );
    
    // Calcular ROI
    const initialInvestment = taxData.acquisitionValue || 1;
    const roi = ((taxCalculation.netAfterTax - initialInvestment) / initialInvestment) * 100;
    
    return {
      scenario,
      valuation,
      taxCalculation,
      roi: Math.round(roi * 100) / 100,
      netReturn: taxCalculation.netAfterTax
    };
  });
};

export const generateRecommendations = (results: ScenarioResult[]): string[] => {
  const recommendations: string[] = [];
  
  const bestNetReturn = Math.max(...results.map(r => r.netReturn));
  const bestScenario = results.find(r => r.netReturn === bestNetReturn);
  
  if (bestScenario) {
    recommendations.push(`El escenario ${bestScenario.scenario.name} ofrece el mejor retorno neto: ${bestNetReturn.toLocaleString('es-ES')}€`);
  }
  
  // Analizar tipos impositivos
  const avgTaxRate = results.reduce((sum, r) => sum + r.taxCalculation.effectiveTaxRate, 0) / results.length;
  if (avgTaxRate > 0.25) {
    recommendations.push('Considera estrategias de optimización fiscal para reducir el impacto tributario');
  }
  
  // Analizar reinversión
  const hasReinvestmentBenefit = results.some(r => r.taxCalculation.reinvestmentBenefit > 0);
  if (hasReinvestmentBenefit) {
    recommendations.push('La reinversión puede ofrecer importantes beneficios fiscales');
  }
  
  return recommendations;
};

export const calculateOptimalSalePercentage = (
  companyData: CompanyDataV3,
  taxData: TaxScenarioData,
  targetAmount: number
): number => {
  // Cálculo simplificado para determinar qué porcentaje vender
  const baseValuation = companyData.baseValuation;
  const roughPercentage = (targetAmount / baseValuation) * 100;
  return Math.min(100, Math.max(1, Math.round(roughPercentage)));
};