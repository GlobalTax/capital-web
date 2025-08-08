// ============= WEB VITALS COLLECTOR =============
// Módulo especializado en recolección de Web Vitals

import type { WebVitals, PerformanceMetric } from './types';

export class WebVitalsCollector {
  private vitals: WebVitals = {};
  private observer?: PerformanceObserver;
  private recordCallback?: (metric: PerformanceMetric) => void;

  constructor(onRecord?: (metric: PerformanceMetric) => void) {
    this.recordCallback = onRecord;
    this.setupObserver();
  }

  getVitals(): WebVitals {
    return { ...this.vitals };
  }

  private setupObserver(): void {
    if (!('PerformanceObserver' in window)) return;

    this.observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.processEntry(entry);
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

  private processEntry(entry: PerformanceEntry): void {
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
        const e: any = entry;
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

  private record(name: string, value: number, category: PerformanceMetric['category'], tags?: Record<string, string>): void {
    if (this.recordCallback) {
      this.recordCallback({
        name,
        value,
        category,
        timestamp: Date.now(),
        tags
      });
    }
  }

  destroy(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = undefined;
    }
  }
}