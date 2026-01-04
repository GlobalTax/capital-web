// ============= TAX CALCULATION UTILS =============
// Consolidated tax calculation functions for V4 calculator

interface TaxSimulatorData {
  taxpayerType: 'individual' | 'company';
  acquisitionValue: number;
  acquisitionDate: string;
  yearsHeld: number;
  salePercentage: number;
  currentTaxBase?: number;
  reinvestmentPlan: boolean;
  reinvestmentAmount: number;
  vitaliciaPlan: boolean;
  vitaliciaAmount: number;
  reinvestmentQualifies?: boolean;
  // Art. 21 LIS - Exención participaciones significativas (solo sociedades)
  applyArticle21: boolean;
  participationPercentage: number;
  meetsSubjectToTaxRequirement: boolean;
  meetsEconomicActivityRequirement: boolean;
}

export interface TaxCalculationResult {
  salePrice: number;
  acquisitionValue: number;
  capitalGain: number;
  deductibleExpenses: number;
  taxableGain: number;
  totalTax: number;
  netAfterTax: number;
  effectiveTaxRate: number;
  reinvestmentBenefit: number;
  vitaliciaBenefit: number;
  abatementBenefit: number;
  article21Benefit: number;
  taxBreakdown: {
    description: string;
    amount: number;
    rate: number;
  }[];
}

// Tramos IRPF 2025 actualizados
const IRPF_2025_BRACKETS = [
  { min: 0, max: 6000, rate: 0.19 },
  { min: 6000, max: 50000, rate: 0.21 },
  { min: 50000, max: 200000, rate: 0.23 },
  { min: 200000, max: 300000, rate: 0.27 },
  { min: 300000, max: Infinity, rate: 0.30 }
];

const calculateProgressiveTax = (amount: number): { totalTax: number; breakdown: any[] } => {
  let totalTax = 0;
  const breakdown = [];
  
  for (const bracket of IRPF_2025_BRACKETS) {
    if (amount <= bracket.min) break;
    
    const taxableInBracket = Math.min(amount, bracket.max) - bracket.min;
    const taxInBracket = taxableInBracket * bracket.rate;
    
    totalTax += taxInBracket;
    
    if (taxableInBracket > 0) {
      breakdown.push({
        description: `Tramo ${bracket.min.toLocaleString('es-ES')}€ - ${bracket.max === Infinity ? 'en adelante' : bracket.max.toLocaleString('es-ES') + '€'}`,
        amount: taxableInBracket,
        rate: bracket.rate * 100
      });
    }
  }
  
  return { totalTax, breakdown };
};

const calculateAbatementCoefficient = (
  acquisitionDate: string,
  capitalGain: number,
  assetType: 'shares' | 'property' = 'shares'
): number => {
  const acquisitionYear = new Date(acquisitionDate).getFullYear();
  
  // Solo aplica a bienes adquiridos antes del 31-12-1994
  if (acquisitionYear >= 1995) return 0;
  
  // Calcular años entre adquisición y 31-12-1996 que excedan de 2
  const yearsForReduction = Math.max(0, 1996 - acquisitionYear - 2);
  
  let reductionRate = 0;
  if (assetType === 'shares') {
    // Acciones: 25% por año
    reductionRate = Math.min(yearsForReduction * 0.25, 1); // Máximo 100%
  } else {
    // Inmuebles: 11.11% por año
    reductionRate = Math.min(yearsForReduction * 0.1111, 1); // Máximo 100%
  }
  
  // Máximo 400.000€ de ganancia reducible
  const maxReducibleGain = 400000;
  const reducibleGain = Math.min(capitalGain, maxReducibleGain);
  
  return reducibleGain * reductionRate;
};

// Verificar elegibilidad Art. 21 LIS (exención 99% participaciones significativas)
const checkArticle21Eligibility = (
  participationPercentage: number,
  acquisitionValue: number,
  yearsHeld: number,
  meetsSubjectToTax: boolean,
  meetsEconomicActivity: boolean
): { eligible: boolean; exemptionRate: number; reason?: string } => {
  // Requisito 1: Participación ≥ 5% O valor adquisición > 20M€
  const meetsParticipationThreshold = participationPercentage >= 5 || acquisitionValue >= 20000000;
  
  // Requisito 2: Tenencia mínima ≥ 1 año
  const meetsHoldingPeriod = yearsHeld >= 1;
  
  if (!meetsParticipationThreshold) {
    return { eligible: false, exemptionRate: 0, reason: 'Participación < 5% y valor < 20M€' };
  }
  if (!meetsHoldingPeriod) {
    return { eligible: false, exemptionRate: 0, reason: 'Tenencia < 1 año' };
  }
  if (!meetsSubjectToTax) {
    return { eligible: false, exemptionRate: 0, reason: 'Filial no tributa ≥10%' };
  }
  if (!meetsEconomicActivity) {
    return { eligible: false, exemptionRate: 0, reason: 'Filial sin actividad económica' };
  }
  
  return { eligible: true, exemptionRate: 0.99 }; // 99% exento
};

