import { supabase } from '@/integrations/supabase/client';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export type LogContext = 'auth' | 'marketing' | 'api' | 'ui' | 'system' | 'performance';

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

const defaultConfig: LoggerConfig = {
  enableConsole: true,
  enablePersistence: false,
  enableRemote: false,
  minLevel: 'debug',
  maxEntries: 1000,
  sensitiveKeys: ['password', 'token', 'apiKey', 'secret', 'authorization']
};

class Logger {
  private config: LoggerConfig;
  private entries: LogEntry[] = [];
  private sessionId: string;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
    this.sessionId = this.generateSessionId();
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

  private sanitizeData(data: unknown): unknown {
    if (!data || typeof data !== 'object') return data;

    const sanitized = JSON.parse(JSON.stringify(data));
    this.config.sensitiveKeys.forEach(key => {
      if (sanitized[key]) {
        sanitized[key] = '[REDACTED]';
      }
    });

    return sanitized;
  }

  private formatMessage(entry: LogEntry): string {
    const timestamp = new Date(entry.timestamp).toISOString();
    const context = entry.context ? `[${entry.context.toUpperCase()}]` : '';
    const component = entry.component ? `[${entry.component}]` : '';
    
    return `${timestamp} ${entry.level.toUpperCase()} ${context}${component} ${entry.message}`;
  }

  private async persistLog(entry: LogEntry): Promise<void> {
    if (!this.config.enablePersistence) return;

    try {
      await supabase.from('system_logs').insert({
        level: entry.level,
        message: entry.message,
        context: entry.context,
        component: entry.component,
        user_id: entry.userId,
        session_id: entry.sessionId,
        log_data: entry.data,
        error_stack: entry.error?.stack,
        environment: entry.environment,
        user_agent: entry.userAgent,
        url: entry.url,
        created_at: entry.timestamp
      });
    } catch (error) {
      console.error('Failed to persist log:', error);
    }
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
      environment: import.meta.env.MODE || 'development',
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // Console logging
    if (this.config.enableConsole) {
      const consoleMethod = level === 'debug' ? 'log' : level;
      console[consoleMethod](this.formatMessage(entry), entry.data, error);
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
    console.time(label);
    this.debug(`Timer started: ${label}`, { label }, { context, component });
  }

  timeEnd(label: string, context?: LogContext, component?: string): void {
    console.timeEnd(label);
    this.debug(`Timer ended: ${label}`, { label }, { context, component });
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
  enablePersistence: import.meta.env.MODE === 'production',
  minLevel: import.meta.env.MODE === 'development' ? 'debug' : 'info'
});

export { Logger, loggerInstance as logger };
export default loggerInstance;