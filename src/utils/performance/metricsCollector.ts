// ============= METRICS COLLECTOR =============
// Módulo para recolección y gestión de métricas

import type { PerformanceMetric, PerformanceConfig } from './types';

export class MetricsCollector {
  private metrics: PerformanceMetric[] = [];
  private config: PerformanceConfig;

  constructor(config: PerformanceConfig) {
    this.config = config;
  }

  addMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);
    this.cleanup();
    
    // Log críticos para debugging
    if (metric.value > this.config.thresholds[metric.category] * 2) {
      console.warn(`🐌 Slow ${metric.category}: ${metric.name} (${metric.value}ms)`);
    }
  }

  getMetrics(category?: PerformanceMetric['category']): PerformanceMetric[] {
    return category 
      ? this.metrics.filter(m => m.category === category)
      : [...this.metrics];
  }

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

  getSlowOperations(threshold?: number): PerformanceMetric[] {
    return this.metrics.filter(m => {
      const effectiveThreshold = threshold || this.config.thresholds[m.category];
      return m.value > effectiveThreshold;
    }).sort((a, b) => b.value - a.value);
  }

  clear(): void {
    this.metrics = [];
  }

  updateConfig(config: Partial<PerformanceConfig>): void {
    this.config = { ...this.config, ...config };
  }

  private cleanup(): void {
    // Limpiar por cantidad
    if (this.metrics.length > this.config.maxMetrics) {
      this.metrics = this.metrics.slice(-this.config.maxMetrics * 0.8);
    }

    // Limpiar por tiempo (métricas de más de 1 hora)
    const oneHourAgo = Date.now() - 3600000;
    this.metrics = this.metrics.filter(m => m.timestamp > oneHourAgo);
  }
}