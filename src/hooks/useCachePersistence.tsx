// ============= CACHE PERSISTENCE HOOK =============
// Hook optimizado para persistencia y gestión de cache

import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useRef } from 'react';
import { performanceMonitor } from '@/utils/unifiedPerformanceMonitor';

interface CacheStats {
  totalQueries: number;
  cachedQueries: number;
  hitRate: number;
  totalSize: number;
}

export const useCachePersistence = () => {
  const queryClient = useQueryClient();
  const persistenceRef = useRef<Map<string, any>>(new Map());

  const persistCriticalData = useCallback(async () => {
    const startTime = performance.now();
    
    try {
      const criticalQueries = ['hotLeads', 'leadAlerts', 'dashboard-metrics'];
      const persistedData: Record<string, any> = {};
      
      criticalQueries.forEach(queryKey => {
        const data = queryClient.getQueryData([queryKey]);
        if (data) {
          persistedData[queryKey] = data;
          persistenceRef.current.set(queryKey, data);
        }
      });

      // Simular persistencia en localStorage
      localStorage.setItem('critical-cache', JSON.stringify(persistedData));
      
      const duration = performance.now() - startTime;
      performanceMonitor.record('cache-persist', duration, 'database', { 
        queries: criticalQueries.length.toString() 
      });
      
      return true;
    } catch (error) {
      const duration = performance.now() - startTime;
      performanceMonitor.record('cache-persist-error', duration, 'database');
      console.warn('Cache persistence failed:', error);
      return false;
    }
  }, [queryClient]);

  const restoreCriticalData = useCallback(async () => {
    const startTime = performance.now();
    
    try {
      const stored = localStorage.getItem('critical-cache');
      if (!stored) return false;

      const data = JSON.parse(stored);
      let restoredCount = 0;

      Object.entries(data).forEach(([queryKey, value]) => {
        queryClient.setQueryData([queryKey], value);
        persistenceRef.current.set(queryKey, value);
        restoredCount++;
      });

      const duration = performance.now() - startTime;
      performanceMonitor.record('cache-restore', duration, 'database', { 
        restored: restoredCount.toString() 
      });
      
      return restoredCount > 0;
    } catch (error) {
      const duration = performance.now() - startTime;
      performanceMonitor.record('cache-restore-error', duration, 'database');
      console.warn('Cache restoration failed:', error);
      return false;
    }
  }, [queryClient]);

  const clearExpiredCache = useCallback(async () => {
    const startTime = performance.now();
    
    try {
      const queryCache = queryClient.getQueryCache();
      const queries = queryCache.getAll();
      let clearedCount = 0;

      queries.forEach(query => {
        const dataUpdatedAt = query.state.dataUpdatedAt;
        const isStale = dataUpdatedAt && (Date.now() - dataUpdatedAt) > 3600000; // 1 hora
        
        if (isStale) {
          queryClient.removeQueries({ queryKey: query.queryKey });
          clearedCount++;
        }
      });

      // Limpiar persistencia local
      persistenceRef.current.clear();

      const duration = performance.now() - startTime;
      performanceMonitor.record('cache-cleanup', duration, 'database', { 
        cleared: clearedCount.toString() 
      });
      
      return clearedCount;
    } catch (error) {
      const duration = performance.now() - startTime;
      performanceMonitor.record('cache-cleanup-error', duration, 'database');
      console.warn('Cache cleanup failed:', error);
      return 0;
    }
  }, [queryClient]);

  const getCacheStats = useCallback((): CacheStats => {
    const queryCache = queryClient.getQueryCache();
    const queries = queryCache.getAll();
    
    const totalQueries = queries.length;
    const cachedQueries = queries.filter(q => q.state.data !== undefined).length;
    const hitRate = totalQueries > 0 ? (cachedQueries / totalQueries) * 100 : 0;
    
    // Estimar tamaño del cache (aproximado)
    const totalSize = JSON.stringify(queryCache).length;

    return {
      totalQueries,
      cachedQueries,
      hitRate: Math.round(hitRate * 100) / 100,
      totalSize
    };
  }, [queryClient]);

  const invalidateStaleQueries = useCallback(async () => {
    const startTime = performance.now();
    
    try {
      // Invalidar queries que han estado en cache más de 30 minutos
      const staleTime = 30 * 60 * 1000; // 30 minutos
      await queryClient.invalidateQueries({
        predicate: (query) => {
          const lastUpdate = query.state.dataUpdatedAt;
          return lastUpdate && (Date.now() - lastUpdate) > staleTime;
        }
      });

      const duration = performance.now() - startTime;
      performanceMonitor.record('cache-invalidate', duration, 'database');
      
      return true;
    } catch (error) {
      const duration = performance.now() - startTime;
      performanceMonitor.record('cache-invalidate-error', duration, 'database');
      console.warn('Cache invalidation failed:', error);
      return false;
    }
  }, [queryClient]);

  return {
    persistCriticalData,
    restoreCriticalData,
    clearExpiredCache,
    getCacheStats,
    invalidateStaleQueries,
  };
};