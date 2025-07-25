// ============= PERFORMANCE MONITORING SERVICE =============
// Servicio centralizado para monitoreo de performance

import { devLogger } from '@/utils/devLogger';

interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, any>;
}

export class PerformanceMonitorService {
  private metrics: Map<string, PerformanceMetric> = new Map();
  private isEnabled = process.env.NODE_ENV === 'development';

  startTimer(name: string, metadata?: Record<string, any>): void {
    if (!this.isEnabled) return;

    this.metrics.set(name, {
      name,
      startTime: performance.now(),
      metadata
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

    devLogger.info(
      `Performance: ${name} completed in ${duration.toFixed(2)}ms`,
      metric.metadata,
      'performance'
    );

    return duration;
  }

  measureFunction<T extends (...args: any[]) => any>(
    fn: T,
    name: string,
    metadata?: Record<string, any>
  ): T {
    if (!this.isEnabled) return fn;

    return ((...args: any[]) => {
      this.startTimer(name, metadata);
      const result = fn(...args);
      
      if (result instanceof Promise) {
        return result.finally(() => this.endTimer(name));
      }
      
      this.endTimer(name);
      return result;
    }) as T;
  }

  getMetrics(): PerformanceMetric[] {
    return Array.from(this.metrics.values());
  }

  clearMetrics(): void {
    this.metrics.clear();
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitorService();