
import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCentralizedErrorHandler } from './useCentralizedErrorHandler';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

interface QueryConfig {
  cacheKey?: string;
  cacheTtl?: number; // tiempo de vida en ms
  retryCount?: number;
  retryDelay?: number;
}

export const useOptimizedQueries = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { handleAsyncError } = useCentralizedErrorHandler();
  const cacheRef = useRef<Map<string, CacheEntry<any>>>(new Map());

  const getFromCache = useCallback(<T,>(key: string): T | null => {
    const entry = cacheRef.current.get(key);
    if (!entry) return null;
    
    if (Date.now() - entry.timestamp > entry.ttl) {
      cacheRef.current.delete(key);
      return null;
    }
    
    return entry.data;
  }, []);

  const setToCache = useCallback(<T,>(key: string, data: T, ttl: number) => {
    cacheRef.current.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }, []);

  const executeParallelQueries = useCallback(async <T,>(
    queries: Array<() => Promise<T>>,
    config: QueryConfig = {}
  ): Promise<T[]> => {
    const { cacheKey, cacheTtl = 300000, retryCount = 3, retryDelay = 1000 } = config;
    
    // Verificar caché si existe clave
    if (cacheKey) {
      const cached = getFromCache<T[]>(cacheKey);
      if (cached) {
        return cached;
      }
    }

    setIsLoading(true);
    
    const executeWithRetry = async <R,>(fn: () => Promise<R>, retries: number): Promise<R> => {
      try {
        return await fn();
      } catch (error) {
        if (retries > 0) {
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          return executeWithRetry(fn, retries - 1);
        }
        throw error;
      }
    };

    try {
      const results = await Promise.all(
        queries.map(query => executeWithRetry(query, retryCount))
      );
      
      // Guardar en caché si existe clave
      if (cacheKey && cacheTtl > 0) {
        setToCache(cacheKey, results, cacheTtl);
      }
      
      return results;
    } finally {
      setIsLoading(false);
    }
  }, [getFromCache, setToCache]);

  const clearCache = useCallback((pattern?: string) => {
    if (pattern) {
      const keysToDelete = Array.from(cacheRef.current.keys())
        .filter(key => key.includes(pattern));
      keysToDelete.forEach(key => cacheRef.current.delete(key));
    } else {
      cacheRef.current.clear();
    }
  }, []);

  return {
    executeParallelQueries,
    clearCache,
    isLoading
  };
};
