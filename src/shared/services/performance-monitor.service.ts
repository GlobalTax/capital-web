// ============= PERFORMANCE MONITORING SERVICE =============
// Servicio centralizado para monitoreo de performance

import { devLogger } from '@/utils/devLogger';

interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  category: 'loading' | 'interaction' | 'database' | 'api' | 'rendering';
  metadata?: Record<string, any>;
  timestamp: number;
}

interface PerformanceThresholds {
  loading: number;
  interaction: number;
  database: number;
  api: number;
  rendering: number;
}

export class PerformanceMonitorService {
  private metrics: Map<string, PerformanceMetric> = new Map();
  private historicalMetrics: PerformanceMetric[] = [];
  private isEnabled = process.env.NODE_ENV === 'development';
  private thresholds: PerformanceThresholds = {
    loading: 2000,    // 2 segundos
    interaction: 100, // 100ms
    database: 1000,   // 1 segundo
    api: 3000,        // 3 segundos
    rendering: 16     // 16ms (60fps)
  };

  startTimer(
    name: string, 
    category: PerformanceMetric['category'] = 'interaction',
    metadata?: Record<string, any>
  ): void {
    if (!this.isEnabled) return;

    this.metrics.set(name, {
      name,
      startTime: performance.now(),
      category,
      metadata,
      timestamp: Date.now()
    });
  }

  endTimer(name: string): number | null {
    if (!this.isEnabled) return null;

    const metric = this.metrics.get(name);
    if (!metric) {
      devLogger.warn(`Performance timer "${name}" not found`, undefined, 'performance');
      return null;
    }

    const endTime = performance.now();
    const duration = endTime - metric.startTime;

    metric.endTime = endTime;
    metric.duration = duration;

    // Guardar en histórico
    this.historicalMetrics.push({ ...metric });
    
    // Limpiar histórico (mantener solo 1 hora)
    const oneHourAgo = Date.now() - 3600000;
    this.historicalMetrics = this.historicalMetrics.filter(m => m.timestamp > oneHourAgo);

    // Log alertas críticas (solo si es muy lento para reducir spam)
    if (duration > this.thresholds[metric.category] * 2) {
      devLogger.warn(
        `⚠️ Slow ${metric.category}: ${name} took ${duration.toFixed(2)}ms (threshold: ${this.thresholds[metric.category]}ms)`,
        metric.metadata,
        'performance'
      );
    } else {
      devLogger.info(
        `Performance: ${name} completed in ${duration.toFixed(2)}ms`,
        metric.metadata,
        'performance'
      );
    }

    return duration;
  }

  measureFunction<T extends (...args: any[]) => any>(
    fn: T,
    name: string,
    category: PerformanceMetric['category'] = 'api',
    metadata?: Record<string, any>
  ): T {
    if (!this.isEnabled) return fn;

    return ((...args: any[]) => {
      this.startTimer(name, category, metadata);
      const result = fn(...args);
      
      if (result instanceof Promise) {
        return result.finally(() => this.endTimer(name));
      }
      
      this.endTimer(name);
      return result;
    }) as T;
  }

  getSlowQueries(threshold?: number) {
    const effectiveThreshold = threshold || this.thresholds.database;
    return this.historicalMetrics
      .filter(m => m.category === 'database' && m.duration && m.duration > effectiveThreshold)
      .sort((a, b) => (b.duration || 0) - (a.duration || 0))
      .slice(0, 10);
  }

  getPerformanceSummary() {
    const categories = ['loading', 'interaction', 'database', 'api', 'rendering'] as const;
    
    return categories.reduce((summary, category) => {
      const categoryMetrics = this.historicalMetrics.filter(m => m.category === category);
      const avgTime = categoryMetrics.length > 0 
        ? categoryMetrics.reduce((sum, m) => sum + (m.duration || 0), 0) / categoryMetrics.length 
        : 0;
      
      summary[category] = {
        count: categoryMetrics.length,
        averageTime: Math.round(avgTime),
        threshold: this.thresholds[category],
        slowQueries: categoryMetrics.filter(m => (m.duration || 0) > this.thresholds[category]).length
      };
      
      return summary;
    }, {} as Record<string, any>);
  }

  setThreshold(category: keyof PerformanceThresholds, value: number) {
    this.thresholds[category] = value;
  }

  getMetrics(category?: PerformanceMetric['category']): PerformanceMetric[] {
    const allMetrics = [...Array.from(this.metrics.values()), ...this.historicalMetrics];
    return category 
      ? allMetrics.filter(m => m.category === category)
      : allMetrics;
  }

  clearMetrics(): void {
    this.metrics.clear();
    this.historicalMetrics = [];
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitorService();