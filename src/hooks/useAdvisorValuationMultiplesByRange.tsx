import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

export interface AdvisorMultipleByRange {
  id: string;
  sector_name: string;
  revenue_range_min: number;
  revenue_range_max: number | null;
  revenue_multiple: number;
  ebitda_range_min: number;
  ebitda_range_max: number | null;
  ebitda_multiple: number;
  net_profit_range_min: number;
  net_profit_range_max: number | null;
  net_profit_multiple: number;
  description?: string;
  display_order: number;
  is_active: boolean;
}

export const useAdvisorValuationMultiplesByRange = () => {
  const [ranges, setRanges] = useState<AdvisorMultipleByRange[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRanges();
  }, []);

  const fetchRanges = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('advisor_valuation_multiples_by_range')
        .select('*')
        .eq('is_active', true)
        .order('sector_name')
        .order('display_order');

      if (error) {
        logger.error('Error fetching advisor ranges', error);
        setError('Error al cargar los rangos de múltiplos');
        return;
      }

      setRanges(data || []);
      setError(null);
      
      logger.info('Advisor ranges loaded successfully', { count: data?.length || 0 });
    } catch (err) {
      logger.error('Error loading advisor ranges', err as Error);
      setError('Error al cargar los rangos de múltiplos');
    } finally {
      setIsLoading(false);
    }
  };

  const getMultipleForValue = (
    sector: string,
    revenue: number,
    ebitda: number,
    netProfit: number
  ): { 
    revenueMultiple: number | null;
    ebitdaMultiple: number | null;
    netProfitMultiple: number | null;
  } => {
    const sectorRanges = ranges.filter(
      r => r.sector_name.toLowerCase() === sector.toLowerCase()
    );

    if (sectorRanges.length === 0) {
      return { revenueMultiple: null, ebitdaMultiple: null, netProfitMultiple: null };
    }

    // Buscar múltiplo de facturación
    const revenueRange = sectorRanges.find(r => 
      revenue >= r.revenue_range_min && 
      (r.revenue_range_max === null || revenue < r.revenue_range_max)
    );

    // Buscar múltiplo de EBITDA
    const ebitdaRange = sectorRanges.find(r =>
      ebitda >= r.ebitda_range_min &&
      (r.ebitda_range_max === null || ebitda < r.ebitda_range_max)
    );

    // Buscar múltiplo de Resultado Neto
    const netProfitRange = sectorRanges.find(r =>
      netProfit >= r.net_profit_range_min &&
      (r.net_profit_range_max === null || netProfit < r.net_profit_range_max)
    );

    logger.info('Range multiples found', {
      sector,
      revenue,
      ebitda,
      netProfit,
      revenueMultiple: revenueRange?.revenue_multiple,
      ebitdaMultiple: ebitdaRange?.ebitda_multiple,
      netProfitMultiple: netProfitRange?.net_profit_multiple
    });

    return {
      revenueMultiple: revenueRange?.revenue_multiple || null,
      ebitdaMultiple: ebitdaRange?.ebitda_multiple || null,
      netProfitMultiple: netProfitRange?.net_profit_multiple || null
    };
  };

  return {
    ranges,
    isLoading,
    error,
    getMultipleForValue,
    refetch: fetchRanges
  };
};
