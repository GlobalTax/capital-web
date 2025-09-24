// ============= OPTIMIZED QUERY HOOK =============
// Hook optimizado para queries con caching inteligente

import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { logger } from '@/utils/conditionalLogger';

interface OptimizedQueryConfig {
  staleTime?: number;
  cacheTime?: number;
  refetchOnWindowFocus?: boolean;
  retry?: number | boolean;
  enabled?: boolean;
}

const QUERY_CONFIGS = {
  static: {
    staleTime: 1000 * 60 * 30, // 30 minutos
    cacheTime: 1000 * 60 * 60, // 1 hora
    refetchOnWindowFocus: false,
    retry: 1
  },
  dynamic: {
    staleTime: 1000 * 60 * 5, // 5 minutos
    cacheTime: 1000 * 60 * 15, // 15 minutos
    refetchOnWindowFocus: false,
    retry: 2
  },
  realtime: {
    staleTime: 1000 * 30, // 30 segundos
    cacheTime: 1000 * 60 * 5, // 5 minutos
    refetchOnWindowFocus: true,
    retry: 3
  }
} as const;

export function useOptimizedQuery<T = unknown>(
  queryKey: (string | number)[],
  queryFn: () => Promise<T>,
  configType: keyof typeof QUERY_CONFIGS = 'dynamic',
  customOptions?: Partial<UseQueryOptions<T>>
) {
  const config = QUERY_CONFIGS[configType];
  const startTime = performance.now();

  const query = useQuery<T>({
    queryKey,
    queryFn: async () => {
      try {
        const result = await queryFn();
        const duration = performance.now() - startTime;
        
        // Solo log si es muy lento
        if (duration > 1000) {
          logger.warn(`Slow query: ${queryKey.join('.')} took ${duration.toFixed(0)}ms`);
        }
        
        return result;
      } catch (error) {
        const duration = performance.now() - startTime;
        logger.error(`Query failed: ${queryKey.join('.')} after ${duration.toFixed(0)}ms`, error);
        throw error;
      }
    },
    ...config,
    ...customOptions,
    retry: (failureCount, error: any) => {
      // No reintentar errores de permisos o 404
      if (error?.status === 404 || error?.status === 403) return false;
      return failureCount < (config.retry as number);
    }
  });

  return query;
}