import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { advisorMultiplesCache } from '@/utils/cache';
import { logger } from '@/utils/logger';

export interface AdvisorMultiple {
  id: string;
  sector_name: string;
  revenue_multiple_min: number;
  revenue_multiple_max: number;
  revenue_multiple_median: number;
  ebitda_multiple_min: number;
  ebitda_multiple_max: number;
  ebitda_multiple_median: number;
  net_profit_multiple_min: number;
  net_profit_multiple_max: number;
  net_profit_multiple_median: number;
  description?: string;
  display_order: number;
  is_active: boolean;
}

export const useAdvisorValuationMultiples = () => {
  const [multiples, setMultiples] = useState<AdvisorMultiple[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMultiples();
  }, []);

  const fetchMultiples = async () => {
    try {
      setIsLoading(true);
      
      // Intentar obtener del cache primero
      const cacheKey = 'advisor_valuation_multiples';
      const cachedData = advisorMultiplesCache.get<AdvisorMultiple[]>(cacheKey);
      
      if (cachedData) {
        setMultiples(cachedData);
        setError(null);
        setIsLoading(false);
        logger.debug('Advisor multiples loaded from cache', undefined, { context: 'valuation', component: 'useAdvisorValuationMultiples' });
        return;
      }

      const { data, error } = await supabase
        .from('advisor_valuation_multiples')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (error) {
        logger.error('Error fetching advisor multiples', error, { context: 'valuation', component: 'useAdvisorValuationMultiples' });
        setError('Error al cargar los múltiplos de asesores');
        return;
      }

      const multiplesData = data || [];
      
      // Guardar en cache
      advisorMultiplesCache.set(cacheKey, multiplesData);
      
      setMultiples(multiplesData);
      setError(null);
      
      logger.info('Advisor multiples loaded successfully', { count: multiplesData.length }, { context: 'valuation', component: 'useAdvisorValuationMultiples' });
    } catch (err) {
      logger.error('Error loading advisor multiples', err as Error, { context: 'valuation', component: 'useAdvisorValuationMultiples' });
      setError('Error al cargar los múltiplos de asesores');
    } finally {
      setIsLoading(false);
    }
  };

  const getMultipleBySector = (sector: string): AdvisorMultiple | null => {
    const multiple = multiples.find(
      m => m.sector_name.toLowerCase() === sector.toLowerCase()
    ) || null;
    
    if (multiple) {
      logger.debug('Advisor multiple found for sector', { sector, multiple: multiple.sector_name }, { context: 'valuation', component: 'useAdvisorValuationMultiples' });
    }
    
    return multiple;
  };

  const getDefaultMultiples = () => {
    // Valores por defecto si no hay datos en BD
    return {
      revenue: 1.0,
      ebitda: 5.0,
      netProfit: 8.0
    };
  };

  return {
    multiples,
    isLoading,
    error,
    getMultipleBySector,
    getDefaultMultiples,
    refetch: fetchMultiples
  };
};
