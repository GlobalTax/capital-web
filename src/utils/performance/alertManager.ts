// ============= ALERT MANAGER =============
// Sistema de alertas avanzado para métricas de performance

import type { PerformanceMetric, PerformanceAlert } from './types';

export class AlertManager {
  private alerts: PerformanceAlert[] = [];
  private thresholds: Record<string, number> = {
    'slow_query': 2000,
    'cache_miss': 0.7, // 70% miss rate
    'rate_limit': 10, // 10 hits per minute
    'error_spike': 5, // 5% error rate
    'web_vital_lcp': 2500,
    'web_vital_fid': 100,
    'web_vital_cls': 0.1
  };
  private callbacks: Array<(alert: PerformanceAlert) => void> = [];

  addThreshold(type: string, threshold: number): void {
    this.thresholds[type] = threshold;
  }

  checkMetric(metric: PerformanceMetric): PerformanceAlert | null {
    let alert: PerformanceAlert | null = null;

    // Check database metrics
    if (metric.category === 'database' && metric.value > this.thresholds.slow_query) {
      alert = {
        type: 'slow_query',
        message: `Query lenta detectada: ${metric.name} (${metric.value}ms)`,
        threshold: this.thresholds.slow_query,
        current: metric.value,
        timestamp: metric.timestamp,
        severity: metric.value > this.thresholds.slow_query * 2 ? 'critical' : 'high'
      };
    }

    // Check API metrics
    else if (metric.category === 'api' && metric.name === 'Rate Limit Hit') {
      const recentHits = this.getRecentMetrics('api', 60000) // Last minute
        .filter(m => m.name === 'Rate Limit Hit').length;
      
      if (recentHits >= this.thresholds.rate_limit) {
        alert = {
          type: 'rate_limit',
          message: `Rate limit excedido: ${recentHits} hits en el último minuto`,
          threshold: this.thresholds.rate_limit,
          current: recentHits,
          timestamp: metric.timestamp,
          severity: recentHits > this.thresholds.rate_limit * 2 ? 'critical' : 'medium'
        };
      }
    }

    // Check Web Vitals
    else if (metric.category === 'loading') {
      if (metric.name === 'LCP' && metric.value > this.thresholds.web_vital_lcp) {
        alert = {
          type: 'web_vital',
          message: `LCP degradado: ${metric.value}ms (threshold: ${this.thresholds.web_vital_lcp}ms)`,
          threshold: this.thresholds.web_vital_lcp,
          current: metric.value,
          timestamp: metric.timestamp,
          severity: metric.value > this.thresholds.web_vital_lcp * 1.5 ? 'high' : 'medium'
        };
      }
    }

    else if (metric.category === 'interaction') {
      if (metric.name === 'FID' && metric.value > this.thresholds.web_vital_fid) {
        alert = {
          type: 'web_vital',
          message: `FID degradado: ${metric.value}ms (threshold: ${this.thresholds.web_vital_fid}ms)`,
          threshold: this.thresholds.web_vital_fid,
          current: metric.value,
          timestamp: metric.timestamp,
          severity: metric.value > this.thresholds.web_vital_fid * 2 ? 'high' : 'medium'
        };
      }
    }

    if (alert) {
      this.addAlert(alert);
    }

    return alert;
  }

  addAlert(alert: PerformanceAlert): void {
    // Evitar duplicados recientes (mismo tipo en los últimos 5 minutos)
    const recentSimilar = this.alerts.find(a => 
      a.type === alert.type && 
      (alert.timestamp - a.timestamp) < 300000 // 5 minutos
    );

    if (!recentSimilar) {
      this.alerts.push(alert);
      this.cleanup();
      this.notifyCallbacks(alert);
    }
  }

  getAlerts(severity?: PerformanceAlert['severity']): PerformanceAlert[] {
    const filtered = severity 
      ? this.alerts.filter(a => a.severity === severity)
      : this.alerts;
    
    return filtered.sort((a, b) => b.timestamp - a.timestamp);
  }

  getActiveAlerts(): PerformanceAlert[] {
    const fifteenMinutesAgo = Date.now() - 900000; // 15 minutos
    return this.alerts.filter(a => a.timestamp > fifteenMinutesAgo);
  }

  clearAlerts(): void {
    this.alerts = [];
  }

  onAlert(callback: (alert: PerformanceAlert) => void): () => void {
    this.callbacks.push(callback);
    
    // Retornar función de cleanup
    return () => {
      const index = this.callbacks.indexOf(callback);
      if (index > -1) {
        this.callbacks.splice(index, 1);
      }
    };
  }

  updateThresholds(newThresholds: Partial<Record<string, number>>): void {
    this.thresholds = { ...this.thresholds, ...newThresholds };
  }

  private getRecentMetrics(category: string, timeWindow: number): PerformanceMetric[] {
    // Esta función sería implementada para obtener métricas recientes
    // Por ahora retornamos array vacío
    return [];
  }

  private notifyCallbacks(alert: PerformanceAlert): void {
    this.callbacks.forEach(callback => {
      try {
        callback(alert);
      } catch (error) {
        console.warn('Alert callback failed:', error);
      }
    });
  }

  private cleanup(): void {
    // Mantener solo las últimas 100 alertas
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-80); // Mantener 80
    }

    // Limpiar alertas de más de 24 horas
    const oneDayAgo = Date.now() - 86400000;
    this.alerts = this.alerts.filter(a => a.timestamp > oneDayAgo);
  }
}