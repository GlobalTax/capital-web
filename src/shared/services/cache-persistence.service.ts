// ============= CACHE PERSISTENCE SERVICE =============
// Servicio para gestión de persistencia de cache

import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { devLogger } from '@/utils/devLogger';

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

    devLogger.info('Critical data persisted to localStorage', { criticalQueries }, 'cache');
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
          devLogger.warn(`Failed to restore cache for ${queryKey}`, { error }, 'cache');
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

    devLogger.info('Expired cache cleared', undefined, 'cache');
  }, []);

  return {
    persistCriticalData,
    restoreCriticalData,
    clearExpiredCache,
  };
};