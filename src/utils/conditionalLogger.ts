// ============= CONDITIONAL LOGGER =============
// Sistema de logging condicional para producción

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class ConditionalLogger {
  private isDevelopment = import.meta.env.DEV;
  private enabledLevels: Set<LogLevel> = new Set(['error', 'warn']);

  constructor() {
    // En desarrollo habilitar todos los niveles
    if (this.isDevelopment) {
      this.enabledLevels.add('info');
      this.enabledLevels.add('debug');
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return this.enabledLevels.has(level);
  }

  debug(message: string, data?: any, category?: string): void {
    if (!this.shouldLog('debug')) return;
    console.debug(`🔍 ${category ? `[${category}] ` : ''}${message}`, data || '');
  }

  info(message: string, data?: any, category?: string): void {
    if (!this.shouldLog('info')) return;
    console.info(`ℹ️ ${category ? `[${category}] ` : ''}${message}`, data || '');
  }

  warn(message: string, data?: any, category?: string): void {
    if (!this.shouldLog('warn')) return;
    console.warn(`⚠️ ${category ? `[${category}] ` : ''}${message}`, data || '');
  }

  error(message: string, error?: any, category?: string): void {
    if (!this.shouldLog('error')) return;
    console.error(`❌ ${category ? `[${category}] ` : ''}${message}`, error || '');
  }

  // Método especial para performance crítica (solo errores en producción)
  performance(message: string, data?: any): void {
    if (this.isDevelopment) {
      console.log(`📊 [Performance] ${message}`, data || '');
    }
  }
}

export const logger = new ConditionalLogger();