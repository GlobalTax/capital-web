// ============= DEVELOPMENT LOGGER =============
// Simplified logging for development - only critical errors in production

import { logger } from './logger';

interface DevLoggerOptions {
  context?: string;
  component?: string;
  userId?: string;
}

class DevLogger {
  private isDev = process.env.NODE_ENV === 'development';

  info(message: string, data?: unknown, context?: string): void {
    if (this.isDev) {
      logger.info(message, data, { context: context as any, component: 'DevLogger' });
    }
  }

  warn(message: string, data?: unknown, context?: string): void {
    if (this.isDev) {
      logger.warn(message, data, { context: context as any, component: 'DevLogger' });
    }
  }

  error(message: string, error?: Error | unknown, options?: DevLoggerOptions): void {
    // Always log errors, but in production only critical ones
    if (this.isDev) {
      logger.error(message, error as Error, { 
        context: options?.context as any, 
        component: options?.component || 'DevLogger',
        userId: options?.userId 
      });
    } else if (error instanceof Error && this.isCriticalError(error)) {
      // Only log critical errors in production
      logger.error(message, error, { 
        context: 'system', 
        component: 'Critical',
        userId: options?.userId 
      });
    }
  }

  debug(message: string, data?: unknown, context?: string): void {
    if (this.isDev) {
      logger.debug(message, data, { context: context as any, component: 'DevLogger' });
    }
  }

  // Wrapper for API errors
  apiError(message: string, error: unknown, endpoint?: string): void {
    this.error(`API Error: ${message}`, error as Error, { 
      context: 'api',
      component: endpoint || 'unknown' 
    });
  }

  // Wrapper for form errors
  formError(message: string, error: unknown, formName?: string): void {
    this.error(`Form Error: ${message}`, error as Error, { 
      context: 'form',
      component: formName || 'unknown' 
    });
  }

  // Wrapper for database errors
  dbError(message: string, error: unknown, table?: string): void {
    this.error(`Database Error: ${message}`, error as Error, { 
      context: 'database',
      component: table || 'unknown' 
    });
  }

  private isCriticalError(error: Error): boolean {
    const criticalPatterns = [
      'network',
      'authentication',
      'authorization',  
      'database',
      'payment',
      'security'
    ];
    
    const errorMessage = error.message.toLowerCase();
    return criticalPatterns.some(pattern => errorMessage.includes(pattern));
  }
}

export const devLogger = new DevLogger();