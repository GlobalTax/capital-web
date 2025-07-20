
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { sectorMultiplesCache } from '@/utils/cache';
import { logger } from '@/utils/logger';

interface ValuationMultiple {
  id: string;
  sector_name: string;
  multiple_range: string;
  median_multiple: string;
  description?: string;
  display_order: number;
  is_active: boolean;
}

export const useValuationMultiples = () => {
  const [multiples, setMultiples] = useState<ValuationMultiple[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMultiples();
  }, []);

  const fetchMultiples = async () => {
    try {
      setIsLoading(true);
      
      // Intentar obtener del cache primero
      const cacheKey = 'valuation_multiples';
      const cachedData = sectorMultiplesCache.get<ValuationMultiple[]>(cacheKey);
      
      if (cachedData) {
        setMultiples(cachedData);
        setError(null);
        setIsLoading(false);
        logger.debug('Valuation multiples loaded from cache', undefined, { context: 'valuation', component: 'useValuationMultiples' });
        return;
      }

      const { data, error } = await supabase
        .from('sector_valuation_multiples')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (error) {
        logger.error('Error fetching valuation multiples', error, { context: 'valuation', component: 'useValuationMultiples' });
        setError('Error al cargar los múltiplos');
        return;
      }

      const multiplesData = data || [];
      
      // Guardar en cache
      sectorMultiplesCache.set(cacheKey, multiplesData);
      
      setMultiples(multiplesData);
      setError(null);
      
      logger.info('Valuation multiples loaded successfully', { count: multiplesData.length }, { context: 'valuation', component: 'useValuationMultiples' });
    } catch (err) {
      logger.error('Error loading valuation multiples', err as Error, { context: 'valuation', component: 'useValuationMultiples' });
      setError('Error al cargar los múltiplos');
    } finally {
      setIsLoading(false);
    }
  };

  const getMultipleBySector = (sector: string): ValuationMultiple | null => {
    const multiple = multiples.find(
      m => m.sector_name.toLowerCase() === sector.toLowerCase()
    ) || null;
    
    if (multiple) {
      logger.debug('Multiple found for sector', { sector, multiple: multiple.sector_name }, { context: 'valuation', component: 'useValuationMultiples' });
    }
    
    return multiple;
  };

  const getDefaultMultiple = (): number => {
    // Si no hay múltiplos en la base de datos, usar un valor por defecto
    if (multiples.length === 0) return 5.0;
    
    // Intentar extraer el número de la mediana del primer múltiplo
    const firstMultiple = multiples[0];
    const medianValue = parseFloat(firstMultiple.median_multiple.replace(/[^\d.]/g, ''));
    const defaultValue = isNaN(medianValue) ? 5.0 : medianValue;
    
    logger.debug('Default multiple calculated', { defaultValue }, { context: 'valuation', component: 'useValuationMultiples' });
    return defaultValue;
  };

  return {
    multiples,
    isLoading,
    error,
    getMultipleBySector,
    getDefaultMultiple,
    refetch: fetchMultiples
  };
};
