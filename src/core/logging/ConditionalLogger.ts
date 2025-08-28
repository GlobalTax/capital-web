// ============= CONDITIONAL LOGGING SYSTEM =============
// Sistema de logging condicional optimizado para producción

import { logger } from '@/utils/logger';
import { devLogger } from '@/utils/devLogger';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export type LogContext = 'auth' | 'marketing' | 'api' | 'ui' | 'system' | 'performance' | 'ai' | 'admin' | 'form' | 'valuation' | 'security' | 'database';

interface ConditionalLogOptions {
  context?: LogContext;
  component?: string;
  userId?: string;
  data?: unknown;
  onlyInDev?: boolean;
  errorCode?: string;
}

class ConditionalLogger {
  private static instance: ConditionalLogger;
  private isDevelopment = import.meta.env.DEV;
  private isProduction = import.meta.env.PROD;
  private logLevels = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3
  };

  private constructor() {}

  static getInstance(): ConditionalLogger {
    if (!ConditionalLogger.instance) {
      ConditionalLogger.instance = new ConditionalLogger();
    }
    return ConditionalLogger.instance;
  }

  /**
   * Log de debug - solo en desarrollo
   */
  debug(message: string, options: ConditionalLogOptions = {}): void {
    if (!this.isDevelopment) return;
    
    devLogger.debug(message, options.data, options.context, options.component);
  }

  /**
   * Log de información - solo en desarrollo
   */
  info(message: string, options: ConditionalLogOptions = {}): void {
    if (options.onlyInDev && !this.isDevelopment) return;
    
    if (this.isDevelopment) {
      devLogger.info(message, options.data, options.context, options.component);
    }
  }

  /**
   * Log de advertencia - solo en desarrollo
   */
  warn(message: string, options: ConditionalLogOptions = {}): void {
    if (options.onlyInDev && !this.isDevelopment) return;
    
    if (this.isDevelopment) {
      devLogger.warn(message, options.data, options.context, options.component);
    }
  }

  /**
   * Log de error - siempre activo para errores críticos
   */
  error(message: string, error?: Error, options: ConditionalLogOptions = {}): void {
    // En producción, solo loggear errores críticos
    if (this.isProduction) {
      // Filtrar errores no críticos en producción
      const nonCriticalErrors = [
        'tracking',
        '404',
        'network timeout',
        'user cancelled',
        'permission denied'
      ];
      
      const isNonCritical = nonCriticalErrors.some(pattern => 
        message.toLowerCase().includes(pattern) || 
        error?.message?.toLowerCase().includes(pattern)
      );
      
      if (isNonCritical) return;
    }

    // Log estructurado para ambos entornos
    logger.error(message, error, {
      context: options.context || 'system',
      component: options.component,
      userId: options.userId,
      data: {
        ...(options.data as Record<string, any> || {}),
        errorCode: options.errorCode,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      }
    });

    // En desarrollo, también usar devLogger para mejor visualización
    if (this.isDevelopment) {
      devLogger.error(message, { error, ...(options.data as Record<string, any> || {}) }, options.context, options.component);
    }
  }

  /**
   * Log condicional basado en nivel
   */
  log(level: LogLevel, message: string, error?: Error, options: ConditionalLogOptions = {}): void {
    switch (level) {
      case 'debug':
        this.debug(message, options);
        break;
      case 'info':
        this.info(message, options);
        break;
      case 'warn':
        this.warn(message, options);
        break;
      case 'error':
        this.error(message, error, options);
        break;
    }
  }

  /**
   * Timer de performance - solo en desarrollo
   */
  time(label: string, context?: LogContext): void {
    if (!this.isDevelopment) return;
    console.time(label);
  }

  timeEnd(label: string, context?: LogContext): void {
    if (!this.isDevelopment) return;
    console.timeEnd(label);
  }

  /**
   * Log de operaciones críticas - siempre activo
   */
  logCritical(operation: string, data?: unknown, error?: Error): void {
    this.error(`CRITICAL: ${operation}`, error, {
      context: 'system',
      data,
      errorCode: 'CRITICAL_OPERATION'
    });
  }

  /**
   * Log de seguridad - siempre activo
   */
  logSecurity(event: string, data?: unknown): void {
    this.error(`SECURITY: ${event}`, undefined, {
      context: 'security',
      data,
      errorCode: 'SECURITY_EVENT'
    });
  }

  /**
   * Cleanup de logs en memoria
   */
  cleanup(): void {
    if (this.isDevelopment) {
      devLogger.clear();
    }
  }
}

// Export singleton instance
export const conditionalLogger = ConditionalLogger.getInstance();

// Helper functions para uso común
export const logError = (message: string, error?: Error, options?: ConditionalLogOptions) => {
  conditionalLogger.error(message, error, options);
};

export const logWarning = (message: string, options?: ConditionalLogOptions) => {
  conditionalLogger.warn(message, { ...options, onlyInDev: true });
};

export const logInfo = (message: string, options?: ConditionalLogOptions) => {
  conditionalLogger.info(message, { ...options, onlyInDev: true });
};

export const logDebug = (message: string, options?: ConditionalLogOptions) => {
  conditionalLogger.debug(message, options);
};

export default conditionalLogger;