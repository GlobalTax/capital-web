/**
 * Hook para utilizar el sistema de logging seguro
 * Proporciona métodos optimizados para logging en componentes React
 */

import { useCallback, useEffect, useMemo } from 'react';
import { secureLogger, type LogLevel, type LogContext } from '@/utils/secureLogger';
import { monitoringSystem } from '@/utils/monitoringSystem';

interface LogOptions {
  context?: LogContext;
  component?: string;
}

interface PerformanceTracker {
  start: () => void;
  end: (name: string) => void;
}

export const useSecureLogger = (defaultComponent?: string) => {
  // Crear logger con contexto de componente por defecto
  const logger = useMemo(() => ({
    debug: (message: string, data?: any, options?: LogOptions) => {
      secureLogger.debug(message, data, {
        component: options?.component || defaultComponent,
        context: options?.context || 'user_action'
      });
    },
    
    info: (message: string, data?: any, options?: LogOptions) => {
      secureLogger.info(message, data, {
        component: options?.component || defaultComponent,
        context: options?.context || 'user_action'
      });
    },
    
    warn: (message: string, data?: any, options?: LogOptions) => {
      secureLogger.warn(message, data, {
        component: options?.component || defaultComponent,
        context: options?.context || 'user_action'
      });
    },
    
    error: (message: string, data?: any, options?: LogOptions) => {
      secureLogger.error(message, data, {
        component: options?.component || defaultComponent,
        context: options?.context || 'system'
      });
    },
    
    critical: (message: string, data?: any, options?: LogOptions) => {
      secureLogger.critical(message, data, {
        component: options?.component || defaultComponent,
        context: options?.context || 'security'
      });
    }
  }), [defaultComponent]);

  // Tracking de rendimiento para componentes
  const createPerformanceTracker = useCallback((operation: string): PerformanceTracker => {
    let startTime = 0;
    
    return {
      start: () => {
        startTime = performance.now();
      },
      end: (name?: string) => {
        const endTime = performance.now();
        const operationName = name || operation;
        
        monitoringSystem.monitorApiCall(
          `component_operation_${operationName}`,
          startTime,
          endTime
        );
        
        logger.debug(`Performance: ${operationName}`, {
          duration: endTime - startTime,
          operation: operationName
        }, { context: 'performance' });
      }
    };
  }, [logger]);

  // Logging de errores de React
  const logReactError = useCallback((error: Error, errorInfo?: any) => {
    logger.critical('React component error', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo?.componentStack,
      errorBoundary: defaultComponent
    }, { context: 'system' });
  }, [logger, defaultComponent]);

  // Logging de eventos de usuario
  const logUserAction = useCallback((action: string, data?: any) => {
    logger.info(`User action: ${action}`, data, { 
      context: 'user_action' 
    });
  }, [logger]);

  // Logging de navegación
  const logNavigation = useCallback((from: string, to: string) => {
    logger.debug('Navigation', { from, to }, { 
      context: 'user_action' 
    });
  }, [logger]);

  // Logging de errores de API
  const logApiError = useCallback((endpoint: string, error: any, status?: number) => {
    logger.error('API call failed', {
      endpoint,
      error: error?.message || error,
      status,
      timestamp: new Date().toISOString()
    }, { context: 'api' });
  }, [logger]);

  // Detectar XSS en inputs
  const validateInput = useCallback((input: string, fieldName: string): boolean => {
    const isXSS = monitoringSystem.detectXSSAttempt(input, `${defaultComponent || 'unknown'}_${fieldName}`);
    
    if (isXSS) {
      logger.critical('XSS attempt in user input', {
        field: fieldName,
        inputLength: input.length,
        component: defaultComponent
      }, { context: 'security' });
    }
    
    return !isXSS;
  }, [logger, defaultComponent]);

  // Rate limiting check
  const checkRateLimit = useCallback((action: string, userId?: string): boolean => {
    const identifier = userId || 'anonymous';
    const allowed = monitoringSystem.checkRateLimit(identifier, action);
    
    if (!allowed) {
      logger.warn('Rate limit exceeded', {
        action,
        identifier,
        component: defaultComponent
      }, { context: 'security' });
    }
    
    return allowed;
  }, [logger, defaultComponent]);

  // Log cuando el componente se monta/desmonta (desarrollo)
  useEffect(() => {
    if (defaultComponent) {
      logger.debug(`Component mounted: ${defaultComponent}`, undefined, { 
        context: 'system' 
      });
      
      return () => {
        logger.debug(`Component unmounted: ${defaultComponent}`, undefined, { 
          context: 'system' 
        });
      };
    }
  }, [defaultComponent, logger]);

  return {
    // Métodos de logging básicos
    ...logger,
    
    // Métodos especializados
    logReactError,
    logUserAction,
    logNavigation,
    logApiError,
    
    // Utilidades de seguridad
    validateInput,
    checkRateLimit,
    
    // Performance tracking
    createPerformanceTracker,
    
    // Acceso directo al logger si necesario
    rawLogger: secureLogger,
    
    // Métodos de monitoreo
    getHealthReport: () => monitoringSystem.generateHealthReport(),
    getRecentLogs: () => secureLogger.getStoredLogs(),
    getRecentAlerts: () => monitoringSystem.getRecentAlerts()
  };
};

export default useSecureLogger;