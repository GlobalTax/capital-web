// ============= OPTIMIZED ERROR HANDLER =============
// Manejo de errores optimizado con filtrado inteligente

interface ErrorInfo {
  message: string;
  source?: string;
  line?: number;
  column?: number;
  error?: Error;
  timestamp: number;
  userAgent: string;
  url: string;
}

class OptimizedErrorHandler {
  private errorCount = 0;
  private readonly maxErrors = 25; // Límite reducido
  private errorHistory: ErrorInfo[] = [];
  private lastCleanup = Date.now();

  constructor() {
    this.setupErrorHandlers();
  }

  private setupErrorHandlers() {
    // Error handler para JavaScript errors
    window.addEventListener('error', (event) => {
      this.handleError({
        message: event.message,
        source: event.filename,
        line: event.lineno,
        column: event.colno,
        error: event.error,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        url: window.location.href
      });
    });

    // Error handler para Promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        error: event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        url: window.location.href
      });
    });
  }

  private handleError(errorInfo: ErrorInfo) {
    // Límite de errores
    if (this.errorCount >= this.maxErrors) {
      return;
    }

    // Filtrar errores conocidos de la plataforma
    if (this.isKnownPlatformError(errorInfo.message)) {
      return;
    }

    this.errorCount++;
    this.errorHistory.push(errorInfo);

    // Log solo errores críticos
    if (this.isCriticalError(errorInfo)) {
      console.error(`🚨 Critical error: ${errorInfo.message}`, errorInfo.error);
    }

    // Limpiar historial periódicamente
    this.cleanupIfNeeded();
  }

  private isKnownPlatformError(message: string): boolean {
    const knownErrors = [
      'Failed to load resource',
      'Access to fetch',
      'CORS policy',
      'WebSocket connection',
      'WebSocket handshake',
      'Unexpected response code: 404',
      'ERR_NETWORK',
      'ERR_CONNECTION',
      'ERR_HTTP2_PROTOCOL_ERROR',
      'GoTrueClient instances detected',
      'Tracking Prevention blocked access to storage',
      'Tracking Prevention blocked',
      'Unrecognized feature',
      'Unrecognized feature: \'vr\'',
      'Unrecognized feature: \'ambient-light-sensor\'',
      'Unrecognized feature: \'battery\'',
      'iframe which has both allow-scripts',
      'pushLogsToGrafana',
      'firestore.googleapis.com',
      'lovable-api.com',
      'lovableproject.com',
      'cloudfront.net',
      'googleapis.com',
      'Cookiebot',
      'domain is not authorized',
      'Cannot access',
      'before initialization',
      'Module script',
      'MIME type',
      'Failed to execute \'put\' on \'Cache\'',
      'Max reconnect attempts',
      'runtime.lastError',
      'message port closed',
      'message channel closed',
      'listener indicated an asynchronous response',
      'Extension context invalidated',
      'chrome-extension://',
      'moz-extension://',
      'safari-extension://',
      'edge-extension://'
    ];

    return knownErrors.some(pattern => message.includes(pattern));
  }

  private isCriticalError(errorInfo: ErrorInfo): boolean {
    const criticalPatterns = [
      'TypeError',
      'ReferenceError',
      'SyntaxError',
      'Cannot read properties',
      'is not a function',
      'is not defined'
    ];

    return criticalPatterns.some(pattern => 
      errorInfo.message.includes(pattern) && 
      !this.isKnownPlatformError(errorInfo.message)
    );
  }

  private cleanupIfNeeded() {
    const now = Date.now();
    if (now - this.lastCleanup > 300000) { // 5 minutos
      this.cleanup();
      this.lastCleanup = now;
    }
  }

  private cleanup() {
    const fiveMinutesAgo = Date.now() - 300000;
    this.errorHistory = this.errorHistory.filter(
      error => error.timestamp > fiveMinutesAgo
    );
    
    // Reset counter if no recent errors
    if (this.errorHistory.length === 0) {
      this.errorCount = 0;
    }
  }

  // Método público para obtener estadísticas
  getErrorStats() {
    return {
      totalErrors: this.errorCount,
      recentErrors: this.errorHistory.length,
      lastError: this.errorHistory[this.errorHistory.length - 1] || null
    };
  }

  // Método para resetear el contador
  reset() {
    this.errorCount = 0;
    this.errorHistory = [];
  }
}

// Crear instancia global
export const optimizedErrorHandler = new OptimizedErrorHandler();

// Auto-inicializar solo en el navegador
if (typeof window !== 'undefined') {
  console.log('Optimized error handler initialized');
}