
import { CompanyDataV2, ValuationResultV2, SectorMultiple } from '@/types/valuationV2';
import { calculateTaxImpact } from '@/utils/taxCalculation';

export const calculateCompanyValuationV2 = async (
  companyData: CompanyDataV2, 
  sectorMultiples: SectorMultiple[]
): Promise<ValuationResultV2> => {
  // Simular tiempo de cálculo
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Usar valores por defecto si no hay datos suficientes
  const industryToUse = companyData.industry || 'servicios';
  const employeeRangeToUse = companyData.employeeRange || '2-5';
  const ebitdaToUse = companyData.ebitda || 100000;

  // Buscar múltiplos del sector y rango de empleados seleccionados
  let sectorData = sectorMultiples.find(s => 
    s.sector_name === industryToUse && 
    s.employee_range === employeeRangeToUse
  );
  
  // Si no se encuentra, usar un múltiplo por defecto
  if (!sectorData) {
    console.log('No se encontraron múltiplos específicos, usando valores por defecto');
    sectorData = {
      sector_name: industryToUse,
      employee_range: employeeRangeToUse,
      ebitda_multiple: 3.5,
      revenue_multiple: 1.0,
      description: 'Valores estimados'
    };
  }

  // Calcular valoración usando solo múltiplo EBITDA
  const ebitdaValuation = ebitdaToUse * sectorData.ebitda_multiple;
  const finalValuation = Math.round(ebitdaValuation);
  
  // Calcular impacto fiscal
  const taxImpact = calculateTaxImpact(companyData, finalValuation);

  const valuationResult: ValuationResultV2 = {
    ebitdaMultiple: Math.round(ebitdaValuation),
    finalValuation,
    valuationRange: {
      min: Math.round(finalValuation * 0.8),
      max: Math.round(finalValuation * 1.2)
    },
    multiples: {
      ebitdaMultipleUsed: sectorData.ebitda_multiple
    },
    taxImpact
  };

  return valuationResult;
};
