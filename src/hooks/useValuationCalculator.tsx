
import { useState, useCallback } from 'react';
import { useMAErrorHandler } from './useMAErrorHandler';
import { 
  ValuationError, 
  FinancialDataError, 
  SectorMultipleError,
  BusinessRuleError 
} from '@/types/errorTypes';
import { supabase } from '@/integrations/supabase/client';

interface ValuationData {
  companyName: string;
  contactName: string;
  email: string;
  phone?: string;
  industry: string;
  employeeRange: string;
  revenue: number;
  ebitda: number;
  netProfitMargin: number;
  growthRate: number;
  yearsOfOperation: number;
  competitiveAdvantage?: string;
  ownershipParticipation?: string;
  cif?: string;
  location?: string;
}

interface ValuationResult {
  finalValuation: number;
  ebitdaMultipleUsed: number;
  valuationRangeMin: number;
  valuationRangeMax: number;
}

interface UseValuationCalculatorReturn {
  isLoading: boolean;
  calculateValuation: (data: ValuationData) => Promise<ValuationResult | null>;
  validateFinancialData: (data: Partial<ValuationData>) => Promise<void>;
  getSectorMultiple: (sector: string, employeeRange: string) => Promise<number>;
}

export const useValuationCalculator = (): UseValuationCalculatorReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const { 
    handleValuationError,
    handleFinancialDataError,
    handleSectorMultipleError,
    handleBusinessRuleError,
    createValuationError,
    createFinancialDataError,
    createSectorMultipleError
  } = useMAErrorHandler();

  const validateFinancialData = useCallback(async (data: Partial<ValuationData>) => {
    // Validar revenue
    if (data.revenue !== undefined) {
      if (data.revenue < 0) {
        throw createFinancialDataError(
          'Los ingresos no pueden ser negativos',
          'revenue',
          { min: 0, max: Number.MAX_SAFE_INTEGER },
          data.revenue
        );
      }
      if (data.revenue > 1000000000) {
        throw createFinancialDataError(
          'Los ingresos parecen excesivamente altos',
          'revenue',
          { min: 0, max: 1000000000 },
          data.revenue
        );
      }
    }

    // Validar EBITDA
    if (data.ebitda !== undefined && data.revenue !== undefined) {
      const ebitdaMargin = (data.ebitda / data.revenue) * 100;
      if (ebitdaMargin < -50) {
        throw createFinancialDataError(
          'El margen EBITDA parece demasiado bajo',
          'ebitda',
          { min: -50, max: 100 },
          ebitdaMargin
        );
      }
      if (ebitdaMargin > 80) {
        throw createFinancialDataError(
          'El margen EBITDA parece demasiado alto',
          'ebitda',
          { min: -50, max: 80 },
          ebitdaMargin
        );
      }
    }

    // Validar margen de beneficio neto
    if (data.netProfitMargin !== undefined) {
      if (data.netProfitMargin < -100 || data.netProfitMargin > 100) {
        throw createFinancialDataError(
          'El margen de beneficio neto debe estar entre -100% y 100%',
          'netProfitMargin',
          { min: -100, max: 100 },
          data.netProfitMargin
        );
      }
    }

    // Validar tasa de crecimiento
    if (data.growthRate !== undefined) {
      if (data.growthRate < -100) {
        throw createFinancialDataError(
          'La tasa de crecimiento no puede ser menor a -100%',
          'growthRate',
          { min: -100, max: 1000 },
          data.growthRate
        );
      }
      if (data.growthRate > 1000) {
        throw createFinancialDataError(
          'La tasa de crecimiento parece excesivamente alta',
          'growthRate',
          { min: -100, max: 1000 },
          data.growthRate
        );
      }
    }

    // Validar años de operación
    if (data.yearsOfOperation !== undefined) {
      if (data.yearsOfOperation < 0) {
        throw createFinancialDataError(
          'Los años de operación no pueden ser negativos',
          'yearsOfOperation',
          { min: 0, max: 200 },
          data.yearsOfOperation
        );
      }
      if (data.yearsOfOperation > 200) {
        throw createFinancialDataError(
          'Los años de operación parecen excesivos',
          'yearsOfOperation',
          { min: 0, max: 200 },
          data.yearsOfOperation
        );
      }
    }
  }, [createFinancialDataError]);

  const getSectorMultiple = useCallback(async (sector: string, employeeRange: string): Promise<number> => {
    try {
      const { data: multiples, error } = await supabase
        .from('sector_multiples')
        .select('ebitda_multiple')
        .eq('sector_name', sector)
        .eq('employee_range', employeeRange)
        .eq('is_active', true)
        .single();

      if (error) {
        // Intentar obtener múltiple genérico del sector
        const { data: genericMultiple, error: genericError } = await supabase
          .from('sector_multiples')
          .select('ebitda_multiple')
          .eq('sector_name', sector)
          .is('employee_range', null)
          .eq('is_active', true)
          .single();

        if (genericError) {
          throw createSectorMultipleError(
            `No se encontraron múltiplos para el sector ${sector}`,
            sector,
            'ebitda_multiple'
          );
        }

        return genericMultiple.ebitda_multiple;
      }

      return multiples.ebitda_multiple;
    } catch (error) {
      if (error instanceof SectorMultipleError) {
        handleSectorMultipleError(error, { 
          component: 'ValuationCalculator',
          sector,
          metadata: { employeeRange }
        });
      }
      // Fallback a múltiple genérico
      return 8; // Múltiple conservador por defecto
    }
  }, [createSectorMultipleError, handleSectorMultipleError]);

  const calculateValuation = useCallback(async (data: ValuationData): Promise<ValuationResult | null> => {
    setIsLoading(true);
    
    try {
      // Validar datos financieros
      await validateFinancialData(data);

      // Validaciones de reglas de negocio
      if (data.ebitda === 0) {
        throw new BusinessRuleError(
          'No se puede valorar una empresa con EBITDA cero',
          'ebitda_zero',
          { revenue: data.revenue, ebitda: data.ebitda }
        );
      }

      if (data.ebitda < 0 && data.revenue < 1000000) {
        throw new BusinessRuleError(
          'Empresas pequeñas con EBITDA negativo requieren análisis especial',
          'small_negative_ebitda',
          { revenue: data.revenue, ebitda: data.ebitda, employeeRange: data.employeeRange }
        );
      }

      // Obtener múltiplo sectorial
      const sectorMultiple = await getSectorMultiple(data.industry, data.employeeRange);
      
      // Calcular valoración base
      let baseValuation = data.ebitda * sectorMultiple;
      
      if (baseValuation <= 0) {
        throw createValuationError(
          'La valoración base no puede ser negativa o cero',
          'base_calculation',
          { ebitda: data.ebitda, sectorMultiple, baseValuation }
        );
      }

      // Aplicar ajustes por crecimiento
      const growthAdjustment = Math.max(0.8, Math.min(1.5, 1 + (data.growthRate / 100) * 0.3));
      const adjustedValuation = baseValuation * growthAdjustment;

      // Aplicar ajustes por años de operación
      const maturityAdjustment = data.yearsOfOperation < 3 ? 0.8 : 
                                data.yearsOfOperation < 10 ? 1.0 : 1.1;
      
      const finalValuation = adjustedValuation * maturityAdjustment;

      // Calcular rangos
      const valuationRangeMin = finalValuation * 0.8;
      const valuationRangeMax = finalValuation * 1.2;

      const result: ValuationResult = {
        finalValuation,
        ebitdaMultipleUsed: sectorMultiple,
        valuationRangeMin,
        valuationRangeMax
      };

      // Guardar en base de datos
      await saveValuationData(data, result);

      return result;

    } catch (error) {
      if (error instanceof ValuationError) {
        handleValuationError(error, {
          component: 'ValuationCalculator',
          sector: data.industry,
          transactionType: 'valuation',
          dealSize: data.revenue,
          companyId: data.companyName
        });
      } else if (error instanceof FinancialDataError) {
        handleFinancialDataError(error, {
          component: 'ValuationCalculator',
          companyId: data.companyName
        });
      } else if (error instanceof BusinessRuleError) {
        handleBusinessRuleError(error, {
          component: 'ValuationCalculator',
          companyId: data.companyName,
          sector: data.industry
        });
      }

      return null;
    } finally {
      setIsLoading(false);
    }
  }, [validateFinancialData, getSectorMultiple, handleValuationError, handleFinancialDataError, handleBusinessRuleError, createValuationError]);

  return {
    isLoading,
    calculateValuation,
    validateFinancialData,
    getSectorMultiple
  };
};

// Función auxiliar para guardar datos de valoración
const saveValuationData = async (data: ValuationData, result: ValuationResult): Promise<void> => {
  try {
    const { error } = await supabase
      .from('company_valuations')
      .insert([{
        company_name: data.companyName,
        contact_name: data.contactName,
        email: data.email,
        phone: data.phone,
        industry: data.industry,
        employee_range: data.employeeRange,
        revenue: data.revenue,
        ebitda: data.ebitda,
        net_profit_margin: data.netProfitMargin,
        growth_rate: data.growthRate,
        years_of_operation: data.yearsOfOperation,
        competitive_advantage: data.competitiveAdvantage,
        ownership_participation: data.ownershipParticipation,
        cif: data.cif,
        location: data.location,
        final_valuation: result.finalValuation,
        ebitda_multiple_used: result.ebitdaMultipleUsed,
        valuation_range_min: result.valuationRangeMin,
        valuation_range_max: result.valuationRangeMax,
        user_agent: navigator.userAgent
      }]);

    if (error) {
      throw new Error(`Error al guardar valoración: ${error.message}`);
    }
  } catch (error) {
    console.error('Error guardando valoración:', error);
    // No lanzar error para no interrumpir el flujo principal
  }
};
