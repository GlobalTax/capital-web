/**
 * Sistema de Monitoreo y Alertas Críticas
 * Detecta problemas de rendimiento, seguridad y errores críticos
 */

import { secureLogger } from './secureLogger';

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  component?: string;
}

interface SecurityAlert {
  type: 'xss_attempt' | 'suspicious_activity' | 'rate_limit_exceeded' | 'unauthorized_access';
  severity: 'medium' | 'high' | 'critical';
  details: Record<string, any>;
  timestamp: number;
}

class MonitoringSystem {
  private performanceMetrics: PerformanceMetric[] = [];
  private securityAlerts: SecurityAlert[] = [];
  private isProduction = window.location.hostname !== 'localhost';
  
  // Configuración de umbrales
  private thresholds = {
    slowPageLoad: 3000, // 3 segundos
    slowApiCall: 2000,  // 2 segundos
    highMemoryUsage: 100 * 1024 * 1024, // 100MB
    suspiciousActivity: 10, // 10 eventos sospechosos en 5 minutos
    rateLimitThreshold: 100 // 100 requests por minuto
  };

  private requestCounts = new Map<string, { count: number; lastReset: number }>();

  /**
   * Monitorear rendimiento de página
   */
  monitorPagePerformance(): void {
    try {
      // Usar Navigation Timing API
      const navigationTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (navigationTiming) {
        const loadTime = navigationTiming.loadEventEnd - navigationTiming.fetchStart;
        const domContentLoaded = navigationTiming.domContentLoadedEventEnd - navigationTiming.fetchStart;
        
        this.recordMetric('page_load_time', loadTime);
        this.recordMetric('dom_content_loaded', domContentLoaded);
        
        if (loadTime > this.thresholds.slowPageLoad) {
          secureLogger.warn('Slow page load detected', {
            loadTime,
            threshold: this.thresholds.slowPageLoad,
            page: window.location.pathname
          }, { context: 'performance', component: 'page_monitor' });
        }
      }
      
      // Monitorear memoria si está disponible
      if ('memory' in performance) {
        const memInfo = (performance as any).memory;
        this.recordMetric('memory_used', memInfo.usedJSHeapSize);
        
        if (memInfo.usedJSHeapSize > this.thresholds.highMemoryUsage) {
          secureLogger.error('High memory usage detected', {
            used: memInfo.usedJSHeapSize,
            total: memInfo.totalJSHeapSize,
            limit: memInfo.jsHeapSizeLimit
          }, { context: 'performance', component: 'memory_monitor' });
        }
      }
    } catch (error) {
      secureLogger.error('Error monitoring page performance', error, { 
        context: 'performance', 
        component: 'page_monitor' 
      });
    }
  }

  /**
   * Monitorear rendimiento de API calls
   */
  monitorApiCall(url: string, startTime: number, endTime: number, status?: number): void {
    const duration = endTime - startTime;
    
    this.recordMetric('api_call_duration', duration, 'api_monitor');
    
    if (duration > this.thresholds.slowApiCall) {
      secureLogger.warn('Slow API call detected', {
        url,
        duration,
        threshold: this.thresholds.slowApiCall,
        status
      }, { context: 'performance', component: 'api_monitor' });
    }

    // Detectar errores de API
    if (status && status >= 400) {
      secureLogger.error('API call failed', {
        url,
        status,
        duration
      }, { context: 'api', component: 'api_monitor' });
    }
  }

  /**
   * Detectar intentos de XSS
   */
  detectXSSAttempt(input: string, source: string): boolean {
    const xssPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe[^>]*>/gi,
      /eval\s*\(/gi,
      /expression\s*\(/gi
    ];

    const hasXSS = xssPatterns.some(pattern => pattern.test(input));

    if (hasXSS) {
      this.createSecurityAlert('xss_attempt', 'high', {
        input: input.substring(0, 200), // Limitar longitud
        source,
        patterns_detected: xssPatterns.filter(p => p.test(input)).length
      });

      secureLogger.critical('XSS attempt detected', {
        source,
        input_length: input.length,
        patterns_found: xssPatterns.filter(p => p.test(input)).length
      }, { context: 'security', component: 'xss_detector' });
    }

    return hasXSS;
  }

  /**
   * Monitorear rate limiting
   */
  checkRateLimit(identifier: string, action: string): boolean {
    const key = `${identifier}_${action}`;
    const now = Date.now();
    const windowMs = 60000; // 1 minuto
    
    const current = this.requestCounts.get(key) || { count: 0, lastReset: now };
    
    // Reset contador si ha pasado la ventana de tiempo
    if (now - current.lastReset > windowMs) {
      current.count = 0;
      current.lastReset = now;
    }
    
    current.count++;
    this.requestCounts.set(key, current);
    
    const exceeded = current.count > this.thresholds.rateLimitThreshold;
    
    if (exceeded) {
      this.createSecurityAlert('rate_limit_exceeded', 'medium', {
        identifier,
        action,
        request_count: current.count,
        threshold: this.thresholds.rateLimitThreshold
      });

      secureLogger.warn('Rate limit exceeded', {
        identifier,
        action,
        count: current.count,
        threshold: this.thresholds.rateLimitThreshold
      }, { context: 'security', component: 'rate_limiter' });
    }
    
    return !exceeded;
  }

  /**
   * Detectar actividad sospechosa
   */
  detectSuspiciousActivity(events: string[]): void {
    const recentEvents = events.filter(event => 
      Date.now() - new Date(event).getTime() < 5 * 60 * 1000 // 5 minutos
    );

    if (recentEvents.length >= this.thresholds.suspiciousActivity) {
      this.createSecurityAlert('suspicious_activity', 'critical', {
        event_count: recentEvents.length,
        threshold: this.thresholds.suspiciousActivity,
        user_agent: navigator.userAgent,
        location: window.location.href
      });

      secureLogger.critical('Suspicious activity pattern detected', {
        events: recentEvents.length,
        threshold: this.thresholds.suspiciousActivity
      }, { context: 'security', component: 'activity_detector' });
    }
  }

  /**
   * Registrar métrica de rendimiento
   */
  private recordMetric(name: string, value: number, component?: string): void {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      component
    };

    this.performanceMetrics.push(metric);

    // Mantener solo las últimas 1000 métricas
    if (this.performanceMetrics.length > 1000) {
      this.performanceMetrics = this.performanceMetrics.slice(-1000);
    }

    // Log solo si es una métrica crítica
    if (this.isMetricCritical(name, value)) {
      secureLogger.info(`Performance metric: ${name}`, {
        value,
        component,
        timestamp: metric.timestamp
      }, { context: 'performance', component: component || 'monitor' });
    }
  }

