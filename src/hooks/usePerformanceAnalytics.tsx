// ============= PERFORMANCE ANALYTICS HOOK =============
// Hook unificado para análisis de performance

import { useState, useEffect, useCallback, useRef } from 'react';
import { performanceMonitor } from '@/utils/unifiedPerformanceMonitor';

interface PerformanceStats {
  totalOperations: number;
  averageResponseTime: number;
  slowOperations: number;
  categoryBreakdown: Record<string, {
    count: number;
    average: number;
    p95: number;
  }>;
  recentTrend: 'improving' | 'degrading' | 'stable';
}

interface PerformanceAlert {
  type: 'slow_operation' | 'high_error_rate' | 'degrading_performance';
  message: string;
  timestamp: number;
  severity: 'low' | 'medium' | 'high';
}

export const usePerformanceAnalytics = (options: {
  updateInterval?: number;
  alertThresholds?: Record<string, number>;
  trackTrends?: boolean;
} = {}) => {
  const {
    updateInterval = 10000, // 10 segundos
    alertThresholds = {
      slowOperation: 2000,
      errorRate: 10,
      degradationThreshold: 1.5
    },
    trackTrends = true
  } = options;

  const [stats, setStats] = useState<PerformanceStats>({
    totalOperations: 0,
    averageResponseTime: 0,
    slowOperations: 0,
    categoryBreakdown: {},
    recentTrend: 'stable'
  });

  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const previousStatsRef = useRef<PerformanceStats | null>(null);

  const calculateStats = useCallback((): PerformanceStats => {
    const categories = ['loading', 'interaction', 'database', 'api', 'rendering', 'navigation'] as const;
    const categoryBreakdown: Record<string, any> = {};
    let totalOps = 0;
    let totalTime = 0;
    let slowOps = 0;

    categories.forEach(category => {
      const categoryStats = performanceMonitor.getAggregatedStats(category);
      categoryBreakdown[category] = {
        count: categoryStats.count,
        average: Math.round(categoryStats.average),
        p95: Math.round(categoryStats.p95)
      };
      
      totalOps += categoryStats.count;
      totalTime += categoryStats.average * categoryStats.count;
      slowOps += performanceMonitor.getSlowOperations(alertThresholds.slowOperation)
        .filter(m => m.category === category).length;
    });

    const averageResponseTime = totalOps > 0 ? totalTime / totalOps : 0;
    
    // Calcular tendencia
    let recentTrend: PerformanceStats['recentTrend'] = 'stable';
    if (trackTrends && previousStatsRef.current) {
      const currentAvg = averageResponseTime;
      const previousAvg = previousStatsRef.current.averageResponseTime;
      
      if (currentAvg > previousAvg * alertThresholds.degradationThreshold) {
        recentTrend = 'degrading';
      } else if (currentAvg < previousAvg * 0.8) {
        recentTrend = 'improving';
      }
    }

    return {
      totalOperations: totalOps,
      averageResponseTime: Math.round(averageResponseTime),
      slowOperations: slowOps,
      categoryBreakdown,
      recentTrend
    };
  }, [alertThresholds, trackTrends]);

  const generateAlerts = useCallback((currentStats: PerformanceStats): PerformanceAlert[] => {
    const newAlerts: PerformanceAlert[] = [];

    // Operaciones lentas
    if (currentStats.slowOperations > 5) {
      newAlerts.push({
        type: 'slow_operation',
        message: `${currentStats.slowOperations} operaciones lentas detectadas`,
        timestamp: Date.now(),
        severity: currentStats.slowOperations > 15 ? 'high' : 'medium'
      });
    }

    // Degradación de performance
    if (currentStats.recentTrend === 'degrading') {
      newAlerts.push({
        type: 'degrading_performance',
        message: `Degradación en performance detectada (${currentStats.averageResponseTime}ms promedio)`,
        timestamp: Date.now(),
        severity: 'medium'
      });
    }

    // Tiempo de respuesta general alto
    if (currentStats.averageResponseTime > alertThresholds.slowOperation) {
      newAlerts.push({
        type: 'high_error_rate',
        message: `Tiempo de respuesta muy alto: ${currentStats.averageResponseTime}ms`,
        timestamp: Date.now(),
        severity: 'high'
      });
    }

    return newAlerts;
  }, [alertThresholds]);

  const updateAnalytics = useCallback(() => {
    const currentStats = calculateStats();
    setStats(currentStats);
    
    // Generar alertas
    const newAlerts = generateAlerts(currentStats);
    setAlerts(prev => {
      const updated = [...prev, ...newAlerts];
      // Mantener solo las últimas 20 alertas
      return updated.slice(-20);
    });

    // Guardar para comparación de tendencias
    previousStatsRef.current = currentStats;
  }, [calculateStats, generateAlerts]);

  const startMonitoring = useCallback(() => {
    setIsMonitoring(true);
    updateAnalytics();
  }, [updateAnalytics]);

  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
  }, []);

  const clearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  const getTrendIcon = useCallback((trend: PerformanceStats['recentTrend']) => {
    switch (trend) {
      case 'improving': return '📈';
      case 'degrading': return '📉';
      default: return '➡️';
    }
  }, []);

  const getTrendColor = useCallback((trend: PerformanceStats['recentTrend']) => {
    switch (trend) {
      case 'improving': return 'text-green-600';
      case 'degrading': return 'text-red-600';
      default: return 'text-gray-600';
    }
  }, []);

  // Auto-update cuando está monitoreando
  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(updateAnalytics, updateInterval);
    return () => clearInterval(interval);
  }, [isMonitoring, updateAnalytics, updateInterval]);

  // Limpiar alertas antiguas automáticamente
  useEffect(() => {
    const cleanup = setInterval(() => {
      const oneHourAgo = Date.now() - 3600000;
      setAlerts(prev => prev.filter(alert => alert.timestamp > oneHourAgo));
    }, 300000); // Cada 5 minutos

    return () => clearInterval(cleanup);
  }, []);

  return {
    stats,
    alerts,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    clearAlerts,
    refresh: updateAnalytics,
    getTrendIcon,
    getTrendColor
  };
};