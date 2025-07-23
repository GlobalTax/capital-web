
import { useCallback, useRef, useEffect, useMemo } from 'react';
import { devLogger } from '@/utils/devLogger';

interface OptimizedPerformanceMetrics {
  queryExecutionTime: number;
  cacheHitRate: number;
  rateLimitHits: number;
  errorRate: number;
  avgResponseTime: number;
  totalQueries: number;
  successfulQueries: number;
}

interface PerformanceAlert {
  type: 'cache_miss' | 'slow_query' | 'rate_limit' | 'error_spike';
  message: string;
  threshold: number;
  current: number;
  timestamp: number;
}

// Configuración optimizada para evitar spam
const MONITORING_CONFIG = {
  maxMetrics: 50, // Reducido de 100
  alertThreshold: 5, // Solo alertar después de 5 eventos
  debounceTime: 1000, // 1 segundo de debounce
  maxAlerts: 10, // Máximo 10 alertas en memoria
  cleanupInterval: 300000, // Limpiar cada 5 minutos
};

export const useOptimizedPerformanceMonitoring = () => {
  const metricsRef = useRef<OptimizedPerformanceMetrics>({
    queryExecutionTime: 0,
    cacheHitRate: 0,
    rateLimitHits: 0,
    errorRate: 0,
    avgResponseTime: 0,
    totalQueries: 0,
    successfulQueries: 0,
  });
  
  const alertsRef = useRef<PerformanceAlert[]>([]);
  const queryTimesRef = useRef<number[]>([]);
  const errorCountRef = useRef(0);
  const lastAlertRef = useRef<{ [key: string]: number }>({});

  // Debounced recording para evitar spam
  const recordQueryPerformance = useCallback((
    queryKey: string,
    executionTime: number,
    wasFromCache: boolean,
    hasError: boolean = false
  ) => {
    // Incrementar contadores
    metricsRef.current.totalQueries++;
    if (!hasError) {
      metricsRef.current.successfulQueries++;
    }

    // Gestionar tiempos de respuesta
    queryTimesRef.current.push(executionTime);
    if (queryTimesRef.current.length > MONITORING_CONFIG.maxMetrics) {
      queryTimesRef.current.shift();
    }

    if (hasError) {
      errorCountRef.current++;
    }

    // Calcular métricas actualizadas (solo si es necesario)
    if (metricsRef.current.totalQueries % 10 === 0) { // Solo cada 10 queries
      const avgTime = queryTimesRef.current.reduce((a, b) => a + b, 0) / queryTimesRef.current.length;
      const errorRate = (errorCountRef.current / metricsRef.current.totalQueries) * 100;
      const cacheHitRate = wasFromCache ? 
        ((metricsRef.current.cacheHitRate * (metricsRef.current.totalQueries - 1)) + 100) / metricsRef.current.totalQueries :
        (metricsRef.current.cacheHitRate * (metricsRef.current.totalQueries - 1)) / metricsRef.current.totalQueries;

      metricsRef.current = {
        ...metricsRef.current,
        queryExecutionTime: executionTime,
        avgResponseTime: avgTime,
        errorRate,
        cacheHitRate
      };

      // Solo log crítico en desarrollo
      if (process.env.NODE_ENV === 'development' && executionTime > 2000) {
        devLogger.warn(`Slow query detected: ${queryKey} (${executionTime}ms)`, 
          { executionTime, wasFromCache, hasError }, 
          'performance', 
          'useOptimizedPerformanceMonitoring'
        );
      }
    }
  }, []);

  // Throttled alert checking
  const checkPerformanceThresholds = useCallback((
    queryKey: string,
    executionTime: number,
    errorRate: number
  ) => {
    const now = Date.now();
    const lastAlert = lastAlertRef.current[queryKey] || 0;
    
    // Throttle alerts por query (mínimo 30 segundos entre alertas del mismo tipo)
    if (now - lastAlert < 30000) return;

    const alerts: PerformanceAlert[] = [];

    // Solo alertar si supera thresholds significativos
    if (executionTime > 3000) { // Aumentado de 2000ms
      alerts.push({
        type: 'slow_query',
        message: `Query muy lenta: ${queryKey} (${executionTime}ms)`,
        threshold: 3000,
        current: executionTime,
        timestamp: now,
      });
    }

    if (errorRate > 15) { // Aumentado de 10%
      alerts.push({
        type: 'error_spike',
        message: `Tasa de errores crítica: ${errorRate.toFixed(1)}%`,
        threshold: 15,
        current: errorRate,
        timestamp: now,
      });
    }

    // Solo agregar alertas si hay algo realmente crítico
    if (alerts.length > 0) {
      alertsRef.current.push(...alerts);
      lastAlertRef.current[queryKey] = now;

      // Mantener solo las alertas más recientes
      if (alertsRef.current.length > MONITORING_CONFIG.maxAlerts) {
        alertsRef.current = alertsRef.current.slice(-MONITORING_CONFIG.maxAlerts);
      }

      // Solo log en desarrollo
      if (process.env.NODE_ENV === 'development') {
        alerts.forEach(alert => {
          devLogger.warn('Critical performance alert', alert, 'performance', 'useOptimizedPerformanceMonitoring');
        });
      }
    }
  }, []);

  const recordRateLimitHit = useCallback((operation: string) => {
    metricsRef.current.rateLimitHits++;
    
    // Solo log en desarrollo y con throttling
    if (process.env.NODE_ENV === 'development') {
      const now = Date.now();
      const lastLog = lastAlertRef.current[`rate_limit_${operation}`] || 0;
      
      if (now - lastLog > 10000) { // Máximo 1 log cada 10 segundos
        devLogger.info(`Rate limit hit: ${operation}`, { operation }, 'performance', 'useOptimizedPerformanceMonitoring');
        lastAlertRef.current[`rate_limit_${operation}`] = now;
      }
    }
  }, []);

  // Memoizar métricas para evitar recálculo
  const getPerformanceMetrics = useMemo((): OptimizedPerformanceMetrics => {
    return { ...metricsRef.current };
  }, [metricsRef.current.totalQueries]); // Solo recalcular cuando cambia el total

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
      totalQueries: 0,
      successfulQueries: 0,
    };
    alertsRef.current = [];
    queryTimesRef.current = [];
    errorCountRef.current = 0;
    lastAlertRef.current = {};
    
    devLogger.info('Performance metrics cleared', undefined, 'performance', 'useOptimizedPerformanceMonitoring');
  }, []);

  // Cleanup automático optimizado
  useEffect(() => {
    const interval = setInterval(() => {
      const oneHourAgo = Date.now() - 3600000;
      
      // Limpiar alertas antiguas
      alertsRef.current = alertsRef.current.filter(
        alert => alert.timestamp > oneHourAgo
      );
      
      // Limpiar referencias de throttling
      Object.keys(lastAlertRef.current).forEach(key => {
        if (lastAlertRef.current[key] < oneHourAgo) {
          delete lastAlertRef.current[key];
        }
      });
      
      // Limpiar métricas antiguas si hay muchas
      if (queryTimesRef.current.length > MONITORING_CONFIG.maxMetrics * 2) {
        queryTimesRef.current = queryTimesRef.current.slice(-MONITORING_CONFIG.maxMetrics);
      }
    }, MONITORING_CONFIG.cleanupInterval);

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
