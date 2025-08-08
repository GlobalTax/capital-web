// ============= REAL TIME METRICS HOOK =============
// Hook para métricas en tiempo real con WebSocket

import { useState, useEffect, useRef, useCallback } from 'react';
import { performanceMonitor } from '@/utils/unifiedPerformanceMonitor';

interface RealTimeMetric {
  timestamp: number;
  category: 'loading' | 'interaction' | 'database' | 'api' | 'rendering' | 'navigation';
  value: number;
  name: string;
}

interface MetricsSummary {
  totalOperations: number;
  averageTime: number;
  operationsPerSecond: number;
  categoryBreakdown: Record<string, number>;
  recentAlerts: Array<{
    type: string;
    message: string;
    timestamp: number;
  }>;
}

export const useRealTimeMetrics = (updateInterval = 5000) => {
  const [metrics, setMetrics] = useState<RealTimeMetric[]>([]);
  const [summary, setSummary] = useState<MetricsSummary>({
    totalOperations: 0,
    averageTime: 0,
    operationsPerSecond: 0,
    categoryBreakdown: {},
    recentAlerts: []
  });
  
  const [isConnected, setIsConnected] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout>();
  const metricsBufferRef = useRef<RealTimeMetric[]>([]);
  const lastUpdateRef = useRef(Date.now());

  // Procesar métricas del buffer
  const processMetrics = useCallback(() => {
    const allMetrics = performanceMonitor.getMetrics();
    const recentMetrics = allMetrics.filter(
      m => m.timestamp > lastUpdateRef.current
    );

    if (recentMetrics.length > 0) {
      const newMetrics = recentMetrics.map(m => ({
        timestamp: m.timestamp,
        category: m.category,
        value: m.value,
        name: m.name
      }));

      setMetrics(prev => {
        const combined = [...prev, ...newMetrics];
        // Mantener solo las últimas 100 métricas
        return combined.slice(-100);
      });

      lastUpdateRef.current = Date.now();
    }
  }, []);

  // Calcular resumen de métricas
  const calculateSummary = useCallback(() => {
    const allMetrics = performanceMonitor.getMetrics();
    const lastMinute = Date.now() - 60000;
    const recentMetrics = allMetrics.filter(m => m.timestamp > lastMinute);

    if (recentMetrics.length === 0) {
      setSummary({
        totalOperations: 0,
        averageTime: 0,
        operationsPerSecond: 0,
        categoryBreakdown: {},
        recentAlerts: []
      });
      return;
    }

    // Calcular estadísticas
    const totalTime = recentMetrics.reduce((acc, m) => acc + m.value, 0);
    const averageTime = totalTime / recentMetrics.length;
    const operationsPerSecond = recentMetrics.length / 60;

    // Breakdown por categoría
    const categoryBreakdown = recentMetrics.reduce((acc, m) => {
      acc[m.category] = (acc[m.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Detectar alertas recientes
    const recentAlerts = recentMetrics
      .filter(m => m.value > 2000) // Operaciones > 2s
      .slice(-5)
      .map(m => ({
        type: 'slow_operation',
        message: `Operación lenta: ${m.name} (${m.value.toFixed(0)}ms)`,
        timestamp: m.timestamp
      }));

    setSummary({
      totalOperations: allMetrics.length,
      averageTime,
      operationsPerSecond,
      categoryBreakdown,
      recentAlerts
    });
  }, []);

  // Simular conexión en tiempo real
  const startRealTimeUpdates = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    setIsConnected(true);
    
    intervalRef.current = setInterval(() => {
      processMetrics();
      calculateSummary();
    }, updateInterval);

    // Actualización inicial
    processMetrics();
    calculateSummary();
  }, [updateInterval, processMetrics, calculateSummary]);

  const stopRealTimeUpdates = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }
    setIsConnected(false);
  }, []);

  // Obtener métricas por categoría
  const getMetricsByCategory = useCallback((category: RealTimeMetric['category']) => {
    return metrics.filter(m => m.category === category);
  }, [metrics]);

  // Obtener trend de rendimiento (últimas N métricas)
  const getPerformanceTrend = useCallback((count = 20) => {
    return metrics
      .slice(-count)
      .map(m => ({
        timestamp: m.timestamp,
        value: m.value,
        category: m.category
      }));
  }, [metrics]);

  // Detectar patrones de rendimiento
  const detectPerformancePatterns = useCallback(() => {
    if (metrics.length < 10) return { trend: 'stable', confidence: 0 };

    const recent = metrics.slice(-10);
    const older = metrics.slice(-20, -10);

    if (recent.length === 0 || older.length === 0) {
      return { trend: 'stable', confidence: 0 };
    }

    const recentAvg = recent.reduce((acc, m) => acc + m.value, 0) / recent.length;
    const olderAvg = older.reduce((acc, m) => acc + m.value, 0) / older.length;
    
    const difference = ((recentAvg - olderAvg) / olderAvg) * 100;
    
    let trend: 'improving' | 'degrading' | 'stable' = 'stable';
    let confidence = Math.min(Math.abs(difference) / 20, 1); // 0-1

    if (difference > 10) {
      trend = 'degrading';
    } else if (difference < -10) {
      trend = 'improving';
    }

    return { trend, confidence };
  }, [metrics]);

  // Efecto principal
  useEffect(() => {
    startRealTimeUpdates();
    return () => {
      stopRealTimeUpdates();
    };
  }, [startRealTimeUpdates, stopRealTimeUpdates]);

  return {
    metrics,
    summary,
    isConnected,
    getMetricsByCategory,
    getPerformanceTrend,
    detectPerformancePatterns,
    startRealTimeUpdates,
    stopRealTimeUpdates,
    refresh: () => {
      processMetrics();
      calculateSummary();
    }
  };
};