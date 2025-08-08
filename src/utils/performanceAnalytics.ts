// ============= PERFORMANCE ANALYTICS =============
// Sistema avanzado de analíticas de rendimiento

import { performanceMonitor } from './performanceMonitor';

interface AnalyticsConfig {
  sampleRate: number;
  batchSize: number;
  flushInterval: number;
  enableUserTiming: boolean;
}

interface UserSession {
  id: string;
  startTime: number;
  pageViews: number;
  interactions: number;
  totalTime: number;
  deviceInfo: {
    userAgent: string;
    viewport: { width: number; height: number };
    connection: string;
  };
}

interface PerformanceBatch {
  sessionId: string;
  timestamp: number;
  metrics: Array<{
    name: string;
    value: number;
    category: string;
    tags?: Record<string, string>;
  }>;
  vitals: {
    FCP?: number;
    LCP?: number;
    FID?: number;
    CLS?: number;
  };
}

class PerformanceAnalytics {
  private config: AnalyticsConfig = {
    sampleRate: 1.0, // 100% en desarrollo, reducir en producción
    batchSize: 20,
    flushInterval: 30000, // 30 segundos
    enableUserTiming: true
  };

  private session: UserSession;
  private batchBuffer: PerformanceBatch[] = [];
  private flushTimer?: NodeJS.Timeout;
  private vitalsObserver?: PerformanceObserver;

  constructor() {
    this.session = this.initializeSession();
    this.setupVitalsCollection();
    this.startBatchFlushing();
  }

  private initializeSession(): UserSession {
    const sessionId = crypto.randomUUID();
    
    return {
      id: sessionId,
      startTime: Date.now(),
      pageViews: 1,
      interactions: 0,
      totalTime: 0,
      deviceInfo: {
        userAgent: navigator.userAgent,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        connection: this.getConnectionType()
      }
    };
  }

  private getConnectionType(): string {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    return connection ? connection.effectiveType || 'unknown' : 'unknown';
  }

