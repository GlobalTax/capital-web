
import { useQuery, UseQueryOptions } from '@tanstack/react-query';

// Configuraciones optimizadas por tipo de dato
export const QUERY_CONFIGS = {
  // Datos críticos que cambian frecuentemente
  critical: {
    staleTime: 30 * 1000, // 30 segundos
    gcTime: 2 * 60 * 1000, // 2 minutos
    refetchOnWindowFocus: true,
    refetchInterval: 60 * 1000, // 1 minuto
    retry: 3
  },
  // Datos importantes que cambian moderadamente
  important: {
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    refetchOnWindowFocus: false,
    retry: 2
  },
  // Datos estáticos que raramente cambian
  static: {
    staleTime: 30 * 60 * 1000, // 30 minutos
    gcTime: 24 * 60 * 60 * 1000, // 24 horas
    refetchOnWindowFocus: false,
    retry: 1
  },
  // Configuración persistente para roles y permisos
  persistent: {
    staleTime: 60 * 60 * 1000, // 1 hora
    gcTime: 24 * 60 * 60 * 1000, // 24 horas
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1
  }
};

// Hook optimizado que aplica configuraciones según el tipo
export function useOptimizedQuery<T>(
  queryKey: (string | number)[],
  queryFn: () => Promise<T>,
  configType: keyof typeof QUERY_CONFIGS = 'important',
  overrides?: Partial<UseQueryOptions<T>>
) {
  const config = QUERY_CONFIGS[configType];
  
  return useQuery({
    queryKey,
    queryFn,
    ...config,
    ...overrides,
    // Retry logic inteligente basado en tipo de error
    retry: (failureCount, error: any) => {
      if (error?.code === 'PGRST301' || error?.message?.includes('row-level security')) {
        return false; // No reintentar errores de permisos
      }
      return failureCount < (config.retry || 1);
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
  });
}

// Hook para invalidaciones inteligentes con debouncing
export function useSmartInvalidation() {
  const queryClient = useQueryClient();
  const invalidationTimers = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const invalidateRelatedQueries = useCallback((
    pattern: string, 
    delay: number = 1000
  ) => {
    // Cancelar invalidación previa si existe
    const existingTimer = invalidationTimers.current.get(pattern);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Programar nueva invalidación con debouncing
    const timer = setTimeout(() => {
      queryClient.invalidateQueries({ 
        predicate: (query) => 
          query.queryKey.some(key => 
            typeof key === 'string' && key.includes(pattern)
          )
      });
      invalidationTimers.current.delete(pattern);
    }, delay);

    invalidationTimers.current.set(pattern, timer);
  }, [queryClient]);

  return { invalidateRelatedQueries };
}
