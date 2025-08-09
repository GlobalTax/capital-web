
// Sistema de logging optimizado solo para desarrollo
interface DevLogEntry {
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  data?: any;
  context?: string;
  component?: string;
}

class DevLogger {
  private static instance: DevLogger;
  private enabled = process.env.NODE_ENV === 'development';
  private entries: DevLogEntry[] = [];
  private maxEntries = 100;

  private constructor() {}

  static getInstance(): DevLogger {
    if (!DevLogger.instance) {
      DevLogger.instance = new DevLogger();
    }
    return DevLogger.instance;
  }

  private log(level: DevLogEntry['level'], message: string, data?: any, context?: string, component?: string) {
    if (!this.enabled) return;

    const entry: DevLogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      context,
      component
    };

    this.entries.push(entry);
    if (this.entries.length > this.maxEntries) {
      this.entries.shift();
    }

    // Solo mostrar en consola en desarrollo
    const consoleMethod = level === 'debug' ? 'log' : level;
    console[consoleMethod](`[${level.toUpperCase()}] ${context ? `[${context}] ` : ''}${component ? `[${component}] ` : ''}${message}`, data);
  }

  debug(message: string, data?: any, context?: string, component?: string) {
    this.log('debug', message, data, context, component);
  }

  info(message: string, data?: any, context?: string, component?: string) {
    this.log('info', message, data, context, component);
  }

  warn(message: string, data?: any, context?: string, component?: string) {
    this.log('warn', message, data, context, component);
  }

  error(message: string, data?: any, context?: string, component?: string) {
    this.log('error', message, data, context, component);
  }

  getEntries(): DevLogEntry[] {
    return this.enabled ? [...this.entries] : [];
  }

  clear() {
    this.entries = [];
  }
}

export const devLogger = DevLogger.getInstance();
