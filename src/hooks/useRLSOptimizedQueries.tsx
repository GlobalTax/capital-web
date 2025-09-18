
import { useState, useCallback, useRef } from 'react';
import { useErrorHandler } from './useErrorHandler';
import { logger } from '@/utils/logger';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

interface QueryConfig {
  cacheKey?: string;
  cacheTtl?: number;
  retryCount?: number;
  retryDelay?: number;
  fallbackData?: any;
}

export const useRLSOptimizedQueries = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { handleAsyncError } = useErrorHandler();
  const cacheRef = useRef<Map<string, CacheEntry<any>>>(new Map());

  const getFromCache = useCallback(<T,>(key: string): T | null => {
    const entry = cacheRef.current.get(key);
    if (!entry) return null;
    
    if (Date.now() - entry.timestamp > entry.ttl) {
      cacheRef.current.delete(key);
      return null;
    }
    
    logger.debug('Cache hit', { key }, { context: 'performance', component: 'useRLSOptimizedQueries' });
    return entry.data;
  }, []);

  const setToCache = useCallback(<T,>(key: string, data: T, ttl: number) => {
    cacheRef.current.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
    logger.debug('Data cached', { key, ttl }, { context: 'performance', component: 'useRLSOptimizedQueries' });
  }, []);

  const executeQueryWithRLS = useCallback(async <T,>(
    queryFn: () => Promise<T>,
    config: QueryConfig = {}
  ): Promise<T> => {
    const { fallbackData, cacheKey } = config;

    try {
      return await queryFn();
    } catch (error: any) {
      // Manejo específico de errores RLS
      if (error.code === 'PGRST301' || error.message?.includes('row-level security')) {
        logger.warn('RLS access denied, using fallback', { error: error.message, cacheKey }, { context: 'system', component: 'useRLSOptimizedQueries' });
        
        if (fallbackData !== undefined) {
          return fallbackData;
        }
        
        // Si hay datos en caché, usarlos como fallback
        if (cacheKey) {
          const cachedData = getFromCache<T>(cacheKey);
          if (cachedData !== null) {
            return cachedData;
          }
        }
        
        // Fallback por defecto para arrays
        if (Array.isArray(fallbackData) || fallbackData === undefined) {
          return [] as unknown as T;
        }
      }
      
      throw error;
    }
  }, [getFromCache]);

  const clearCache = useCallback((pattern?: string) => {
    if (pattern) {
      const keysToDelete = Array.from(cacheRef.current.keys())
        .filter(key => key.includes(pattern));
      keysToDelete.forEach(key => cacheRef.current.delete(key));
      logger.debug('Cache cleared with pattern', { pattern, deletedCount: keysToDelete.length }, { context: 'performance', component: 'useRLSOptimizedQueries' });
    } else {
      cacheRef.current.clear();
      logger.debug('All cache cleared', undefined, { context: 'performance', component: 'useRLSOptimizedQueries' });
    }
  }, []);

  return {
    clearCache,
    isLoading,
    getFromCache,
    setToCache,
    executeQueryWithRLS
  };
};
