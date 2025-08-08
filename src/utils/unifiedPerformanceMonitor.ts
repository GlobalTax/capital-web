// ============= UNIFIED PERFORMANCE MONITOR =============
// Monitor principal que orquesta todos los módulos de performance

import type { PerformanceMetric, PerformanceConfig, WebVitals } from './performance/types';
import { WebVitalsCollector } from './performance/webVitalsCollector';
import { MetricsCollector } from './performance/metricsCollector';
import { DataTransmitter } from './performance/dataTransmitter';

class UnifiedPerformanceMonitor {
  private config: PerformanceConfig = {
    enabled: import.meta.env.DEV,
    maxMetrics: 1000,
    flushInterval: 300000, // 5 minutos
    thresholds: {
      loading: 2000,
      interaction: 100,
      database: 1000,
      api: 3000,
      rendering: 16,
      navigation: 1500
    },
    endpoint: undefined,
    useBeacon: true,
    sampleRate: import.meta.env.PROD ? 0.1 : 1,
    batchSize: 50,
    maxQueueSize: 1000
  };

  private webVitalsCollector: WebVitalsCollector;
  private metricsCollector: MetricsCollector;
  private dataTransmitter: DataTransmitter;
  private flushTimer?: NodeJS.Timeout;
  private isSampled = true;
  private active = true;

  constructor() {
    // Inicializar muestreo
    this.isSampled = Math.random() < this.config.sampleRate;
    this.active = this.config.enabled || (import.meta.env.PROD && this.isSampled);

    // Inicializar módulos
    this.metricsCollector = new MetricsCollector(this.config);
    this.dataTransmitter = new DataTransmitter(this.config, {});
    this.webVitalsCollector = new WebVitalsCollector((metric) => {
      this.addMetric(metric);
    });

    this.recordNavigationTimings();
    this.startPeriodicCleanup();
  }

  private recordNavigationTimings(): void {
    try {
      const recordNav = () => {
        const entries = performance.getEntriesByType('navigation') as any[];
        const nav: any = entries && entries[0];
        if (!nav) return;

        const timings = {
          'TTFB': nav.responseStart - nav.startTime,
          'DOM Content Loaded': nav.domContentLoadedEventEnd - nav.startTime,
          'DOM Complete': nav.domComplete - nav.startTime
        };

        Object.entries(timings).forEach(([name, value]) => {
          this.record(name, value, 'navigation');
        });
      };

      if (document.readyState === 'complete') {
        recordNav();
      } else {
        window.addEventListener('load', () => recordNav(), { once: true });
      }
    } catch (error) {
      console.warn('Navigation timing recording failed:', error);
    }
  }

  private addMetric(metric: PerformanceMetric): void {
    this.metricsCollector.addMetric(metric);
    this.dataTransmitter.enqueue(metric);
  }

  // API principal para registrar métricas
  record(
    name: string, 
    value: number, 
    category: PerformanceMetric['category'],
    tags?: Record<string, string>
  ): void {
    if (!this.active) return;

    const metric: PerformanceMetric = {
      name,
      value,
      category,
      timestamp: Date.now(),
      tags
    };

    this.addMetric(metric);
  }

  // Obtener métricas con filtros
  getMetrics(category?: PerformanceMetric['category']): PerformanceMetric[] {
    return this.metricsCollector.getMetrics(category);
  }

  // Estadísticas agregadas
  getAggregatedStats(category?: PerformanceMetric['category']) {
    return this.metricsCollector.getAggregatedStats(category);
  }

  // Web Vitals
  getWebVitals(): WebVitals {
    return this.webVitalsCollector.getVitals();
  }

  // Limpiar métricas
  clear(): void {
    this.metricsCollector.clear();
  }

  // Detectar operaciones lentas
  getSlowOperations(threshold?: number): PerformanceMetric[] {
    return this.metricsCollector.getSlowOperations(threshold);
  }

  // Configuración
  setConfig(updates: Partial<PerformanceConfig>): void {
    this.config = { ...this.config, ...updates };
    this.metricsCollector.updateConfig(this.config);
    this.dataTransmitter.updateConfig(this.config);
  }

  private startPeriodicCleanup(): void {
    this.flushTimer = setInterval(() => {
      this.dataTransmitter.flush();
    }, this.config.flushInterval);
  }

  destroy(): void {
    this.webVitalsCollector.destroy();
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    // Flush final antes de destruir
    this.dataTransmitter.flush(true);
  }
}

// Singleton exportado
export const performanceMonitor = new UnifiedPerformanceMonitor();

// Utilidades de timing
export const withPerformanceTracking = async <T>(
  operation: () => Promise<T>,
  name: string,
  category: PerformanceMetric['category'] = 'api',
  tags?: Record<string, string>
): Promise<T> => {
  const startTime = performance.now();
  
  try {
    const result = await operation();
    const duration = performance.now() - startTime;
    performanceMonitor.record(name, duration, category, tags);
    return result;
  } catch (error) {
    const duration = performance.now() - startTime;
    performanceMonitor.record(`${name}_error`, duration, category, { ...tags, error: 'true' });
    throw error;
  }
};

// Hook para medir operaciones
export const usePerformanceTimer = () => {
  const startTimer = (name: string) => {
    const startTime = performance.now();
    
    return (category: PerformanceMetric['category'] = 'interaction', tags?: Record<string, string>) => {
      const duration = performance.now() - startTime;
      performanceMonitor.record(name, duration, category, tags);
      return duration;
    };
  };

  return { startTimer };
};