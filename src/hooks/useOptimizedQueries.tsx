import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

// Configuraciones de cache optimizadas por tipo de datos
export const QUERY_CONFIGS = {
  // Datos críticos que cambian frecuentemente
  critical: {
    staleTime: 30000, // 30 segundos
    gcTime: 60000, // 1 minuto
    refetchOnWindowFocus: true,
    retry: 3,
  },
  // Datos importantes que cambian moderadamente
  important: {
    staleTime: 120000, // 2 minutos
    gcTime: 300000, // 5 minutos
    refetchOnWindowFocus: false,
    retry: 2,
  },
  // Datos menos críticos o estáticos
  static: {
    staleTime: 600000, // 10 minutos
    gcTime: 1800000, // 30 minutos
    refetchOnWindowFocus: false,
    retry: 1,
  },
  // Datos que prácticamente no cambian
  persistent: {
    staleTime: 3600000, // 1 hora
    gcTime: 86400000, // 24 horas
    refetchOnWindowFocus: false,
    retry: 1,
  }
} as const;

// Hook para invalidación inteligente de queries
export const useSmartInvalidation = () => {
  const queryClient = useQueryClient();

  const invalidateRelatedQueries = useCallback((
    baseKey: string,
    delay: number = 1000
  ) => {
    setTimeout(() => {
      // Invalidar queries relacionadas de forma inteligente
      switch (baseKey) {
        case 'leads':
          queryClient.invalidateQueries({ queryKey: ['hotLeads'] });
          queryClient.invalidateQueries({ queryKey: ['allLeads'] });
          queryClient.invalidateQueries({ queryKey: ['leadAlerts'] });
          break;
        case 'scoring':
          queryClient.invalidateQueries({ queryKey: ['leadScoringRules'] });
          queryClient.invalidateQueries({ queryKey: ['hotLeads'] });
          break;
        case 'alerts':
          queryClient.invalidateQueries({ queryKey: ['leadAlerts'] });
          break;
        default:
          queryClient.invalidateQueries({ queryKey: [baseKey] });
      }
    }, delay);
  }, [queryClient]);

  const prefetchRelatedQueries = useCallback(async (baseKey: string) => {
    // Prefetch datos que probablemente se necesitarán
    switch (baseKey) {
      case 'hotLeads':
        await queryClient.prefetchQuery({
          queryKey: ['leadAlerts'],
          staleTime: QUERY_CONFIGS.important.staleTime,
        });
        break;
      case 'dashboard':
        await Promise.all([
          queryClient.prefetchQuery({ queryKey: ['hotLeads'] }),
          queryClient.prefetchQuery({ queryKey: ['leadAlerts'] }),
        ]);
        break;
    }
  }, [queryClient]);

  return {
    invalidateRelatedQueries,
    prefetchRelatedQueries,
  };
};

// Hook para optimizar queries con retry logic inteligente
export const useOptimizedQuery = <T,>(
  queryKey: (string | number)[],
  queryFn: () => Promise<T>,
  configType: keyof typeof QUERY_CONFIGS = 'important',
  customOptions: any = {}
) => {
  const config = QUERY_CONFIGS[configType];
  
  return useQuery({
    queryKey,
    queryFn,
    ...config,
    retry: (failureCount, error: any) => {
      // No reintentar si es un error de permisos
      if (error?.code === 'PGRST301' || error?.message?.includes('row-level security')) {
        return false;
      }
      // Retry logic basado en el tipo de configuración
      return failureCount < config.retry;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    ...customOptions,
  });
};

// Hook para gestión de cache persistence
export const useCachePersistence = () => {
  const queryClient = useQueryClient();

  const persistCriticalData = useCallback(() => {
    // Persistir datos críticos en localStorage
    const criticalQueries = ['hotLeads', 'leadAlerts'];
    
    criticalQueries.forEach(queryKey => {
      const data = queryClient.getQueryData([queryKey]);
      if (data) {
        localStorage.setItem(`query_cache_${queryKey}`, JSON.stringify({
          data,
          timestamp: Date.now(),
        }));
      }
    });
  }, [queryClient]);

  const restoreCriticalData = useCallback(() => {
    // Restaurar datos críticos desde localStorage
    const criticalQueries = ['hotLeads', 'leadAlerts'];
    
    criticalQueries.forEach(queryKey => {
      const cached = localStorage.getItem(`query_cache_${queryKey}`);
      if (cached) {
        try {
          const { data, timestamp } = JSON.parse(cached);
          // Solo restaurar si los datos tienen menos de 5 minutos
          if (Date.now() - timestamp < 300000) {
            queryClient.setQueryData([queryKey], data);
          }
        } catch (error) {
          console.warn(`Failed to restore cache for ${queryKey}:`, error);
        }
      }
    });
  }, [queryClient]);

  const clearExpiredCache = useCallback(() => {
    // Limpiar cache expirado
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('query_cache_')) {
        try {
          const cached = localStorage.getItem(key);
          if (cached) {
            const { timestamp } = JSON.parse(cached);
            // Eliminar cache de más de 1 hora
            if (Date.now() - timestamp > 3600000) {
              localStorage.removeItem(key);
            }
          }
        } catch (error) {
          localStorage.removeItem(key);
        }
      }
    });
  }, []);

  return {
    persistCriticalData,
    restoreCriticalData,
    clearExpiredCache,
  };
};