export const calculateSpanishTaxImpact = (
  simulatorData: TaxSimulatorData,
  salePrice: number
): TaxCalculationResult => {
  // Precio de venta basado en el porcentaje a vender
  const actualSalePrice = salePrice * (simulatorData.salePercentage / 100);
  
  // Valor de adquisición proporcional
  const acquisitionValue = simulatorData.acquisitionValue * (simulatorData.salePercentage / 100);
  
  // Gastos deducibles estimados (1% del precio venta: notaría, registro, etc.)
  const deductibleExpenses = actualSalePrice * 0.01;
  
  // Plusvalía bruta
  const capitalGain = actualSalePrice - acquisitionValue - deductibleExpenses;
  
  // Calcular coeficientes de abatimiento (solo para personas físicas y participaciones pre-1995)
  let abatementBenefit = 0;
  if (simulatorData.taxpayerType === 'individual' && simulatorData.acquisitionDate) {
    abatementBenefit = calculateAbatementCoefficient(
      simulatorData.acquisitionDate,
      capitalGain,
      'shares'
    );
  }
  
  // Ganancia gravable después de abatimientos
  let taxableGain = Math.max(0, capitalGain - abatementBenefit);
  
  let totalTax = 0;
  let taxBreakdown: { description: string; amount: number; rate: number; }[] = [];
  let reinvestmentBenefit = 0;
  let vitaliciaBenefit = 0;
  let article21Benefit = 0;
  
  if (simulatorData.taxpayerType === 'individual') {
    // PERSONAS FÍSICAS - Nuevos tramos IRPF 2025
    const { totalTax: calculatedTax, breakdown } = calculateProgressiveTax(taxableGain);
    totalTax = calculatedTax;
    taxBreakdown = breakdown;
    
    // Beneficio por renta vitalicia
    if (simulatorData.vitaliciaPlan && simulatorData.vitaliciaAmount > 0) {
      const vitaliciaPercentage = Math.min(simulatorData.vitaliciaAmount / capitalGain, 1);
      vitaliciaBenefit = totalTax * vitaliciaPercentage;
      totalTax -= vitaliciaBenefit;
    }
  } else {
    // SOCIEDADES - Ley 27/2014 del Impuesto sobre Sociedades
    
    // Verificar si aplica Art. 21 LIS (exención participaciones significativas)
    if (simulatorData.applyArticle21 && capitalGain > 0) {
      const eligibility = checkArticle21Eligibility(
        simulatorData.participationPercentage,
        acquisitionValue,
        simulatorData.yearsHeld,
        simulatorData.meetsSubjectToTaxRequirement,
        simulatorData.meetsEconomicActivityRequirement
      );
      
      if (eligibility.eligible) {
        // 99% de la plusvalía está exenta
        article21Benefit = capitalGain * eligibility.exemptionRate;
        taxableGain = capitalGain * (1 - eligibility.exemptionRate); // Solo tributa el 1%
        
        taxBreakdown.push({
          description: 'Exención Art. 21 LIS (99%)',
          amount: article21Benefit,
          rate: 0
        });
      }
    }
    
    // Calcular impuesto sobre la ganancia tributable
    if (taxableGain > 0) {
      if (simulatorData.currentTaxBase && simulatorData.currentTaxBase <= 1000000) {
        // PYME: 15% primeros 300K, 25% resto
        if (taxableGain <= 300000) {
          totalTax = taxableGain * 0.15;
          taxBreakdown.push({
            description: 'Tipo reducido PYME (hasta 300.000€)',
            amount: taxableGain,
            rate: 15
          });
        } else {
          // Primeros 300K al 15%
          const first300k = 300000 * 0.15;
          const remainder = (taxableGain - 300000) * 0.25;
          totalTax = first300k + remainder;
          
          taxBreakdown.push({
            description: 'Tipo reducido PYME (hasta 300.000€)',
            amount: 300000,
            rate: 15
          });
          taxBreakdown.push({
            description: 'Tipo general PYME (resto)',
            amount: taxableGain - 300000,
            rate: 25
          });
        }
      } else {
        // Tipo general: 25%
        totalTax = taxableGain * 0.25;
        taxBreakdown.push({
          description: 'Tipo general sociedades',
          amount: taxableGain,
          rate: 25
        });
      }
    }
    
    // Beneficio por reinversión (solo sociedades, adicional a Art. 21)
    if (simulatorData.reinvestmentPlan && simulatorData.reinvestmentAmount > 0 && !simulatorData.applyArticle21) {
      const reinvestmentPercentage = Math.min(simulatorData.reinvestmentAmount / capitalGain, 1);
      reinvestmentBenefit = totalTax * reinvestmentPercentage * 0.12; // 12% de reducción
      totalTax -= reinvestmentBenefit;
    }
  }
  
  // Asegurar que los valores no sean negativos
  totalTax = Math.max(0, totalTax);
  const netAfterTax = actualSalePrice - totalTax;
  const effectiveTaxRate = actualSalePrice > 0 ? (totalTax / actualSalePrice) * 100 : 0;
  
  return {
    salePrice: actualSalePrice,
    acquisitionValue,
    capitalGain,
    deductibleExpenses,
    taxableGain,
    totalTax,
    netAfterTax,
    effectiveTaxRate,
    reinvestmentBenefit,
    vitaliciaBenefit,
    abatementBenefit,
    article21Benefit,
    taxBreakdown
  };
};