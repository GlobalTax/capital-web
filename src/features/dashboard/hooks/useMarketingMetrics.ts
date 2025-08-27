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
          devLogger.info('Successfully fetched marketing data', { 
            contactLeads: data.contactLeads.length,
            leadScores: data.leadScores.length,
            companyValuations: data.companyValuations.length,
            blogAnalytics: data.blogAnalytics.length,
            blogPostMetrics: data.blogPostMetrics.length,
            leadBehavior: data.leadBehavior.length
          }, 'marketing', 'useMarketingMetrics');
          return data;
        } catch (error) {
          devLogger.error('Error fetching unified marketing data', error, 'marketing', 'useMarketingMetrics');
          // Log specific error details for debugging
          if (error instanceof Error) {
            devLogger.error('Error details', { 
              message: error.message, 
              stack: error.stack 
            }, 'marketing', 'useMarketingMetrics');
          }
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
    retry: (failureCount, error) => {
      // Don't retry RLS permission errors
      if (error?.message?.includes('permission') || error?.message?.includes('policy')) {
        devLogger.warn('RLS permission error - not retrying', { error: error.message }, 'marketing', 'useMarketingMetrics');
        return false;
      }
      return failureCount < APP_CONFIG.PERFORMANCE.QUERY_RETRY_COUNT;
    }
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