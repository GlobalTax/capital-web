import { useCallback, useRef, useEffect } from 'react';
import { useRateLimit } from './useRateLimit';
import { logger } from '@/utils/logger';

interface PerformanceMetrics {
  queryExecutionTime: number;
  cacheHitRate: number;
  rateLimitHits: number;
  errorRate: number;
  avgResponseTime: number;
}

interface PerformanceAlert {
  type: 'cache_miss' | 'slow_query' | 'rate_limit' | 'error_spike';
  message: string;
  threshold: number;
  current: number;
  timestamp: number;
}

export const usePerformanceMonitoring = () => {
  const metricsRef = useRef<PerformanceMetrics>({
    queryExecutionTime: 0,
    cacheHitRate: 0,
    rateLimitHits: 0,
    errorRate: 0,
    avgResponseTime: 0,
  });
  
  const alertsRef = useRef<PerformanceAlert[]>([]);
  const queryTimesRef = useRef<number[]>([]);
  const errorCountRef = useRef(0);
  const totalQueriesRef = useRef(0);

  // Rate limiting para el monitoreo mismo
  const { executeWithRateLimit } = useRateLimit({
    maxRequests: 60,
    windowMs: 60000, // 1 minuto
  });

  const recordQueryPerformance = useCallback((
    queryKey: string,
    executionTime: number,
    wasFromCache: boolean,
    hasError: boolean = false
  ) => {
    totalQueriesRef.current++;
    queryTimesRef.current.push(executionTime);
    
    // Mantener solo las últimas 100 métricas
    if (queryTimesRef.current.length > 100) {
      queryTimesRef.current.shift();
    }

    if (hasError) {
      errorCountRef.current++;
    }

    // Calcular métricas actualizadas
    const avgTime = queryTimesRef.current.reduce((a, b) => a + b, 0) / queryTimesRef.current.length;
    const cacheHits = wasFromCache ? 1 : 0;
    const errorRate = (errorCountRef.current / totalQueriesRef.current) * 100;

    metricsRef.current = {
      ...metricsRef.current,
      queryExecutionTime: executionTime,
      avgResponseTime: avgTime,
      errorRate,
    };

    // Detectar problemas de performance
    executeWithRateLimit(async () => {
      await checkPerformanceThresholds(queryKey, executionTime, errorRate);
    }, 'performance-check');

    // Log métricas importantes
    logger.debug('Query performance recorded', {
      queryKey,
      executionTime,
      wasFromCache,
      hasError,
      avgTime,
      errorRate
    }, { context: 'performance', component: 'usePerformanceMonitoring' });
  }, [executeWithRateLimit]);

  const checkPerformanceThresholds = useCallback(async (
    queryKey: string,
    executionTime: number,
    errorRate: number
  ) => {
    const alerts: PerformanceAlert[] = [];

    // Query lenta (> 2 segundos)
    if (executionTime > 2000) {
      alerts.push({
        type: 'slow_query',
        message: `Query lenta detectada: ${queryKey} (${executionTime}ms)`,
        threshold: 2000,
        current: executionTime,
        timestamp: Date.now(),
      });
    }

    // Alta tasa de errores (> 10%)
    if (errorRate > 10) {
      alerts.push({
        type: 'error_spike',
        message: `Alta tasa de errores: ${errorRate.toFixed(1)}%`,
        threshold: 10,
        current: errorRate,
        timestamp: Date.now(),
      });
    }

    // Agregar alertas
    alertsRef.current.push(...alerts);

    // Log alertas críticas
    alerts.forEach(alert => {
      logger.warn('Performance alert triggered', alert, {
        context: 'performance',
        component: 'usePerformanceMonitoring'
      });
    });

    // Mantener solo las últimas 20 alertas
    if (alertsRef.current.length > 20) {
      alertsRef.current = alertsRef.current.slice(-20);
    }
  }, []);

  const recordRateLimitHit = useCallback((operation: string) => {
    metricsRef.current.rateLimitHits++;
    
    logger.info('Rate limit hit recorded', { operation }, {
      context: 'performance',
      component: 'usePerformanceMonitoring'
    });
  }, []);

  const getPerformanceMetrics = useCallback((): PerformanceMetrics => {
    return { ...metricsRef.current };
  }, []);

  const getPerformanceAlerts = useCallback((): PerformanceAlert[] => {
    return [...alertsRef.current];
  }, []);

  const clearMetrics = useCallback(() => {
    metricsRef.current = {
      queryExecutionTime: 0,
      cacheHitRate: 0,
      rateLimitHits: 0,
      errorRate: 0,
      avgResponseTime: 0,
    };
    alertsRef.current = [];
    queryTimesRef.current = [];
    errorCountRef.current = 0;
    totalQueriesRef.current = 0;
    
    logger.info('Performance metrics cleared', undefined, {
      context: 'performance',
      component: 'usePerformanceMonitoring'
    });
  }, []);

  // Limpiar métricas antiguas automáticamente
  useEffect(() => {
    const interval = setInterval(() => {
      // Limpiar alertas de más de 1 hora
      const oneHourAgo = Date.now() - 3600000;
      alertsRef.current = alertsRef.current.filter(
        alert => alert.timestamp > oneHourAgo
      );
    }, 300000); // Cada 5 minutos

    return () => clearInterval(interval);
  }, []);

  return {
    recordQueryPerformance,
    recordRateLimitHit,
    getPerformanceMetrics,
    getPerformanceAlerts,
    clearMetrics,
  };
};