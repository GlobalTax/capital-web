import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

export interface AdvisorNetProfitMultiple {
  id: string;
  sector_name: string;
  range_min: number;
  range_max: number | null;
  multiple: number;
  description?: string;
  display_order: number;
  is_active: boolean;
}

export const useAdvisorNetProfitMultiplesByRange = () => {
  const [ranges, setRanges] = useState<AdvisorNetProfitMultiple[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRanges();
  }, []);

  const fetchRanges = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('advisor_netprofit_multiples_by_range')
        .select('*')
        .eq('is_active', true)
        .order('sector_name')
        .order('display_order');

      if (error) {
        logger.error('Error fetching net profit ranges', error);
        setError('Error al cargar los rangos de resultado neto');
        return;
      }

      setRanges(data || []);
      setError(null);
      
      logger.info('Net profit ranges loaded successfully', { count: data?.length || 0 });
    } catch (err) {
      logger.error('Error loading net profit ranges', err as Error);
      setError('Error al cargar los rangos de resultado neto');
    } finally {
      setIsLoading(false);
    }
  };

  const getMultipleForValue = (sector: string, netProfit: number): number | null => {
    const sectorRanges = ranges.filter(
      r => r.sector_name.toLowerCase() === sector.toLowerCase()
    );

    if (sectorRanges.length === 0) {
      return null;
    }

    const matchingRange = sectorRanges.find(r => 
      netProfit >= r.range_min && 
      (r.range_max === null || netProfit < r.range_max)
    );

    logger.info('Net profit multiple found', {
      sector,
      netProfit,
      multiple: matchingRange?.multiple
    });

    return matchingRange?.multiple || null;
  };

  return {
    ranges,
    isLoading,
    error,
    getMultipleForValue,
    refetch: fetchRanges
  };
};
