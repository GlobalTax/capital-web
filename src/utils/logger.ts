
import { supabase } from '@/integrations/supabase/client';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export type LogContext = 'auth' | 'marketing' | 'api' | 'ui' | 'system' | 'performance' | 'ai' | 'admin' | 'form' | 'valuation' | 'security' | 'database' | 'audit' | 'role_management' | 'user_management';

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: LogContext;
  component?: string;
  userId?: string;
  sessionId?: string;
  data?: unknown;
  error?: Error;
  timestamp: string;
  environment: string;
  userAgent?: string;
  url?: string;
}

interface LoggerConfig {
  enableConsole: boolean;
  enablePersistence: boolean;
  enableRemote: boolean;
  minLevel: LogLevel;
  maxEntries: number;
  sensitiveKeys: string[];
}

const getEnvironment = (): string => {
  return import.meta.env.MODE || 'development';
};

const getMinLogLevel = (): LogLevel => {
  const env = getEnvironment();
  
  // En desarrollo: solo errores críticos en consola
  if (env === 'development') return 'error';
  
  // En producción: solo errores críticos
  return 'error';
};

const defaultConfig: LoggerConfig = {
  enableConsole: getEnvironment() === 'development',
  enablePersistence: false, // Deshabilitado para mejor rendimiento
  enableRemote: false,
  minLevel: getMinLogLevel(),
  maxEntries: 50, // Reducido significativamente
  sensitiveKeys: ['password', 'token', 'apiKey', 'secret', 'authorization', 'key']
};

class Logger {
  private config: LoggerConfig;
  private entries: LogEntry[] = [];
  private sessionId: string;
  private originalConsole: typeof console;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
    this.sessionId = this.generateSessionId();
    this.originalConsole = { ...console };
    
    // Solo configurar error handler en desarrollo
    if (getEnvironment() === 'development') {
      this.setupGlobalErrorHandler();
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getLevelPriority(level: LogLevel): number {
    const priorities = { debug: 0, info: 1, warn: 2, error: 3 };
    return priorities[level];
  }

  private shouldLog(level: LogLevel): boolean {
    return this.getLevelPriority(level) >= this.getLevelPriority(this.config.minLevel);
  }

  private sanitizeData(data: unknown): any {
    if (!data || typeof data !== 'object') return data;

    try {
      const sanitized = JSON.parse(JSON.stringify(data)) as Record<string, any>;
      this.config.sensitiveKeys.forEach(key => {
        if (sanitized[key]) {
          sanitized[key] = '[REDACTED]';
        }
      });
      return sanitized;
    } catch {
      return null;
    }
  }

  private formatMessage(entry: LogEntry): string {
    const timestamp = new Date(entry.timestamp).toISOString();
    const context = entry.context ? `[${entry.context.toUpperCase()}]` : '';
    const component = entry.component ? `[${entry.component}]` : '';
    
    return `${timestamp} ${entry.level.toUpperCase()} ${context}${component} ${entry.message}`;
  }

  private setupGlobalErrorHandler(): void {
    window.addEventListener('error', (event) => {
      this.error('Uncaught error', event.error, { context: 'system' });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.error('Unhandled promise rejection', new Error(event.reason), { context: 'system' });
    });
  }

  private log(
    level: LogLevel,
    message: string,
    error?: Error,
    options: {
      context?: LogContext;
      component?: string;
      userId?: string;
      data?: unknown;
    } = {}
  ): void {
    // Retorno temprano si no debe loggear
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      level,
      message,
      context: options.context,
      component: options.component,
      userId: options.userId,
      sessionId: this.sessionId,
      data: this.sanitizeData(options.data),
      error,
      timestamp: new Date().toISOString(),
      environment: getEnvironment(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // Console logging solo en desarrollo y solo para errores críticos
    if (this.config.enableConsole && level === 'error') {
      this.originalConsole.error(this.formatMessage(entry), entry.data, error);
    }

    // Store in memory (limitado)
    this.entries.push(entry);
    if (this.entries.length > this.config.maxEntries) {
      this.entries.shift();
    }
  }

  // Métodos públicos - solo procesarán en desarrollo o para errores críticos
  debug(message: string, data?: unknown, options: { context?: LogContext; component?: string; userId?: string } = {}): void {
    // Debug completamente deshabilitado en producción
    if (getEnvironment() !== 'development') return;
    this.log('debug', message, undefined, { ...options, data });
  }

  info(message: string, data?: unknown, options: { context?: LogContext; component?: string; userId?: string } = {}): void {
    // Info completamente deshabilitado en producción
    if (getEnvironment() !== 'development') return;
    this.log('info', message, undefined, { ...options, data });
  }

  warn(message: string, data?: unknown, options: { context?: LogContext; component?: string; userId?: string } = {}): void {
    // Warn completamente deshabilitado en producción
    if (getEnvironment() !== 'development') return;
    this.log('warn', message, undefined, { ...options, data });
  }

  error(message: string, error?: Error, options: { context?: LogContext; component?: string; userId?: string; data?: unknown } = {}): void {
    // Error siempre habilitado pero solo para errores críticos
    this.log('error', message, error, options);
  }

  // Métodos de utilidad deshabilitados en producción
  time(label: string, context?: LogContext, component?: string): void {
    if (getEnvironment() !== 'development') return;
    this.originalConsole.time(label);
  }

  timeEnd(label: string, context?: LogContext, component?: string): void {
    if (getEnvironment() !== 'development') return;
    this.originalConsole.timeEnd(label);
  }

  // Métodos de gestión
  getLogs(filter?: { level?: LogLevel; context?: LogContext; component?: string }): LogEntry[] {
    if (getEnvironment() !== 'development') return [];
    
    if (!filter) return this.entries;

    return this.entries.filter(entry => {
      if (filter.level && entry.level !== filter.level) return false;
      if (filter.context && entry.context !== filter.context) return false;
      if (filter.component && entry.component !== filter.component) return false;
      return true;
    });
  }

  clear(): void {
    this.entries = [];
  }

  updateConfig(newConfig: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

// Create singleton instance con configuración optimizada
const loggerInstance = new Logger({
  enableConsole: false, // Deshabilitado completamente en producción
  enablePersistence: false,
  minLevel: 'error' // Solo errores críticos
});

export { Logger, loggerInstance as logger };
export default loggerInstance;
