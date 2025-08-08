// ============= PERFORMANCE TYPES =============
// Tipos centralizados para el sistema de performance

export interface PerformanceMetric {
  name: string;
  value: number;
  category: 'loading' | 'interaction' | 'database' | 'api' | 'rendering' | 'navigation';
  timestamp: number;
  tags?: Record<string, string>;
}

export interface WebVitals {
  FCP?: number;
  LCP?: number;
  FID?: number;
  INP?: number;
  CLS?: number;
}

export interface PerformanceConfig {
  enabled: boolean;
  maxMetrics: number;
  flushInterval: number;
  thresholds: Record<string, number>;
  endpoint?: string;
  useBeacon: boolean;
  sampleRate: number;
  batchSize: number;
  maxQueueSize: number;
}

export interface PerformanceAlert {
  type: 'cache_miss' | 'slow_query' | 'rate_limit' | 'error_spike' | 'web_vital';
  message: string;
  threshold: number;
  current: number;
  timestamp: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface PerformanceStats {
  totalOperations: number;
  averageResponseTime: number;
  slowOperations: number;
  errorCount: number;
  categoryBreakdown: Record<string, number>;
  recentTrend: 'improving' | 'stable' | 'degrading';
}