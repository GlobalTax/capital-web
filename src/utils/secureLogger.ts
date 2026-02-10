/**
 * Sistema de Logging Condicional de Seguridad
 * Solo muestra logs críticos en producción
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical';
export type LogContext = 'system' | 'security' | 'performance' | 'user_action' | 'api';

interface LogEntry {
  level: LogLevel;
  message: string;
  context: LogContext;
  component?: string;
  data?: any;
  timestamp: string;
  userId?: string;
  sessionId?: string;
}

class SecureLogger {
  private isDevelopment = window.location.hostname === 'localhost';
  private isProduction = !this.isDevelopment;
  private sessionId = this.generateSessionId();
  
  // Configuración por entorno
  private config = {
    development: {
      minLevel: 'debug' as LogLevel,
      enableConsole: true,
      enableRemote: false,
      maxLocalStorage: 1000
    },
    production: {
      minLevel: 'error' as LogLevel, // Solo errores y críticos en producción
      enableConsole: false,
      enableRemote: true,
      maxLocalStorage: 100
    }
  };

  private levelPriority: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
    critical: 4
  };

  private shouldLog(level: LogLevel): boolean {
    const currentConfig = this.isProduction ? this.config.production : this.config.development;
    return this.levelPriority[level] >= this.levelPriority[currentConfig.minLevel];
  }

  private generateSessionId(): string {
    const bytes = new Uint8Array(6);
    crypto.getRandomValues(bytes);
    return `session_${Date.now()}_${Array.from(bytes).map(b => b.toString(36)).join('').substring(0, 9)}`;
  }

  private getCurrentUserId(): string | undefined {
    try {
      // Intentar obtener el user ID de diferentes fuentes
      const authStore = localStorage.getItem('supabase.auth.token');
      if (authStore) {
        const parsed = JSON.parse(authStore);
        return parsed?.user?.id;
      }
    } catch {
      // Ignorar errores de parsing
    }
    return undefined;
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    context: LogContext,
    component?: string,
    data?: any
  ): LogEntry {
    return {
      level,
      message,
      context,
      component,
      data,
      timestamp: new Date().toISOString(),
      userId: this.getCurrentUserId(),
      sessionId: this.sessionId
    };
  }

  private logToConsole(entry: LogEntry): void {
    const currentConfig = this.isProduction ? this.config.production : this.config.development;
    
    if (!currentConfig.enableConsole) return;

    const prefix = `[${entry.level.toUpperCase()}] ${entry.context}${entry.component ? `/${entry.component}` : ''}`;
    const timestamp = new Date(entry.timestamp).toLocaleTimeString();
    
    switch (entry.level) {
      case 'debug':
        console.debug(`${prefix} ${timestamp}:`, entry.message, entry.data);
        break;
      case 'info':
        console.info(`${prefix} ${timestamp}:`, entry.message, entry.data);
        break;
      case 'warn':
        console.warn(`${prefix} ${timestamp}:`, entry.message, entry.data);
        break;
      case 'error':
        console.error(`${prefix} ${timestamp}:`, entry.message, entry.data);
        break;
      case 'critical':
        console.error(`🚨 CRITICAL ${prefix} ${timestamp}:`, entry.message, entry.data);
        break;
    }
  }

  private saveToLocalStorage(entry: LogEntry): void {
    try {
      const key = `secure_logs_${this.sessionId}`;
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      const currentConfig = this.isProduction ? this.config.production : this.config.development;
      
      existing.push(entry);
      
      // Limitar número de logs almacenados
      if (existing.length > currentConfig.maxLocalStorage) {
        existing.splice(0, existing.length - currentConfig.maxLocalStorage);
      }
      
      localStorage.setItem(key, JSON.stringify(existing));
    } catch (error) {
      // Si no se puede guardar en localStorage, enviar a consola como fallback
      console.warn('Failed to save log to localStorage:', error);
    }
  }

  private async sendToRemote(entry: LogEntry): Promise<void> {
    const currentConfig = this.isProduction ? this.config.production : this.config.development;
    
    if (!currentConfig.enableRemote) return;

    try {
      // Solo enviar logs críticos y errores a Supabase
      if (entry.level === 'critical' || entry.level === 'error') {
        const { supabase } = await import('@/integrations/supabase/client');
        
        await supabase.from('security_events').insert({
          event_type: `CLIENT_${entry.level.toUpperCase()}`,
          severity: entry.level === 'critical' ? 'critical' : 'high',
          table_name: entry.component || 'client_app',
          action_attempted: entry.context,
          details: {
            message: entry.message,
            data: entry.data,
            component: entry.component,
            session_id: entry.sessionId,
            timestamp: entry.timestamp,
            user_agent: navigator.userAgent
          }
        });
      }
    } catch (error) {
      // No logear errores de logging remoto para evitar loops
      console.warn('Failed to send log to remote:', error);
    }
  }

  // Métodos públicos de logging
  debug(message: string, data?: any, options: { context?: LogContext; component?: string } = {}): void {
    if (!this.shouldLog('debug')) return;
    
    const entry = this.createLogEntry('debug', message, options.context || 'system', options.component, data);
    this.logToConsole(entry);
    this.saveToLocalStorage(entry);
  }

  info(message: string, data?: any, options: { context?: LogContext; component?: string } = {}): void {
    if (!this.shouldLog('info')) return;
    
    const entry = this.createLogEntry('info', message, options.context || 'system', options.component, data);
    this.logToConsole(entry);
    this.saveToLocalStorage(entry);
  }

  warn(message: string, data?: any, options: { context?: LogContext; component?: string } = {}): void {
    if (!this.shouldLog('warn')) return;
    
    const entry = this.createLogEntry('warn', message, options.context || 'system', options.component, data);
    this.logToConsole(entry);
    this.saveToLocalStorage(entry);
  }

  error(message: string, data?: any, options: { context?: LogContext; component?: string } = {}): void {
    if (!this.shouldLog('error')) return;
    
    const entry = this.createLogEntry('error', message, options.context || 'system', options.component, data);
    this.logToConsole(entry);
    this.saveToLocalStorage(entry);
    this.sendToRemote(entry);
  }

  critical(message: string, data?: any, options: { context?: LogContext; component?: string } = {}): void {
    // Los logs críticos SIEMPRE se procesan, independientemente del entorno
    const entry = this.createLogEntry('critical', message, options.context || 'security', options.component, data);
    
    // En producción, forzar el log en consola para eventos críticos
    if (this.isProduction) {
      console.error(`🚨 CRITICAL SECURITY EVENT:`, entry.message, entry.data);
    }
    
    this.logToConsole(entry);
    this.saveToLocalStorage(entry);
    this.sendToRemote(entry);
  }

  // Método para obtener logs del almacenamiento local
  getStoredLogs(): LogEntry[] {
    try {
      const key = `secure_logs_${this.sessionId}`;
      return JSON.parse(localStorage.getItem(key) || '[]');
    } catch {
      return [];
    }
  }

  // Método para limpiar logs locales
  clearStoredLogs(): void {
    try {
      const key = `secure_logs_${this.sessionId}`;
      localStorage.removeItem(key);
    } catch (error) {
      this.warn('Failed to clear stored logs', error);
    }
  }

  // Método para reportar errores de JavaScript no capturados
  captureUnhandledError(error: Error, source?: string): void {
    this.critical('Unhandled JavaScript error', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      source: source || 'unknown'
    }, { context: 'system', component: 'error_boundary' });
  }

  // Método para reportar rechazos de promesas no capturados
  captureUnhandledRejection(reason: any, promise: Promise<any>): void {
    this.critical('Unhandled promise rejection', {
      reason: reason?.toString() || 'Unknown reason',
      promise: promise?.toString() || 'Unknown promise'
    }, { context: 'system', component: 'promise_handler' });
  }
}

// Instancia singleton
export const secureLogger = new SecureLogger();

// Función para detectar errores de extensiones de Chrome
const isChromeExtensionError = (message: string, source?: string): boolean => {
  const chromeExtensionPatterns = [
    'chrome-extension',
    'chrome://extensions',
    'Extension context invalidated',
    'message port closed',
    'message channel closed',
    'listener indicated an asynchronous response',
    'Cannot access contents of',
    'Script error.',
    'Non-Error promise rejection captured'
  ];
  
  return chromeExtensionPatterns.some(pattern => 
    message?.toLowerCase().includes(pattern.toLowerCase()) ||
    source?.toLowerCase().includes(pattern.toLowerCase())
  );
};

// Configurar captura automática de errores no manejados
window.addEventListener('error', (event) => {
  // Filtrar errores de extensiones de Chrome
  if (isChromeExtensionError(event.message, event.filename)) {
    return; // Ignorar silenciosamente
  }
  
  secureLogger.captureUnhandledError(event.error, event.filename);
});

window.addEventListener('unhandledrejection', (event) => {
  // Filtrar rechazos de promesas relacionados con extensiones
  const reason = event.reason?.toString() || '';
  if (isChromeExtensionError(reason)) {
    return; // Ignorar silenciosamente
  }
  
  secureLogger.captureUnhandledRejection(event.reason, event.promise);
});

export default secureLogger;