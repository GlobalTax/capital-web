// ============= PERFORMANCE OPTIMIZER UTILITIES =============
// Utilidades para optimizar el rendimiento de la aplicación

import { performanceMonitor } from '@/shared/services/performance-monitor.service';

interface OptimizationReport {
  bundleSize: number;
  cacheHitRate: number;
  slowQueries: Array<{ name: string; duration: number }>;
  recommendations: string[];
}

class PerformanceOptimizer {
  private observer?: PerformanceObserver;

  // Inicializar monitoreo de performance
  init(): void {
    if ('PerformanceObserver' in window) {
      this.observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.processPerformanceEntry(entry);
        }
      });

      try {
        this.observer.observe({ entryTypes: ['measure', 'navigation', 'resource'] });
      } catch (error) {
        console.warn('Performance Observer not fully supported:', error);
      }
    }

    // Monitorear Long Tasks
    this.observeLongTasks();
  }

  private processPerformanceEntry(entry: PerformanceEntry): void {
    const category = this.categorizeEntry(entry);
    
    if (entry.duration > 100) { // Operaciones lentas > 100ms
      performanceMonitor.startTimer(entry.name, category);
      setTimeout(() => performanceMonitor.endTimer(entry.name), entry.duration);
    }
  }

  private categorizeEntry(entry: PerformanceEntry): 'loading' | 'interaction' | 'database' | 'api' {
    if (entry.entryType === 'navigation') return 'loading';
    if (entry.name.includes('api') || entry.name.includes('supabase')) return 'api';
    if (entry.name.includes('query') || entry.name.includes('mutation')) return 'database';
    return 'interaction';
  }

  private observeLongTasks(): void {
    if ('PerformanceObserver' in window) {
      try {
        const longTaskObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.duration > 50) { // Long tasks > 50ms
              performanceMonitor.startTimer('long-task', 'interaction');
              setTimeout(() => performanceMonitor.endTimer('long-task'), entry.duration);
              console.warn(`🐌 Long task detected: ${entry.duration.toFixed(2)}ms`);
            }
          }
        });
        
        longTaskObserver.observe({ entryTypes: ['longtask'] });
      } catch (error) {
        // Long task observer no soportado en todos los navegadores
      }
    }
  }

  // Generar reporte de optimización
  generateReport(): OptimizationReport {
    const metrics = performanceMonitor.getMetrics();
    const summary = performanceMonitor.getPerformanceSummary();
    
    const slowQueries = performanceMonitor.getSlowQueries(1000) // > 1 segundo
      .map(metric => ({
        name: metric.name,
        duration: metric.duration || 0
      }));

    const recommendations = this.generateRecommendations(summary, slowQueries);

    return {
      bundleSize: this.estimateBundleSize(),
      cacheHitRate: this.calculateCacheHitRate(),
      slowQueries,
      recommendations
    };
  }

  private generateRecommendations(
    summary: any, 
    slowQueries: Array<{ name: string; duration: number }>
  ): string[] {
    const recommendations: string[] = [];

    // Análisis de queries lentas
    if (slowQueries.length > 0) {
      recommendations.push(`Optimizar ${slowQueries.length} queries lentas detectadas`);
    }

    // Análisis por categoría
    Object.entries(summary).forEach(([category, stats]: [string, any]) => {
      if (stats.averageTime > 500) {
        recommendations.push(`Optimizar operaciones de ${category} (promedio: ${stats.averageTime}ms)`);
      }
    });

    // Recomendaciones generales
    if (recommendations.length === 0) {
      recommendations.push('Rendimiento óptimo - continuar monitoreando');
    }

    return recommendations;
  }

  private estimateBundleSize(): number {
    // Estimar tamaño del bundle basado en recursos cargados
    const entries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    return entries
      .filter(entry => entry.name.includes('.js') || entry.name.includes('.css'))
      .reduce((total, entry) => total + (entry.transferSize || 0), 0);
  }

  private calculateCacheHitRate(): number {
    // Calcular tasa de aciertos de cache basado en recursos
    const entries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const cachedEntries = entries.filter(entry => entry.transferSize === 0);
    
    return entries.length > 0 ? (cachedEntries.length / entries.length) * 100 : 0;
  }

  // Detectar memory leaks potenciales
  detectMemoryLeaks(): { components: number; listeners: number; timers: number } {
    return {
      components: this.countReactComponents(),
      listeners: this.countEventListeners(),
      timers: this.countActiveTimers()
    };
  }

  private countReactComponents(): number {
    // Estimar número de componentes React montados
    return document.querySelectorAll('[data-reactroot], [data-react-checksum]').length;
  }

  private countEventListeners(): number {
    // Estimar número de event listeners (aproximación)
    return Array.from(document.querySelectorAll('*'))
      .reduce((count, element) => {
        const events = Object.getOwnPropertyNames(element).filter(prop => prop.startsWith('on'));
        return count + events.length;
      }, 0);
  }

  private countActiveTimers(): number {
    // Los timers activos no son directamente accesibles, retornamos estimación
    return 0; // Placeholder
  }

  cleanup(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

export const performanceOptimizer = new PerformanceOptimizer();