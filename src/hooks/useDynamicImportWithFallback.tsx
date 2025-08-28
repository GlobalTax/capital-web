import { useState, useEffect, useCallback } from 'react';

interface UseDynamicImportOptions {
  maxRetries?: number;
  retryDelay?: number;
  onError?: (error: Error) => void;
}

interface UseDynamicImportResult<T> {
  component: T | null;
  loading: boolean;
  error: Error | null;
  retry: () => void;
}

export function useDynamicImportWithFallback<T>(
  importFn: () => Promise<{ default: T }>,
  options: UseDynamicImportOptions = {}
): UseDynamicImportResult<T> {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    onError
  } = options;

  const [component, setComponent] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const loadComponent = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const module = await importFn();
      setComponent(module.default);
    } catch (err) {
      const error = err as Error;
      setError(error);
      
      if (onError) {
        onError(error);
      }

      // Auto-retry with exponential backoff
      if (retryCount < maxRetries) {
        const delay = retryDelay * Math.pow(2, retryCount);
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          loadComponent();
        }, delay);
        return;
      }
    } finally {
      setLoading(false);
    }
  }, [importFn, maxRetries, retryDelay, retryCount, onError]);

  const retry = useCallback(() => {
    setRetryCount(0);
    loadComponent();
  }, [loadComponent]);

  useEffect(() => {
    loadComponent();
  }, [loadComponent]);

  return {
    component,
    loading,
    error,
    retry
  };
}