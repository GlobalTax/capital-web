import { useCallback, useRef, useEffect } from 'react';
import { performanceMonitor } from '@/utils/unifiedPerformanceMonitor';
import type { PerformanceAlert } from '@/utils/performance/types';

interface PerformanceMetrics {
  queryExecutionTime: number;
  cacheHitRate: number;
  rateLimitHits: number;
  errorRate: number;
  avgResponseTime: number;
}

export const usePerformanceMonitoring = () => {
  const alertsRef = useRef<PerformanceAlert[]>([]);

  const recordQueryPerformance = useCallback((
    queryKey: string,
    executionTime: number,
    wasFromCache: boolean,
    hasError: boolean = false
  ) => {
    // Registrar en el monitor unificado
    performanceMonitor.record(
      queryKey, 
      executionTime, 
      'database', 
      { 
        cached: wasFromCache.toString(),
        error: hasError.toString()
      }
    );

    // Generar alertas para queries lentas
    if (executionTime > 2000) {
      const alert: PerformanceAlert = {
        type: 'slow_query',
        message: `Query lenta detectada: ${queryKey} (${executionTime}ms)`,
        threshold: 2000,
        current: executionTime,
        timestamp: Date.now(),
        severity: executionTime > 5000 ? 'critical' : 'high'
      };
      alertsRef.current.push(alert);
    }

    // Limpiar alertas antiguas
    const oneHourAgo = Date.now() - 3600000;
    alertsRef.current = alertsRef.current.filter(alert => alert.timestamp > oneHourAgo);
  }, []);

  const recordRateLimitHit = useCallback((operation: string) => {
    performanceMonitor.record('Rate Limit Hit', 1, 'api', { operation });
    
    const alert: PerformanceAlert = {
      type: 'rate_limit',
      message: `Rate limit alcanzado: ${operation}`,
      threshold: 1,
      current: 1,
      timestamp: Date.now(),
      severity: 'medium'
    };
    alertsRef.current.push(alert);
  }, []);

  const getPerformanceMetrics = useCallback((): PerformanceMetrics => {
    const stats = performanceMonitor.getAggregatedStats();
    const dbStats = performanceMonitor.getAggregatedStats('database');
    
    return {
      queryExecutionTime: dbStats.average || 0,
      cacheHitRate: 0, // Calculado desde tags si es necesario
      rateLimitHits: performanceMonitor.getMetrics('api').filter(m => m.name === 'Rate Limit Hit').length,
      errorRate: 0, // Calculado desde métricas con error: true
      avgResponseTime: stats.average || 0,
    };
  }, []);

  const getPerformanceAlerts = useCallback((): PerformanceAlert[] => {
    return [...alertsRef.current];
  }, []);

  const clearMetrics = useCallback(() => {
    performanceMonitor.clear();
    alertsRef.current = [];
  }, []);

  return {
    recordQueryPerformance,
    recordRateLimitHit,
    getPerformanceMetrics,
    getPerformanceAlerts,
    clearMetrics,
  };
};