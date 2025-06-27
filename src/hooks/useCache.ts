
import { useState, useEffect, useCallback } from 'react';
import { globalCache, Cache } from '@/utils/cache';

export const useCache = <T>(
  key: string,
  fetchFunction: () => Promise<T>,
  cacheInstance: Cache = globalCache,
  ttl?: number
) => {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    // Intentar obtener del cache primero
    const cachedData = cacheInstance.get<T>(key);
    if (cachedData) {
      setData(cachedData);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchFunction();
      cacheInstance.set(key, result, ttl);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  }, [key, fetchFunction, cacheInstance, ttl]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    cacheInstance.delete(key);
    fetchData();
  }, [key, fetchData, cacheInstance]);

  return {
    data,
    isLoading,
    error,
    refetch
  };
};