  private setupVitalsCollection(): void {
    if (!('PerformanceObserver' in window)) return;

    // Web Vitals collection
    this.vitalsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.recordVital(entry);
      }
    });

    try {
      this.vitalsObserver.observe({ 
        entryTypes: ['paint', 'largest-contentful-paint', 'first-input', 'layout-shift'] 
      });
    } catch (error) {
      console.warn('Some performance observers not supported:', error);
    }
  }

  private recordVital(entry: PerformanceEntry): void {
    const batch = this.getCurrentBatch();
    
    switch (entry.entryType) {
      case 'paint':
        if (entry.name === 'first-contentful-paint') {
          batch.vitals.FCP = entry.startTime;
        }
        break;
      case 'largest-contentful-paint':
        batch.vitals.LCP = entry.startTime;
        break;
      case 'first-input':
        batch.vitals.FID = (entry as any).processingStart - entry.startTime;
        break;
      case 'layout-shift':
        if (!(entry as any).hadRecentInput) {
          batch.vitals.CLS = (batch.vitals.CLS || 0) + (entry as any).value;
        }
        break;
    }
  }

  // Registrar métricas personalizadas
  record(
    name: string, 
    value: number, 
    category: string = 'custom',
    tags?: Record<string, string>
  ): void {
    if (Math.random() > this.config.sampleRate) return;

    const batch = this.getCurrentBatch();
    batch.metrics.push({
      name,
      value,
      category,
      tags
    });

    // También registrar en el monitor principal
    performanceMonitor.record(name, value, category as any);

    this.flushIfNeeded();
  }

  // Marcar interacciones del usuario
  recordInteraction(type: string, target?: string, duration?: number): void {
    this.session.interactions++;
    
    this.record(`interaction_${type}`, duration || 0, 'interaction', {
      target: target || 'unknown',
      sessionTime: (Date.now() - this.session.startTime).toString()
    });
  }

  // Marcar navegación de páginas
  recordPageView(path: string): void {
    this.session.pageViews++;
    
    this.record('page_view', Date.now() - this.session.startTime, 'navigation', {
      path,
      pageNumber: this.session.pageViews.toString()
    });
  }

  // Generar reporte de sesión
  generateSessionReport(): {
    session: UserSession;
    performance: {
      averageResponseTime: number;
      slowOperations: number;
      totalOperations: number;
      categoryBreakdown: Record<string, number>;
    };
    vitals: Record<string, number>;
    recommendations: string[];
  } {
    const metrics = performanceMonitor.getMetrics();
    const sessionTime = Date.now() - this.session.startTime;
    
    // Calcular estadísticas de rendimiento
    const totalOperations = metrics.length;
    const averageResponseTime = totalOperations > 0 
      ? metrics.reduce((sum, m) => sum + m.value, 0) / totalOperations
      : 0;
    const slowOperations = metrics.filter(m => m.value > 1000).length;
    
    const categoryBreakdown = metrics.reduce((acc, m) => {
      acc[m.category] = (acc[m.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Obtener últimas métricas vitales
    const lastBatch = this.batchBuffer[this.batchBuffer.length - 1];
    const vitals = lastBatch?.vitals || {};

    // Generar recomendaciones
    const recommendations = this.generateRecommendations({
      averageResponseTime,
      slowOperations,
      vitals,
      sessionTime
    });

    return {
      session: {
        ...this.session,
        totalTime: sessionTime
      },
      performance: {
        averageResponseTime,
        slowOperations,
        totalOperations,
        categoryBreakdown
      },
      vitals,
      recommendations
    };
  }

  private generateRecommendations(data: {
    averageResponseTime: number;
    slowOperations: number;
    vitals: Record<string, number>;
    sessionTime: number;
  }): string[] {
    const recommendations: string[] = [];

    // Análisis de tiempo de respuesta
    if (data.averageResponseTime > 500) {
      recommendations.push('Optimizar tiempo de respuesta general (actual: ' + data.averageResponseTime.toFixed(0) + 'ms)');
    }

    // Análisis de operaciones lentas
    if (data.slowOperations > 5) {
      recommendations.push(`Revisar ${data.slowOperations} operaciones lentas detectadas`);
    }

    // Análisis de Web Vitals
    if (data.vitals.FCP && data.vitals.FCP > 1800) {
      recommendations.push('Mejorar First Contentful Paint (actual: ' + data.vitals.FCP.toFixed(0) + 'ms)');
    }

    if (data.vitals.LCP && data.vitals.LCP > 2500) {
      recommendations.push('Optimizar Largest Contentful Paint (actual: ' + data.vitals.LCP.toFixed(0) + 'ms)');
    }

    if (data.vitals.FID && data.vitals.FID > 100) {
      recommendations.push('Reducir First Input Delay (actual: ' + data.vitals.FID.toFixed(0) + 'ms)');
    }

    if (data.vitals.CLS && data.vitals.CLS > 0.1) {
      recommendations.push('Mejorar Cumulative Layout Shift (actual: ' + data.vitals.CLS.toFixed(3) + ')');
    }

    return recommendations.length > 0 ? recommendations : ['Rendimiento óptimo detectado'];
  }

  private getCurrentBatch(): PerformanceBatch {
    if (this.batchBuffer.length === 0 || this.batchBuffer[this.batchBuffer.length - 1].metrics.length >= this.config.batchSize) {
      const newBatch: PerformanceBatch = {
        sessionId: this.session.id,
        timestamp: Date.now(),
        metrics: [],
        vitals: {}
      };
      this.batchBuffer.push(newBatch);
    }
    
    return this.batchBuffer[this.batchBuffer.length - 1];
  }

  private flushIfNeeded(): void {
    const currentBatch = this.batchBuffer[this.batchBuffer.length - 1];
    if (currentBatch && currentBatch.metrics.length >= this.config.batchSize) {
      this.flush();
    }
  }

  private startBatchFlushing(): void {
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.config.flushInterval);
  }

  private flush(): void {
    if (this.batchBuffer.length === 0) return;

    // Reducir spam de logs - solo cada 5 flushes
    if (this.batchBuffer.length % 5 === 0) {
      console.log('📊 Performance Analytics Batch:', {
        batches: this.batchBuffer.length,
        session: this.session.id,
        totalMetrics: this.batchBuffer.reduce((sum, batch) => sum + batch.metrics.length, 0)
      });
    }

    // Limpiar buffer manteniendo el último batch si tiene métricas
    const lastBatch = this.batchBuffer[this.batchBuffer.length - 1];
    if (lastBatch && lastBatch.metrics.length > 0) {
      this.batchBuffer = [lastBatch];
    } else {
      this.batchBuffer = [];
    }
  }

  // Cleanup
  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    
    if (this.vitalsObserver) {
      this.vitalsObserver.disconnect();
    }
    
    this.flush(); // Enviar datos restantes
  }
}

export const performanceAnalytics = new PerformanceAnalytics();