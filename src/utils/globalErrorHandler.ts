// ============= GLOBAL ERROR HANDLER =============
// Manejo centralizado de errores no capturados

import { devLogger } from './devLogger';

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

class GlobalErrorHandler {
  private errorCount = 0;
  private readonly maxErrors = 50; // Límite para evitar spam
  private errorHistory: ErrorInfo[] = [];

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

    // Error handler para Resource loading errors
    window.addEventListener('error', (event) => {
      if (event.target !== window) {
        const target = event.target as HTMLElement;
        this.handleResourceError(target);
      }
    }, true);
  }

  private handleError(errorInfo: ErrorInfo) {
    if (this.errorCount >= this.maxErrors) {
      return; // Evitar spam de errores
    }

    this.errorCount++;
    this.errorHistory.push(errorInfo);

    // Filtrar errores conocidos de la plataforma que no son críticos
    if (this.isKnownPlatformError(errorInfo.message)) {
      return;
    }

    // Log solo errores importantes
    devLogger.error(
      `Global error: ${errorInfo.message}`,
      errorInfo.error,
      'global',
      'ErrorHandler'
    );

    // Limpiar historial cada 10 minutos
    this.cleanupHistory();
  }

  private handleResourceError(element: HTMLElement) {
    const tagName = element.tagName.toLowerCase();
    const src = (element as any).src || (element as any).href;
    
    if (src && !this.isKnownResourceError(src)) {
      devLogger.warn(
        `Resource loading failed: ${tagName}`,
        { src, tagName },
        'resource',
        'ErrorHandler'
      );
    }
  }

  private isKnownPlatformError(message: string): boolean {
    // ✅ Errores categorizados por severidad
    const ignorableErrors = [
      // Tracking & Privacy
      'Tracking Prevention blocked access to storage',
      'Tracking Prevention blocked',
      
      // WebSocket (ya deshabilitado en optimizedClient)
      'WebSocket connection',
      'WebSocket handshake',
      'Unexpected response code: 404',
      'Unexpected response code: 412',
      'Unexpected response code: 502',
      
      // CORS & Network (externos a la app)
      'Failed to load resource',
      'Access to fetch',
      'CORS policy',
      'ERR_NETWORK',
      'ERR_CONNECTION',
      'ERR_HTTP2_PROTOCOL_ERROR',
      'net::ERR_FAILED',
      
      // Lovable Platform (externos)
      'lovable-api.com',
      'lovableproject.com',
      '/_sandbox/dev-server',
      
      // Browser Features
      'Unrecognized feature',
      'Unrecognized feature: \'vr\'',
      'Unrecognized feature: \'ambient-light-sensor\'',
      'Unrecognized feature: \'battery\'',
      'iframe which has both allow-scripts',
      
      // External Services
      'GoTrueClient instances detected',
      'pushLogsToGrafana',
      'firestore.googleapis.com',
      'Cookiebot',
      'domain is not authorized',
      
      // Browser Extensions
      'runtime.lastError',
      'message port closed',
      'message channel closed',
      'listener indicated an asynchronous response',
      'Extension context invalidated',
      'chrome-extension://',
      'moz-extension://',
      'safari-extension://',
      'edge-extension://',
      
      // Content Security Policy (reportados, no críticos)
      'Refused to compile or instantiate WebAssembly',
      'unsafe-eval',
      
      // Intervention (optimizaciones del navegador)
      'Images loaded lazily',
      'Load events are deferred'
    ];

    return ignorableErrors.some(pattern => message.includes(pattern));
  }

  private isKnownResourceError(src: string): boolean {
    const knownResourceErrors = [
      'cloudfront.net',
      'supabase.co',
      'googleapis.com',
      'firebaseio.com',
      'lovable-api.com',
      'lovableproject.com'
    ];

    return knownResourceErrors.some(pattern => src.includes(pattern));
  }

  private cleanupHistory() {
    const tenMinutesAgo = Date.now() - 600000;
    this.errorHistory = this.errorHistory.filter(
      error => error.timestamp > tenMinutesAgo
    );
  }

  // Método público para obtener estadísticas de errores
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
export const globalErrorHandler = new GlobalErrorHandler();

// Auto-inicializar solo en el navegador
if (typeof window !== 'undefined') {
  // Ya se inicializa en el constructor
}