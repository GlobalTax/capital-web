// Sistema de monitoreo de rendimiento optimizado
interface PerformanceMetric {
  name: string;
  value: number;
  category: 'loading' | 'interaction' | 'database' | 'api';
  timestamp: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private isEnabled = import.meta.env.DEV;

  record(name: string, value: number, category: PerformanceMetric['category']) {
    if (!this.isEnabled) return;
    
    this.metrics.push({
      name,
      value,
      category,
      timestamp: Date.now()
    });

    // Limpiar métricas antiguas (más de 1 hora)
    const oneHourAgo = Date.now() - 3600000;
    this.metrics = this.metrics.filter(m => m.timestamp > oneHourAgo);

    // Log en desarrollo si es crítico (reducir spam de logs)
    if (value > 2000) {
      console.warn(`⚠️ Slow ${category}: ${name} took ${value}ms`);
    }
  }

  getMetrics(category?: PerformanceMetric['category']) {
    return category 
      ? this.metrics.filter(m => m.category === category)
      : this.metrics;
  }

  getAverageTime(name: string) {
    const relevantMetrics = this.metrics.filter(m => m.name === name);
    if (relevantMetrics.length === 0) return 0;
    
    const sum = relevantMetrics.reduce((acc, m) => acc + m.value, 0);
    return sum / relevantMetrics.length;
  }

  clear() {
    this.metrics = [];
  }
}

export const performanceMonitor = new PerformanceMonitor();

// Hook para medir tiempo de operaciones
export const usePerformanceTimer = () => {
  const startTimer = (name: string) => {
    const startTime = performance.now();
    
    return (category: PerformanceMetric['category'] = 'interaction') => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      performanceMonitor.record(name, duration, category);
      return duration;
    };
  };

  return { startTimer };
};

// Wrapper para operaciones async con timing
export const withPerformanceTracking = async <T>(
  operation: () => Promise<T>,
  name: string,
  category: PerformanceMetric['category'] = 'api'
): Promise<T> => {
  const startTime = performance.now();
  
  try {
    const result = await operation();
    const endTime = performance.now();
    performanceMonitor.record(name, endTime - startTime, category);
    return result;
  } catch (error) {
    const endTime = performance.now();
    performanceMonitor.record(`${name}_error`, endTime - startTime, category);
    throw error;
  }
};