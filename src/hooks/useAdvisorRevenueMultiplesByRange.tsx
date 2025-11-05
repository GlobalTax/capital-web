import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

export interface AdvisorRevenueMultiple {
  id: string;
  sector_name: string;
  range_min: number;
  range_max: number | null;
  multiple: number;
  description?: string;
  display_order: number;
  is_active: boolean;
}

export const useAdvisorRevenueMultiplesByRange = () => {
  const [ranges, setRanges] = useState<AdvisorRevenueMultiple[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRanges();
  }, []);

  const fetchRanges = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('advisor_revenue_multiples_by_range')
        .select('*')
        .eq('is_active', true)
        .order('sector_name')
        .order('display_order');

      if (error) {
        logger.error('Error fetching revenue ranges', error);
        setError('Error al cargar los rangos de facturación');
        return;
      }

      setRanges(data || []);
      setError(null);
      
      logger.info('Revenue ranges loaded successfully', { count: data?.length || 0 });
    } catch (err) {
      logger.error('Error loading revenue ranges', err as Error);
      setError('Error al cargar los rangos de facturación');
    } finally {
      setIsLoading(false);
    }
  };

  const getMultipleForValue = (sector: string, revenue: number): number | null => {
    // Validar input
    if (!Number.isFinite(revenue) || revenue < 0) {
      logger.warn('Invalid revenue for multiple calculation', { sector, revenue });
      return null;
    }

    const sectorRanges = ranges.filter(
      r => r.sector_name.toLowerCase() === sector.toLowerCase()
    );

    if (sectorRanges.length === 0) {
      logger.info('No ranges found for sector', { sector });
      return null;
    }

    const matchingRange = sectorRanges.find(r => 
      revenue >= r.range_min && 
      (r.range_max === null || revenue < r.range_max)
    );

    const multiple = matchingRange?.multiple || null;

    // Validar que el múltiplo sea razonable
    if (multiple !== null && (!Number.isFinite(multiple) || multiple <= 0 || multiple > 100)) {
      logger.error('Invalid multiple found in database', new Error(`Invalid multiple: ${multiple} for sector: ${sector}`));
      return null;
    }

    logger.info('Revenue multiple found', {
      sector,
      revenue,
      multiple
    });

    return multiple;
  };

  return {
    ranges,
    isLoading,
    error,
    getMultipleForValue,
    refetch: fetchRanges
  };
};
