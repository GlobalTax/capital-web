// ============= MARKETING METRICS HOOK =============
// Hook optimizado para métricas de marketing

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { supabaseApi } from '@/core/data/api/supabase-client';
import { marketingMetricsService } from '@/core/services/marketing-metrics.service';
import { performanceMonitor } from '@/shared/services/performance-monitor.service';
import { QUERY_KEYS } from '@/shared/constants/query-keys';
import { APP_CONFIG } from '@/core/constants/app-config';
import { devLogger } from '@/utils/devLogger';
import type { MarketingMetrics } from '@/core/types';

export const useMarketingMetrics = () => {
  // Query unificada para obtener todos los datos
  const { data: rawData, isLoading, error } = useQuery({
    queryKey: [QUERY_KEYS.MARKETING_METRICS],
    queryFn: performanceMonitor.measureFunction(
      async () => {
        devLogger.info('Fetching unified marketing data', undefined, 'marketing', 'useMarketingMetrics');
        
        try {
          const data = await supabaseApi.getUnifiedMarketingData();
          return data;
        } catch (error) {
          devLogger.error('Error fetching unified marketing data', error, 'marketing', 'useMarketingMetrics');
          throw error;
        }
      },
      'marketing-metrics-fetch',
      'api',
      { component: 'useMarketingMetrics' }
    ),
    staleTime: APP_CONFIG.PERFORMANCE.QUERY_STALE_TIME,
    gcTime: APP_CONFIG.PERFORMANCE.QUERY_GC_TIME,
    refetchOnWindowFocus: false,
    retry: APP_CONFIG.PERFORMANCE.QUERY_RETRY_COUNT
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