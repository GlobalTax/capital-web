// ============= MARKETING METRICS HOOK =============
// Hook optimizado para métricas de marketing

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { supabaseApi } from '@/core/data/api/supabase-client';
import { marketingMetricsService } from '@/core/services/marketing-metrics.service';
import { devLogger } from '@/utils/devLogger';
import type { MarketingMetrics } from '@/core/types';

export const useMarketingMetrics = () => {
  // Query unificada para obtener todos los datos
  const { data: rawData, isLoading, error } = useQuery({
    queryKey: ['marketing_metrics_unified'],
    queryFn: async () => {
      devLogger.info('Fetching unified marketing data', undefined, 'marketing', 'useMarketingMetrics');
      
      const startTime = performance.now();
      
      try {
        const data = await supabaseApi.getUnifiedMarketingData();
        
        const endTime = performance.now();
        devLogger.info(`Unified query completed in ${endTime - startTime}ms`, undefined, 'performance', 'useMarketingMetrics');
        
        return data;
      } catch (error) {
        devLogger.error('Error fetching unified marketing data', error, 'marketing', 'useMarketingMetrics');
        throw error;
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    refetchOnWindowFocus: false,
    retry: 2
  });

  // Memoizar el cálculo de métricas
  const metrics = useMemo((): MarketingMetrics | null => {
    if (!rawData) return null;
    
    return marketingMetricsService.calculateMetrics(rawData);
  }, [rawData]);

  return {
    metrics,
    isLoading,
    error,
    rawData
  };
};