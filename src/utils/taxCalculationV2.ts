
import { TaxSimulatorData, TaxCalculationResult } from '@/types/valuationV2';

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
  
  // Ganancia gravable (sin reducciones automáticas por años)
  let taxableGain = capitalGain;
  let taxRate = 0;
  let taxBreakdown: { description: string; amount: number; rate: number; }[] = [];
  
  if (simulatorData.taxpayerType === 'individual') {
    // PERSONAS FÍSICAS - Tarifa del ahorro (Ley 35/2006 IRPF)
    if (taxableGain <= 6000) {
      taxRate = 0.19;
      taxBreakdown.push({
        description: 'Tramo 1 (hasta 6.000€)',
        amount: taxableGain,
        rate: 19
      });
    } else if (taxableGain <= 50000) {
      const tramo1 = 6000 * 0.19;
      const tramo2 = (taxableGain - 6000) * 0.21;
      taxRate = (tramo1 + tramo2) / taxableGain;
      taxBreakdown.push(
        {
          description: 'Tramo 1 (hasta 6.000€)',
          amount: 6000,
          rate: 19
        },
        {
          description: 'Tramo 2 (6.000€ - 50.000€)',
          amount: taxableGain - 6000,
          rate: 21
        }
      );
    } else {
      const tramo1 = 6000 * 0.19;
      const tramo2 = 44000 * 0.21;
      const tramo3 = (taxableGain - 50000) * 0.23;
      taxRate = (tramo1 + tramo2 + tramo3) / taxableGain;
      taxBreakdown.push(
        {
          description: 'Tramo 1 (hasta 6.000€)',
          amount: 6000,
          rate: 19
        },
        {
          description: 'Tramo 2 (6.000€ - 50.000€)',
          amount: 44000,
          rate: 21
        },
        {
          description: 'Tramo 3 (más de 50.000€)',
          amount: taxableGain - 50000,
          rate: 23
        }
      );
    }
  } else {
    // SOCIEDADES - Ley 27/2014 del Impuesto sobre Sociedades
    if (simulatorData.currentTaxBase && simulatorData.currentTaxBase <= 1000000) {
      // PYME: 15% primeros 300K, 25% resto
      if (taxableGain <= 300000) {
        taxRate = 0.15;
        taxBreakdown.push({
          description: 'Tipo reducido PYME (hasta 300.000€)',
          amount: taxableGain,
          rate: 15
        });
      } else {
        const parte1 = 300000 * 0.15;
        const parte2 = (taxableGain - 300000) * 0.25;
        taxRate = (parte1 + parte2) / taxableGain;
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
      taxRate = 0.25;
      taxBreakdown.push({
        description: 'Tipo general sociedades',
        amount: taxableGain,
        rate: 25
      });
    }
  }
  
  // Calcular impuesto antes de reinversión
  let totalTax = taxableGain * taxRate;
  
  // Beneficio por reinversión (Art. 42 LIS - solo sociedades)
  let reinvestmentBenefit = 0;
  if (simulatorData.taxpayerType === 'company' && 
      simulatorData.reinvestmentPlan && 
      simulatorData.reinvestmentQualifies &&
      simulatorData.reinvestmentAmount >= capitalGain * 0.7) {
    // Exención de hasta el 100% si reinvierte el 70% o más
    reinvestmentBenefit = totalTax;
    totalTax = 0;
  }
  
  // Neto después de impuestos
  const netAfterTax = actualSalePrice - totalTax;
  
  // Tipo efectivo
  const effectiveTaxRate = capitalGain > 0 ? (totalTax / capitalGain) : 0;
  
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
    effectiveTaxRate,
    taxBreakdown
  };
};
