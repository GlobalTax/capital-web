import React from 'react';

/**
 * Utilidades de debugging específicas para el admin
 */
export const adminDebug = {
  /**
   * Verifica el estado de los contextos críticos
   */
  checkContexts: () => {
    const status = {
      timestamp: new Date().toISOString(),
      auth: {
        available: false,
        hasUser: false,
        isAdmin: false,
      },
      supabase: {
        available: false,
        authenticated: false,
      },
      router: {
        available: !!window.location,
        currentPath: window.location.pathname,
      },
      localStorage: {
        available: typeof Storage !== 'undefined',
        authToken: !!localStorage.getItem('capittal-auth-token'),
      }
    };

    try {
      // Check if React context is available
      status.auth.available = typeof React !== 'undefined';
      
      // Check Supabase availability
      status.supabase.available = typeof window !== 'undefined' && 
        (window as any).supabase !== undefined;
      
      console.table(status);
      return status;
    } catch (error) {
      console.error('Error checking contexts:', error);
      return status;
    }
  },

  /**
   * Log de errores específicos del admin
   */
  logAdminError: (error: Error, context: string) => {
    console.group(`🚨 Admin Error - ${context}`);
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    console.error('Timestamp:', new Date().toISOString());
    console.error('URL:', window.location.href);
    console.groupEnd();
  },

  /**
   * Monitor de performance del admin
   */
  startPerformanceMonitor: () => {
    if (typeof performance === 'undefined') return;

    const startTime = performance.now();
    
    return {
      stop: () => {
        const endTime = performance.now();
        const duration = endTime - startTime;
        console.log(`⏱️ Admin load time: ${duration.toFixed(2)}ms`);
        return duration;
      }
    };
  }
};

// Exponer globalmente en desarrollo
if (process.env.NODE_ENV === 'development') {
  (window as any).adminDebug = adminDebug;
}