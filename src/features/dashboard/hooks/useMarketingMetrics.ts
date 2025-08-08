// ============= MARKETING METRICS HOOK =============
// Hook optimizado para métricas de marketing

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { supabaseApi } from '@/core/data/api/supabase-client';
import { marketingMetricsService } from '@/core/services/marketing-metrics.service';
import { performanceMonitor } from '@/utils/performanceMonitor';
import { QUERY_KEYS } from '@/shared/constants/query-keys';
import { APP_CONFIG } from '@/core/constants/app-config';
import { devLogger } from '@/utils/devLogger';
import type { MarketingMetrics } from '@/core/types';

export const useMarketingMetrics = () => {
  // Query unificada para obtener todos los datos
  const { data: rawData, isLoading, error } = useQuery({
    queryKey: [QUERY_KEYS.MARKETING_METRICS],
    queryFn: async () => {
      const startTime = performance.now();
      devLogger.info('Fetching unified marketing data', undefined, 'marketing', 'useMarketingMetrics');
      
      try {
        const data = await supabaseApi.getUnifiedMarketingData();
        const duration = performance.now() - startTime;
        performanceMonitor.record('marketing-metrics-fetch', duration, 'api');
        return data;
      } catch (error) {
        const duration = performance.now() - startTime;
        performanceMonitor.record('marketing-metrics-error', duration, 'api');
        devLogger.error('Error fetching unified marketing data', error, 'marketing', 'useMarketingMetrics');
        throw error;
      }
    },
    staleTime: APP_CONFIG.PERFORMANCE.QUERY_STALE_TIME,
    gcTime: APP_CONFIG.PERFORMANCE.QUERY_GC_TIME,
    refetchOnWindowFocus: false,
    retry: APP_CONFIG.PERFORMANCE.QUERY_RETRY_COUNT
  });

  // Memoizar el cálculo de métricas
  const metrics = useMemo((): MarketingMetrics | null => {
    if (!rawData) return null;
    
    return marketingMetricsService.calculateMetrics(rawData as any);
  }, [rawData]);

  return {
    metrics,
    isLoading,
    error,
    rawData
  };
};