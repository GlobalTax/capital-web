
import { CompanyData, ValuationResult, SectorMultiple } from '@/types/valuation';

export const calculateCompanyValuation = async (
  companyData: CompanyData, 
  sectorMultiples: SectorMultiple[]
): Promise<ValuationResult> => {
  // Simular tiempo de cálculo
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Usar valores por defecto si no hay datos suficientes
  const industryToUse = companyData.industry || 'servicios';
  const employeeRangeToUse = companyData.employeeRange || '2-5';
  const ebitdaToUse = companyData.ebitda || 100000; // EBITDA por defecto de 100k

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
      ebitda_multiple: 3.5, // Múltiplo por defecto
      revenue_multiple: 1.0,
      description: 'Valores estimados'
    };
  }

  // Calcular valoración usando solo múltiplo EBITDA
  const ebitdaValuation = ebitdaToUse * sectorData.ebitda_multiple;

  // Valoración final basada únicamente en EBITDA
  const finalValuation = Math.round(ebitdaValuation);
  
  const valuationResult: ValuationResult = {
    ebitdaMultiple: Math.round(ebitdaValuation),
    finalValuation,
    valuationRange: {
      min: Math.round(finalValuation * 0.8),
      max: Math.round(finalValuation * 1.2)
    },
    multiples: {
      ebitdaMultipleUsed: sectorData.ebitda_multiple
    }
  };

  return valuationResult;
};
