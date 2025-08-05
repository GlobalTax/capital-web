// ============= DATABASE OPTIMIZATION HOOK =============
// Hook para monitoreo y optimización de base de datos

import { useState, useCallback, useEffect } from 'react';
import { queryOptimizer } from '@/core/database/QueryOptimizer';
import { dbPool } from '@/core/database/ConnectionPool';
import { logger } from '@/utils/logger';

interface DatabaseMetrics {
  queryPerformance: {
    averageQueryTime: number;
    slowQueries: number;
    cacheHitRate: number;
    totalQueries: number;
    failedQueries: number;
  };
  connectionPool: {
    activeConnections: number;
    idleConnections: number;
    maxConnections: number;
  };
  optimization: {
    rulesApplied: number;
    estimatedSavings: number;
    indexSuggestions: Array<{ table: string; suggestion: string }>;
  };
}

interface OptimizationConfig {
  enableQueryCache: boolean;
  enableConnectionPooling: boolean;
  enableIndexHints: boolean;
  performanceThreshold: number;
  monitoringInterval: number;
}

export const useDatabaseOptimization = (config: Partial<OptimizationConfig> = {}) => {
  const [metrics, setMetrics] = useState<DatabaseMetrics | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [lastOptimization, setLastOptimization] = useState<Date | null>(null);

  const defaultConfig: OptimizationConfig = {
    enableQueryCache: true,
    enableConnectionPooling: true,
    enableIndexHints: true,
    performanceThreshold: 3000, // 3 segundos
    monitoringInterval: 30000, // 30 segundos
    ...config
  };

  // Obtener métricas actuales
  const fetchMetrics = useCallback(async (): Promise<DatabaseMetrics> => {
    const queryReport = queryOptimizer.generatePerformanceReport();
    const poolStats = dbPool.getStats();

    return {
      queryPerformance: {
        averageQueryTime: queryReport.averageOptimization,
        slowQueries: queryReport.slowQueries.length,
        cacheHitRate: queryReport.cacheHitRate,
        totalQueries: poolStats.totalQueries,
        failedQueries: poolStats.failedQueries
      },
      connectionPool: {
        activeConnections: poolStats.activeConnections,
        idleConnections: poolStats.idleConnections,
        maxConnections: 10 // Valor fijo del pool
      },
      optimization: {
        rulesApplied: 0, // Calculado dinámicamente
        estimatedSavings: 0, // Calculado dinámicamente
        indexSuggestions: queryReport.indexSuggestions
      }
    };
  }, []);

  // Optimización automática
  const runOptimization = useCallback(async () => {
    if (isOptimizing) return;

    setIsOptimizing(true);
    logger.info('Starting database optimization', undefined, { 
      context: 'database', 
      component: 'useDatabaseOptimization' 
    });

    try {
      const currentMetrics = await fetchMetrics();
      
      // Limpiar cache de queries lentas
      if (currentMetrics.queryPerformance.slowQueries > 5) {
        queryOptimizer.clearCache();
        logger.info('Cleared query cache due to slow queries', {
          slowQueries: currentMetrics.queryPerformance.slowQueries
        }, { context: 'database', component: 'useDatabaseOptimization' });
      }

      // Verificar umbrales de rendimiento
      if (currentMetrics.queryPerformance.averageQueryTime > defaultConfig.performanceThreshold) {
        logger.warn('Database performance below threshold', {
          averageTime: currentMetrics.queryPerformance.averageQueryTime,
          threshold: defaultConfig.performanceThreshold
        }, { context: 'database', component: 'useDatabaseOptimization' });
      }

      setLastOptimization(new Date());
      setMetrics(currentMetrics);

    } catch (error) {
      logger.error('Database optimization failed', undefined, { context: 'database', component: 'useDatabaseOptimization' });
    } finally {
      setIsOptimizing(false);
    }
  }, [isOptimizing, fetchMetrics, defaultConfig.performanceThreshold]);

  // Monitoreo continuo
  useEffect(() => {
    const monitoringTimer = setInterval(() => {
      fetchMetrics().then(setMetrics);
    }, defaultConfig.monitoringInterval);

    // Optimización automática cada 5 minutos
    const optimizationTimer = setInterval(() => {
      runOptimization();
    }, 5 * 60 * 1000);

    // Cleanup
    return () => {
      clearInterval(monitoringTimer);
      clearInterval(optimizationTimer);
    };
  }, [fetchMetrics, runOptimization, defaultConfig.monitoringInterval]);

  // Optimización manual del cache
  const optimizeCache = useCallback((pattern?: string) => {
    queryOptimizer.clearCache(pattern);
    logger.info('Manual cache optimization', { pattern }, { 
      context: 'database', 
      component: 'useDatabaseOptimization' 
    });
  }, []);

  // Análisis de performance
  const analyzePerformance = useCallback((): {
    status: 'excellent' | 'good' | 'poor' | 'critical';
    recommendations: string[];
    score: number;
  } => {
    if (!metrics) {
      return {
        status: 'poor',
        recommendations: ['Metrics not available'],
        score: 0
      };
    }

    const recommendations: string[] = [];
    let score = 100;

    // Evaluar tiempo promedio de queries
    if (metrics.queryPerformance.averageQueryTime > 5000) {
      score -= 30;
      recommendations.push('Queries muy lentas detectadas - considera optimizar índices');
    } else if (metrics.queryPerformance.averageQueryTime > 2000) {
      score -= 15;
      recommendations.push('Tiempo de query elevado - revisa consultas complejas');
    }

    // Evaluar cache hit rate
    if (metrics.queryPerformance.cacheHitRate < 0.6) {
      score -= 20;
      recommendations.push('Baja tasa de cache hits - aumenta TTL del cache');
    }

    // Evaluar queries fallidas
    const failureRate = metrics.queryPerformance.failedQueries / metrics.queryPerformance.totalQueries;
    if (failureRate > 0.1) {
      score -= 25;
      recommendations.push('Alta tasa de fallos - revisa políticas RLS y conexiones');
    }

    // Evaluar uso del pool de conexiones
    const poolUsage = metrics.connectionPool.activeConnections / metrics.connectionPool.maxConnections;
    if (poolUsage > 0.8) {
      score -= 15;
      recommendations.push('Pool de conexiones al límite - considera aumentar tamaño');
    }

    // Sugerencias de índices
    if (metrics.optimization.indexSuggestions.length > 0) {
      score -= 10;
      recommendations.push(`${metrics.optimization.indexSuggestions.length} índices sugeridos para mejora`);
    }

    // Determinar estado general
    let status: 'excellent' | 'good' | 'poor' | 'critical';
    if (score >= 90) status = 'excellent';
    else if (score >= 70) status = 'good';
    else if (score >= 50) status = 'poor';
    else status = 'critical';

    return {
      status,
      recommendations,
      score: Math.max(0, score)
    };
  }, [metrics]);

  // Estado de salud de la base de datos
  const getHealthStatus = useCallback(() => {
    if (!metrics) return 'unknown';
    
    const analysis = analyzePerformance();
    return analysis.status;
  }, [metrics, analyzePerformance]);

  return {
    metrics,
    isOptimizing,
    lastOptimization,
    runOptimization,
    optimizeCache,
    analyzePerformance,
    getHealthStatus,
    config: defaultConfig
  };
};