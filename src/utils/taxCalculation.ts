
import { CompanyDataV2, TaxCalculationResult } from '@/types/valuationV2';

export const calculateTaxImpact = (
  companyData: CompanyDataV2,
  finalValuation: number
): TaxCalculationResult => {
  // Precio de venta basado en el porcentaje a vender
  const salePrice = finalValuation * (companyData.salePercentage / 100);
  
  // Coste de adquisición proporcional
  const acquisitionCost = companyData.acquisitionCost * (companyData.salePercentage / 100);
  
  // Plusvalía bruta
  const capitalGain = salePrice - acquisitionCost;
  
  // Aplicar reducciones por años de tenencia (si aplica)
  let taxableGain = capitalGain;
  
  // Reducción por permanencia (más de 1 año)
  if (companyData.yearsHeld > 1) {
    // Hasta 30% de reducción por años de tenencia (máximo 10 años)
    const reductionPercentage = Math.min(companyData.yearsHeld * 3, 30);
    taxableGain = capitalGain * (1 - reductionPercentage / 100);
  }
  
  // Determinar tipo impositivo según régimen
  let taxRate = 0;
  switch (companyData.taxRegime) {
    case 'general':
      taxRate = 0.19; // 19% general
      break;
    case 'pyme':
      if (capitalGain <= 300000) {
        taxRate = 0.15; // 15% para PYMEs hasta 300K
      } else {
        taxRate = 0.25; // 25% para el exceso
      }
      break;
    case 'startup':
      taxRate = 0.15; // 15% para startups
      break;
  }
  
  // Calcular impuesto antes de reinversión
  let totalTax = taxableGain * taxRate;
  
  // Aplicar beneficio por reinversión si aplica
  let reinvestmentBenefit = 0;
  if (companyData.reinvestmentPlan && companyData.reinvestmentAmount > 0) {
    // Hasta 20% de reducción si reinvierte al menos el 50% de la ganancia
    const reinvestmentPercentage = companyData.reinvestmentAmount / capitalGain;
    if (reinvestmentPercentage >= 0.5) {
      reinvestmentBenefit = totalTax * 0.2;
      totalTax = totalTax - reinvestmentBenefit;
    }
  }
  
  // Neto después de impuestos
  const netAfterTax = salePrice - totalTax;
  
  // Tipo efectivo
  const effectiveTaxRate = capitalGain > 0 ? (totalTax / capitalGain) : 0;
  
  return {
    salePrice,
    acquisitionCost,
    capitalGain,
    taxableGain,
    taxRate,
    totalTax,
    netAfterTax,
    reinvestmentBenefit,
    effectiveTaxRate
  };
};
