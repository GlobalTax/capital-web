// ============= PERFORMANCE PROVIDER =============
// React Query optimization and performance monitoring

import React, { createContext, useContext, useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { logger } from '@/utils/logger';

// Optimized QueryClient configuration
const createQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors
        if (error?.status >= 400 && error?.status < 500) return false;
        return failureCount < 2;
      },
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: 'always',
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
    },
  },
});

interface PerformanceContextType {
  queryClient: QueryClient;
  performanceMetrics: {
    queryCount: number;
    errorCount: number;
    avgResponseTime: number;
  };
}

const PerformanceContext = createContext<PerformanceContextType | undefined>(undefined);

export const PerformanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [queryClient] = useState(() => createQueryClient());
  const [metrics, setMetrics] = useState({
    queryCount: 0,
    errorCount: 0,
    avgResponseTime: 0,
  });

  useEffect(() => {
    // Performance monitoring
    const startTime = performance.now();
    
    // Log initialization
    logger.info('Performance provider initialized', undefined, {
      context: 'performance',
      component: 'PerformanceProvider'
    });

    // Monitor query cache - use setTimeout to avoid setState during render
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (event.type === 'added') {
        setTimeout(() => {
          setMetrics(prev => ({ ...prev, queryCount: prev.queryCount + 1 }));
        }, 0);
      }
      
      if (event.type === 'updated' && event.query?.state.error) {
        setTimeout(() => {
          setMetrics(prev => ({ ...prev, errorCount: prev.errorCount + 1 }));
          logger.warn('Query error detected', event.query.queryKey, {
            context: 'performance',
            component: 'PerformanceProvider'
          });
        }, 0);
      }
    });

    // Defer initial metrics update
    setTimeout(() => {
      const endTime = performance.now();
      setMetrics(prev => ({ 
        ...prev, 
        avgResponseTime: Math.round(endTime - startTime) 
      }));
    }, 0);

    return unsubscribe;
  }, [queryClient]);

  const value = {
    queryClient,
    performanceMetrics: metrics,
  };

  return (
    <PerformanceContext.Provider value={value}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </PerformanceContext.Provider>
  );
};

export const usePerformance = () => {
  const context = useContext(PerformanceContext);
  if (context === undefined) {
    throw new Error('usePerformance must be used within a PerformanceProvider');
  }
  return context;
};