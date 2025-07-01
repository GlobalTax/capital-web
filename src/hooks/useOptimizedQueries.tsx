
import { useState, useCallback, useRef } from 'react';
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
    clearCache,
    isLoading,
    getFromCache,
    setToCache
  };
};
