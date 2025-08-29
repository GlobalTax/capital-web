
import { TaxSimulatorData, TaxCalculationResult } from '@/types/valuationV2';

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
        const parte1 = 300000 * 0.15;
        const parte2 = (taxableGain - 300000) * 0.25;
        totalTax = parte1 + parte2;
        taxBreakdown.push(
          {
            description: 'Tipo reducido PYME (hasta 300.000€)',
            amount: 300000,
            rate: 15
          },
          {
            description: 'Tipo general (más de 300.000€)',
            amount: taxableGain - 300000,
            rate: 25
          }
        );
      }
    } else {
      // Tipo general 25%
      totalTax = taxableGain * 0.25;
      taxBreakdown.push({
        description: 'Tipo general sociedades',
        amount: taxableGain,
        rate: 25
      });
    }
    
    // Beneficio por reinversión (Art. 42 LIS - solo sociedades)
    if (simulatorData.reinvestmentPlan && 
        simulatorData.reinvestmentQualifies &&
        simulatorData.reinvestmentAmount >= capitalGain * 0.7) {
      // Exención de hasta el 100% si reinvierte el 70% o más
      reinvestmentBenefit = totalTax;
      totalTax = 0;
    }
  }
  
  // Neto después de impuestos
  const netAfterTax = actualSalePrice - totalTax;
  
  // Tipo efectivo
  const effectiveTaxRate = capitalGain > 0 ? (totalTax / capitalGain) : 0;
  const taxRate = taxableGain > 0 ? (totalTax / taxableGain) : 0;
  
  return {
    salePrice: actualSalePrice,
    acquisitionValue,
    capitalGain,
    deductibleExpenses,
    taxableGain,
    taxRate,
    totalTax,
    netAfterTax,
    reinvestmentBenefit,
    vitaliciaBenefit,
    abatementBenefit,
    effectiveTaxRate,
    taxBreakdown
  };
};
