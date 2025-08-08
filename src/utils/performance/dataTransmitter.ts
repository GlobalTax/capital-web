// ============= DATA TRANSMITTER =============
// Módulo para envío de datos por beacon/fetch con batching

import type { PerformanceMetric, PerformanceConfig, WebVitals } from './types';

export class DataTransmitter {
  private sendQueue: PerformanceMetric[] = [];
  private config: PerformanceConfig;
  private vitals: WebVitals;

  constructor(config: PerformanceConfig, vitals: WebVitals) {
    this.config = config;
    this.vitals = vitals;
    this.setupPageUnloadHandlers();
  }

  enqueue(metric: PerformanceMetric): void {
    if (!this.config.endpoint) return;
    
    this.sendQueue.push(metric);
    
    // Limitar tamaño de cola
    if (this.sendQueue.length > this.config.maxQueueSize) {
      this.sendQueue = this.sendQueue.slice(-this.config.maxQueueSize);
    }
    
    // Enviar lote si está lleno
    if (this.sendQueue.length >= this.config.batchSize) {
      this.flush();
    }
  }

  flush(preferBeacon = false): void {
    if (!this.config.endpoint || this.sendQueue.length === 0) return;

    const batch = this.sendQueue.splice(0, this.config.batchSize);
    const payload = JSON.stringify({
      timestamp: Date.now(),
      vitals: this.vitals,
      metrics: batch,
      userAgent: navigator.userAgent,
      url: window.location.href
    });

    const shouldUseBeacon = this.shouldUseBeacon(preferBeacon);

    if (shouldUseBeacon) {
      this.sendViaBeacon(payload, batch);
    } else {
      this.sendViaFetch(payload, batch);
    }
  }

  updateConfig(config: Partial<PerformanceConfig>): void {
    this.config = { ...this.config, ...config };
  }

  private shouldUseBeacon(preferBeacon: boolean): boolean {
    return this.config.useBeacon && 
           (preferBeacon || document.visibilityState === 'hidden') && 
           'sendBeacon' in navigator;
  }

  private sendViaBeacon(payload: string, batch: PerformanceMetric[]): void {
    try {
      const blob = new Blob([payload], { type: 'application/json' });
      const success = navigator.sendBeacon(this.config.endpoint!, blob);
      
      if (!success) {
        // Reinsertamos si el beacon falla
        this.sendQueue.unshift(...batch);
      }
    } catch (error) {
      console.warn('Beacon send failed:', error);
      this.sendQueue.unshift(...batch);
    }
  }

  private sendViaFetch(payload: string, batch: PerformanceMetric[]): void {
    try {
      fetch(this.config.endpoint!, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true
      }).catch(error => {
        console.warn('Fetch send failed:', error);
        this.sendQueue.unshift(...batch);
      });
    } catch (error) {
      console.warn('Fetch setup failed:', error);
      this.sendQueue.unshift(...batch);
    }
  }

  private setupPageUnloadHandlers(): void {
    const flushData = () => this.flush(true);
    
    // Múltiples eventos para asegurar el envío
    window.addEventListener('pagehide', flushData, { capture: true });
    window.addEventListener('beforeunload', flushData);
    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        flushData();
      }
    });
  }
}