
import { CompanyData, ValuationResult, SectorMultiple } from '@/types/valuation';
import { getSectorMultiplesByEbitda } from '@/utils/ebitdaMatrix';

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

  // Primero: intentar usar la matriz por EBITDA si aplica (EV/EBITDA)
  const byEbitda = getSectorMultiplesByEbitda(industryToUse, ebitdaToUse);
  if (byEbitda && byEbitda.metric === 'EV/EBITDA') {
    const avgMultiple = (byEbitda.low + byEbitda.high) / 2;
    const ebitdaValuation = ebitdaToUse * avgMultiple;
    const finalValuation = Math.round(ebitdaValuation);

    const valuationResult: ValuationResult = {
      ebitdaMultiple: Math.round(ebitdaValuation),
      finalValuation,
      valuationRange: {
        min: Math.round(ebitdaToUse * byEbitda.low),
        max: Math.round(ebitdaToUse * byEbitda.high)
      },
      multiples: {
        ebitdaMultipleUsed: avgMultiple
      }
    };

    return valuationResult;
  }

  // Fallback: usar múltiplos por sector y rango de empleados
  let sectorData = sectorMultiples.find(s => 
    s.sector_name === industryToUse && 
    s.employee_range === employeeRangeToUse
  );
  
  if (!sectorData) {
    console.log('No se encontraron múltiplos específicos, usando valores por defecto');
    sectorData = {
      sector_name: industryToUse,
      employee_range: employeeRangeToUse,
      ebitda_multiple: ebitdaToUse >= 1000000 ? 5.5 : 3.5, // Múltiplo por defecto ajustado por tamaño
      revenue_multiple: 1.0,
      description: 'Valores estimados'
    };
  }

  const ebitdaValuation = ebitdaToUse * sectorData.ebitda_multiple;
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
