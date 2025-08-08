// ============= UNIFIED PERFORMANCE MONITOR =============
// Monitor unificado que reemplaza las múltiples implementaciones

interface PerformanceMetric {
  name: string;
  value: number;
  category: 'loading' | 'interaction' | 'database' | 'api' | 'rendering' | 'navigation';
  timestamp: number;
  tags?: Record<string, string>;
}

interface WebVitals {
  FCP?: number;
  LCP?: number;
  FID?: number;
  INP?: number;
  CLS?: number;
}

interface PerformanceConfig {
  enabled: boolean;
  maxMetrics: number;
  flushInterval: number;
  thresholds: Record<string, number>;
}

class UnifiedPerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private vitals: WebVitals = {};
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
    }
  };
  private observer?: PerformanceObserver;
  private flushTimer?: NodeJS.Timeout;

  constructor() {
    this.setupWebVitals();

    // Record navigation timings (TTFB, DCL, DOMComplete)
    try {
      const recordNav = () => {
        const entries = performance.getEntriesByType('navigation') as any[];
        const nav: any = entries && entries[0];
        if (!nav) return;
        const ttfb = nav.responseStart - nav.startTime;
        const dcl = nav.domContentLoadedEventEnd - nav.startTime;
        const complete = nav.domComplete - nav.startTime;
        this.record('TTFB', ttfb, 'navigation');
        this.record('DOM Content Loaded', dcl, 'navigation');
        this.record('DOM Complete', complete, 'navigation');
      };
      if (document.readyState === 'complete') {
        recordNav();
      } else {
        window.addEventListener('load', () => recordNav(), { once: true });
      }
    } catch {}

    this.startPeriodicCleanup();
  }

  // API principal para registrar métricas
  record(
    name: string, 
    value: number, 
    category: PerformanceMetric['category'],
    tags?: Record<string, string>
  ): void {
    if (!this.config.enabled) return;

    const metric: PerformanceMetric = {
      name,
      value,
      category,
      timestamp: Date.now(),
      tags
    };

    this.metrics.push(metric);
    this.cleanupOldMetrics();

    // Log críticos para debugging
    if (value > this.config.thresholds[category] * 2) {
      console.warn(`🐌 Slow ${category}: ${name} (${value}ms)`);
    }
  }

  // Obtener métricas con filtros
  getMetrics(category?: PerformanceMetric['category']): PerformanceMetric[] {
    return category 
      ? this.metrics.filter(m => m.category === category)
      : [...this.metrics];
  }

  // Estadísticas agregadas
  getAggregatedStats(category?: PerformanceMetric['category']) {
    const relevantMetrics = this.getMetrics(category);
    
    if (relevantMetrics.length === 0) {
      return { count: 0, average: 0, min: 0, max: 0, p95: 0 };
    }

    const values = relevantMetrics.map(m => m.value).sort((a, b) => a - b);
    const sum = values.reduce((acc, val) => acc + val, 0);
    
    return {
      count: values.length,
      average: sum / values.length,
      min: values[0],
      max: values[values.length - 1],
      p95: values[Math.floor(values.length * 0.95)] || values[values.length - 1]
    };
  }

  // Web Vitals
  getWebVitals(): WebVitals {
    return { ...this.vitals };
  }

  // Limpiar métricas
  clear(): void {
    this.metrics = [];
    this.vitals = {};
  }

  // Detectar operaciones lentas
  getSlowOperations(threshold?: number): PerformanceMetric[] {
    return this.metrics.filter(m => {
      const effectiveThreshold = threshold || this.config.thresholds[m.category];
      return m.value > effectiveThreshold;
    }).sort((a, b) => b.value - a.value);
  }

  // Configuración
  setConfig(updates: Partial<PerformanceConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  private setupWebVitals(): void {
    if (!('PerformanceObserver' in window)) return;

    this.observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.recordWebVital(entry);
      }
    });

    try {
      this.observer.observe({
        entryTypes: ['paint', 'largest-contentful-paint', 'first-input', 'layout-shift', 'event', 'longtask']
      });
    } catch (error) {
      console.warn('Web Vitals observation failed:', error);
    }
  }

  private recordWebVital(entry: PerformanceEntry): void {
    switch (entry.entryType) {
      case 'paint':
        if (entry.name === 'first-contentful-paint') {
          this.vitals.FCP = entry.startTime;
          this.record('FCP', entry.startTime, 'loading');
        }
        break;
      case 'largest-contentful-paint':
        this.vitals.LCP = entry.startTime;
        this.record('LCP', entry.startTime, 'loading');
        break;
      case 'first-input':
        this.vitals.FID = (entry as any).processingStart - entry.startTime;
        this.record('FID', this.vitals.FID, 'interaction');
        break;
      case 'event': {
        // Approximate INP using Event Timing: track worst interaction latency
        const e: any = entry as any;
        const candidate = typeof e.duration === 'number' ? e.duration : ((e.processingEnd || 0) - entry.startTime);
        if (!Number.isNaN(candidate) && candidate > 0) {
          this.vitals.INP = Math.max(this.vitals.INP || 0, candidate);
          this.record('INP', candidate, 'interaction', { event: e.name || 'event' });
        }
        break;
      }
      case 'layout-shift':
        if (!(entry as any).hadRecentInput) {
          this.vitals.CLS = (this.vitals.CLS || 0) + (entry as any).value;
          this.record('CLS', (entry as any).value, 'rendering');
        }
        break;
      case 'longtask': {
        const duration = (entry as any).duration as number;
        if (duration && duration > 0) {
          this.record('Long Task', duration, 'rendering', { name: entry.name });
        }
        break;
      }
    }
  }

  private cleanupOldMetrics(): void {
    if (this.metrics.length > this.config.maxMetrics) {
      this.metrics = this.metrics.slice(-this.config.maxMetrics * 0.8); // Mantener 80%
    }

    // Limpiar métricas de más de 1 hora
    const oneHourAgo = Date.now() - 3600000;
    this.metrics = this.metrics.filter(m => m.timestamp > oneHourAgo);
  }

  private startPeriodicCleanup(): void {
    this.flushTimer = setInterval(() => {
      this.cleanupOldMetrics();
    }, this.config.flushInterval);
  }

  destroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
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