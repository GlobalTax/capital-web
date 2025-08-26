// ============= OPTIMIZED QUERIES HOOK =============
// Performance-focused query optimization with caching and error handling

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { useCentralizedErrorHandler } from './useCentralizedErrorHandler';
import { useRateLimit } from './useRateLimit';
import { useRLSOptimizedQueries } from './useRLSOptimizedQueries';

interface OptimizedQueryOptions<T> {
  queryKey: string[];
  queryFn: () => Promise<T>;
  staleTime?: number;
  cacheTime?: number;
  enabled?: boolean;
  retry?: number;
  retryDelay?: number;
  onError?: (error: Error) => void;
  onSuccess?: (data: T) => void;
  fallbackData?: T;
}

interface OptimizedMutationOptions<T, V> {
  mutationKey?: string[];
  mutationFn: (variables: V) => Promise<T>;
  onSuccess?: (data: T, variables: V) => void;
  onError?: (error: Error, variables: V) => void;
  invalidateQueries?: string[][];
}

export const useOptimizedQueries = () => {
  const { handleError } = useCentralizedErrorHandler();
  const queryClient = useQueryClient();
  const rateLimit = useRateLimit({ maxRequests: 10, windowMs: 60000 });
  const { executeQueryWithRLS, clearCache } = useRLSOptimizedQueries();

  // Optimized query hook
  const useOptimizedQuery = useCallback(<T,>(options: OptimizedQueryOptions<T>) => {
    const {
      queryKey,
      queryFn,
      staleTime = 1000 * 60 * 5, // 5 minutes default
      cacheTime = 1000 * 60 * 10, // 10 minutes default
      enabled = true,
      retry = 2,
      retryDelay = 1000,
      onError,
      onSuccess,
      fallbackData
    } = options;

    const result = useQuery({
      queryKey,
      queryFn: async () => {
        // Apply rate limiting
        return await rateLimit.executeWithRateLimit(async () => {
          return await executeQueryWithRLS(queryFn, {
            cacheKey: queryKey.join('-'),
            fallbackData
          });
        }, queryKey.join('-'));
      },
      staleTime,
      gcTime: cacheTime, // New name for cacheTime in v5
      enabled,
      retry,
      retryDelay: typeof retryDelay === 'number' ? () => retryDelay : retryDelay,
    });

    // Handle callbacks using useEffect pattern for v5
    React.useEffect(() => {
      if (result.error && onError) {
        handleError(result.error, { component: 'useOptimizedQuery', metadata: { queryKey } });
        onError(result.error);
      }
    }, [result.error, onError]);

    React.useEffect(() => {
      if (result.data && onSuccess) {
        onSuccess(result.data);
      }
    }, [result.data, onSuccess]);

    return result;
  }, [handleError, rateLimit, executeQueryWithRLS]);

  // Optimized mutation hook
  const useOptimizedMutation = useCallback(<T, V>(options: OptimizedMutationOptions<T, V>) => {
    const {
      mutationKey,
      mutationFn,
      onSuccess,
      onError,
      invalidateQueries = []
    } = options;

    return useMutation({
      mutationKey,
      mutationFn,
      onSuccess: (data: T, variables: V) => {
        // Invalidate related queries
        invalidateQueries.forEach(queryKey => {
          queryClient.invalidateQueries({ queryKey });
        });
        onSuccess?.(data, variables);
      },
      onError: (error: Error, variables: V) => {
        handleError(error, { component: 'useOptimizedMutation', metadata: { mutationKey } });
        onError?.(error, variables);
      }
    });
  }, [handleError, queryClient]);

  // Bulk invalidation utility
  const invalidateQueries = useCallback((patterns: string[]) => {
    patterns.forEach(pattern => {
      queryClient.invalidateQueries({
        predicate: (query) => query.queryKey.some(key => 
          typeof key === 'string' && key.includes(pattern)
        )
      });
    });
  }, [queryClient]);

  // Cache management utilities
  const cacheUtils = useMemo(() => ({
    clearAll: () => {
      queryClient.clear();
      clearCache();
    },
    clearByPattern: (pattern: string) => {
      queryClient.removeQueries({
        predicate: (query) => query.queryKey.some(key => 
          typeof key === 'string' && key.includes(pattern)
        )
      });
      clearCache(pattern);
    },
    prefetch: async <T,>(queryKey: string[], queryFn: () => Promise<T>) => {
      await queryClient.prefetchQuery({ queryKey, queryFn });
    }
  }), [queryClient, clearCache]);

  return {
    useOptimizedQuery,
    useOptimizedMutation,
    invalidateQueries,
    cacheUtils,
    queryClient
  };
};