  /**
   * Crear alerta de seguridad
   */
  private createSecurityAlert(type: SecurityAlert['type'], severity: SecurityAlert['severity'], details: Record<string, any>): void {
    const alert: SecurityAlert = {
      type,
      severity,
      details,
      timestamp: Date.now()
    };

    this.securityAlerts.push(alert);

    // Mantener solo las últimas 100 alertas
    if (this.securityAlerts.length > 100) {
      this.securityAlerts = this.securityAlerts.slice(-100);
    }
  }

  /**
   * Determinar si una métrica es crítica
   */
  private isMetricCritical(name: string, value: number): boolean {
    switch (name) {
      case 'page_load_time':
        return value > this.thresholds.slowPageLoad;
      case 'api_call_duration':
        return value > this.thresholds.slowApiCall;
      case 'memory_used':
        return value > this.thresholds.highMemoryUsage;
      default:
        return false;
    }
  }

  /**
   * Obtener métricas de rendimiento recientes
   */
  getRecentMetrics(minutes: number = 10): PerformanceMetric[] {
    const cutoff = Date.now() - (minutes * 60 * 1000);
    return this.performanceMetrics.filter(metric => metric.timestamp > cutoff);
  }

  /**
   * Obtener alertas de seguridad recientes
   */
  getRecentAlerts(minutes: number = 60): SecurityAlert[] {
    const cutoff = Date.now() - (minutes * 60 * 1000);
    return this.securityAlerts.filter(alert => alert.timestamp > cutoff);
  }

  /**
   * Generar reporte de salud del sistema
   */
  generateHealthReport(): {
    performance: {
      averagePageLoad: number;
      averageApiResponse: number;
      memoryUsage: number;
    };
    security: {
      totalAlerts: number;
      criticalAlerts: number;
      recentActivity: number;
    };
    system: {
      uptime: number;
      errorRate: number;
    };
  } {
    const recentMetrics = this.getRecentMetrics(30); // últimos 30 minutos
    const recentAlerts = this.getRecentAlerts(60); // última hora

    const pageLoadMetrics = recentMetrics.filter(m => m.name === 'page_load_time');
    const apiMetrics = recentMetrics.filter(m => m.name === 'api_call_duration');
    const memoryMetrics = recentMetrics.filter(m => m.name === 'memory_used');

    return {
      performance: {
        averagePageLoad: pageLoadMetrics.length > 0 
          ? pageLoadMetrics.reduce((sum, m) => sum + m.value, 0) / pageLoadMetrics.length 
          : 0,
        averageApiResponse: apiMetrics.length > 0 
          ? apiMetrics.reduce((sum, m) => sum + m.value, 0) / apiMetrics.length 
          : 0,
        memoryUsage: memoryMetrics.length > 0 
          ? memoryMetrics[memoryMetrics.length - 1].value 
          : 0
      },
      security: {
        totalAlerts: recentAlerts.length,
        criticalAlerts: recentAlerts.filter(a => a.severity === 'critical').length,
        recentActivity: recentAlerts.filter(a => a.timestamp > Date.now() - 5 * 60 * 1000).length
      },
      system: {
        uptime: Date.now() - performance.timeOrigin,
        errorRate: secureLogger.getStoredLogs().filter(log => log.level === 'error').length
      }
    };
  }

  /**
   * Inicializar monitoreo automático
   */
  initialize(): void {
    // Monitorear rendimiento de página al cargar
    if (document.readyState === 'complete') {
      this.monitorPagePerformance();
    } else {
      window.addEventListener('load', () => this.monitorPagePerformance());
    }

    // Monitorear cambios de ruta (si usando React Router)
    let lastUrl = window.location.href;
    new MutationObserver(() => {
      const currentUrl = window.location.href;
      if (currentUrl !== lastUrl) {
        lastUrl = currentUrl;
        // Pequeño delay para que el componente se monte
        setTimeout(() => this.monitorPagePerformance(), 100);
      }
    }).observe(document, { subtree: true, childList: true });

    secureLogger.info('Monitoring system initialized', {
      production: this.isProduction,
      thresholds: this.thresholds
    }, { context: 'system', component: 'monitoring_system' });
  }
}

// Instancia singleton
export const monitoringSystem = new MonitoringSystem();

// Auto-inicializar cuando se importe
monitoringSystem.initialize();

export default monitoringSystem;