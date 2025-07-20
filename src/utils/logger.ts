import { supabase } from '@/integrations/supabase/client';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export type LogContext = 'auth' | 'marketing' | 'api' | 'ui' | 'system' | 'performance' | 'ai' | 'admin' | 'form' | 'valuation' | 'security' | 'database';

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
  // Usar NODE_ENV como fuente principal
  return process.env.NODE_ENV || 'development';
};

const getMinLogLevel = (): LogLevel => {
  const env = getEnvironment();
  
  // En desarrollo: mostrar todos los logs
  if (env === 'development') return 'debug';
  
  // En test: solo warnings y errores
  if (env === 'test') return 'warn';
  
  // En producción: solo errores
  return 'error';
};

const defaultConfig: LoggerConfig = {
  enableConsole: true,
  enablePersistence: false,
  enableRemote: false,
  minLevel: getMinLogLevel(),
  maxEntries: 1000,
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
    this.setupGlobalErrorHandler();
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

  private async persistLog(entry: LogEntry): Promise<void> {
    // Solo persistir errores en producción
    if (!this.config.enablePersistence || entry.level !== 'error') return;
    
    // Deshabilitado después de limpieza
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

    // Console logging solo si está habilitado
    if (this.config.enableConsole) {
      const consoleMethod = level === 'debug' ? 'log' : level;
      this.originalConsole[consoleMethod](this.formatMessage(entry), entry.data, error);
    }

    // Store in memory
    this.entries.push(entry);
    if (this.entries.length > this.config.maxEntries) {
      this.entries.shift();
    }

    // Persist to database
    this.persistLog(entry);
  }

  debug(message: string, data?: unknown, options: { context?: LogContext; component?: string; userId?: string } = {}): void {
    this.log('debug', message, undefined, { ...options, data });
  }

  info(message: string, data?: unknown, options: { context?: LogContext; component?: string; userId?: string } = {}): void {
    this.log('info', message, undefined, { ...options, data });
  }

  warn(message: string, data?: unknown, options: { context?: LogContext; component?: string; userId?: string } = {}): void {
    this.log('warn', message, undefined, { ...options, data });
  }

  error(message: string, error?: Error, options: { context?: LogContext; component?: string; userId?: string; data?: unknown } = {}): void {
    this.log('error', message, error, options);
  }

  // Performance logging
  time(label: string, context?: LogContext, component?: string): void {
    if (getEnvironment() === 'development') {
      this.originalConsole.time(label);
    }
    this.debug(`Timer started: ${label}`, { label }, { context, component });
  }

  timeEnd(label: string, context?: LogContext, component?: string): void {
    if (getEnvironment() === 'development') {
      this.originalConsole.timeEnd(label);
    }
    this.debug(`Timer ended: ${label}`, { label }, { context, component });
  }

  // Modo desarrollo - logging temporal
  devMode(enabled: boolean = true): void {
    if (enabled && getEnvironment() === 'development') {
      this.config.minLevel = 'debug';
      this.config.enableConsole = true;
    } else {
      this.config.minLevel = getMinLogLevel();
    }
  }

  // Reemplazar console nativo (solo en desarrollo)
  replaceConsole(): void {
    if (getEnvironment() !== 'development') return;
    
    console.log = (...args) => this.debug(args.join(' '), undefined, { context: 'system' });
    console.info = (...args) => this.info(args.join(' '), undefined, { context: 'system' });
    console.warn = (...args) => this.warn(args.join(' '), undefined, { context: 'system' });
    // Mantener console.error nativo para errores críticos
  }

  // Restaurar console nativo
  restoreConsole(): void {
    Object.assign(console, this.originalConsole);
  }

  // Get stored logs
  getLogs(filter?: { level?: LogLevel; context?: LogContext; component?: string }): LogEntry[] {
    if (!filter) return this.entries;

    return this.entries.filter(entry => {
      if (filter.level && entry.level !== filter.level) return false;
      if (filter.context && entry.context !== filter.context) return false;
      if (filter.component && entry.component !== filter.component) return false;
      return true;
    });
  }

  // Clear logs
  clear(): void {
    this.entries = [];
    this.debug('Logs cleared', undefined, { context: 'system' });
  }

  // Update configuration
  updateConfig(newConfig: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.debug('Logger configuration updated', newConfig, { context: 'system' });
  }
}

// Create singleton instance
const loggerInstance = new Logger({
  enableConsole: true,
  enablePersistence: getEnvironment() === 'production',
  minLevel: getMinLogLevel()
});

export { Logger, loggerInstance as logger };
export default loggerInstance;
