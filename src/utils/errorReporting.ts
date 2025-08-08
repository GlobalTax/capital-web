// ============= ERROR REPORTING SYSTEM =============
// Sistema avanzado de reporte y gestión de errores

import { devLogger } from './devLogger';
import { performanceMonitor } from '@/utils/unifiedPerformanceMonitor';

export interface ErrorReport {
  id: string;
  timestamp: number;
  message: string;
  stack?: string;
  url: string;
  userAgent: string;
  userId?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  context?: Record<string, any>;
  resolved: boolean;
  reproduced: boolean;
}

export interface ErrorPattern {
  pattern: string;
  count: number;
  lastSeen: number;
  severity: ErrorReport['severity'];
  affectedUsers: Set<string>;
}

class ErrorReportingSystem {
  private reports: ErrorReport[] = [];
  private patterns = new Map<string, ErrorPattern>();
  private maxReports = 500;
  private callbacks: ((error: ErrorReport) => void)[] = [];

  constructor() {
    this.setupGlobalHandlers();
  }

  private setupGlobalHandlers(): void {
    // Capturar errores JavaScript
    window.addEventListener('error', (event) => {
      this.captureError({
        message: event.message,
        stack: event.error?.stack,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        severity: 'high'
      });
    });

    // Capturar promesas rechazadas
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError({
        message: event.reason?.message || 'Unhandled Promise Rejection',
        stack: event.reason?.stack,
        severity: 'medium'
      });
    });

    // Capturar errores de recursos
    window.addEventListener('error', (event) => {
      if (event.target !== window) {
        this.captureError({
          message: `Resource failed to load: ${(event.target as any)?.src || 'unknown'}`,
          severity: 'low'
        });
      }
    }, true);
  }

  captureError(errorData: {
    message: string;
    stack?: string;
    filename?: string;
    lineno?: number;
    colno?: number;
    severity: ErrorReport['severity'];
    context?: Record<string, any>;
    userId?: string;
  }): string {
    const report: ErrorReport = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      message: errorData.message,
      stack: errorData.stack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      userId: errorData.userId,
      severity: errorData.severity,
      context: {
        ...errorData.context,
        filename: errorData.filename,
        line: errorData.lineno,
        column: errorData.colno
      },
      resolved: false,
      reproduced: false
    };

    this.addReport(report);
    this.updatePatterns(report);
    this.notifyCallbacks(report);

    // Log críticos para debugging
    devLogger.error('Error captured', report, 'error-reporting');

    // Monitorear performance de errores
    performanceMonitor.record('error_captured', 1, 'api', { severity: errorData.severity });

    return report.id;
  }

  private addReport(report: ErrorReport): void {
    this.reports.unshift(report);
    
    // Limpiar reportes antiguos
    if (this.reports.length > this.maxReports) {
      this.reports = this.reports.slice(0, this.maxReports);
    }
  }

  private updatePatterns(report: ErrorReport): void {
    const key = this.getPatternKey(report);
    const existing = this.patterns.get(key);

    if (existing) {
      existing.count++;
      existing.lastSeen = report.timestamp;
      if (report.userId) {
        existing.affectedUsers.add(report.userId);
      }
    } else {
      this.patterns.set(key, {
        pattern: key,
        count: 1,
        lastSeen: report.timestamp,
        severity: report.severity,
        affectedUsers: new Set(report.userId ? [report.userId] : [])
      });
    }
  }

  private getPatternKey(report: ErrorReport): string {
    // Crear patrón basado en mensaje y stack trace simplificado
    const message = report.message.substring(0, 100);
    const stackLine = report.stack?.split('\n')[1] || '';
    return `${message}|${stackLine}`;
  }

  private notifyCallbacks(report: ErrorReport): void {
    this.callbacks.forEach(callback => {
      try {
        callback(report);
      } catch (error) {
        console.warn('Error in error reporting callback:', error);
      }
    });
  }

  getReports(options?: {
    severity?: ErrorReport['severity'];
    resolved?: boolean;
    userId?: string;
    limit?: number;
  }): ErrorReport[] {
    let filtered = [...this.reports];

    if (options?.severity) {
      filtered = filtered.filter(r => r.severity === options.severity);
    }

    if (options?.resolved !== undefined) {
      filtered = filtered.filter(r => r.resolved === options.resolved);
    }

    if (options?.userId) {
      filtered = filtered.filter(r => r.userId === options.userId);
    }

    return filtered.slice(0, options?.limit || filtered.length);
  }

  getPatterns(minCount = 2): ErrorPattern[] {
    return Array.from(this.patterns.values())
      .filter(p => p.count >= minCount)
      .sort((a, b) => b.count - a.count);
  }

  getErrorStats() {
    const total = this.reports.length;
    const unresolved = this.reports.filter(r => !r.resolved).length;
    const critical = this.reports.filter(r => r.severity === 'critical').length;
    const recentHour = this.reports.filter(r => Date.now() - r.timestamp < 3600000).length;

    return {
      total,
      unresolved,
      critical,
      recentHour,
      resolvedRate: total > 0 ? ((total - unresolved) / total) * 100 : 0
    };
  }

  markResolved(reportId: string): boolean {
    const report = this.reports.find(r => r.id === reportId);
    if (report) {
      report.resolved = true;
      return true;
    }
    return false;
  }

  markReproduced(reportId: string): boolean {
    const report = this.reports.find(r => r.id === reportId);
    if (report) {
      report.reproduced = true;
      return true;
    }
    return false;
  }

  onError(callback: (error: ErrorReport) => void): () => void {
    this.callbacks.push(callback);
    return () => {
      const index = this.callbacks.indexOf(callback);
      if (index > -1) {
        this.callbacks.splice(index, 1);
      }
    };
  }

  clear(): void {
    this.reports = [];
    this.patterns.clear();
  }

  exportReports(): string {
    return JSON.stringify({
      timestamp: Date.now(),
      reports: this.reports,
      patterns: Array.from(this.patterns.entries()),
      stats: this.getErrorStats()
    }, null, 2);
  }
}

export const errorReporting = new ErrorReportingSystem();