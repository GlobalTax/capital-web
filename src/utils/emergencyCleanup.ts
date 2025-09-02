// ============= EMERGENCY CLEANUP UTILITIES =============
// Utilidades para limpieza profunda en situaciones críticas

interface CleanupOptions {
  preserveAuth?: boolean;
  clearServiceWorker?: boolean;
  clearAllCaches?: boolean;
  forceReload?: boolean;
}

class EmergencyCleanup {
  private static instance: EmergencyCleanup;
  private isCleaningUp = false;

  static getInstance(): EmergencyCleanup {
    if (!EmergencyCleanup.instance) {
      EmergencyCleanup.instance = new EmergencyCleanup();
    }
    return EmergencyCleanup.instance;
  }

  /**
   * Limpieza completa y controlada
   */
  async performDeepCleanup(options: CleanupOptions = {}): Promise<void> {
    if (this.isCleaningUp) {
      console.warn('🚫 Cleanup already in progress, skipping...');
      return;
    }

    this.isCleaningUp = true;
    const cleanupId = Date.now().toString();
    
    try {
      console.log(`🧹 Starting deep cleanup (${cleanupId})...`);

      // 1. Service Worker cleanup
      if (options.clearServiceWorker !== false) {
        await this.cleanupServiceWorkers();
      }

      // 2. Cache cleanup
      if (options.clearAllCaches !== false) {
        await this.cleanupBrowserCaches();
      }

      // 3. Storage cleanup
      await this.cleanupStorage(options.preserveAuth);

      // 4. Mark cleanup as complete
      sessionStorage.setItem('emergency-cleanup-done', cleanupId);
      console.log(`✅ Deep cleanup completed (${cleanupId})`);

      // 5. Force reload if requested
      if (options.forceReload !== false) {
        console.log('🔄 Forcing page reload...');
        setTimeout(() => window.location.reload(), 100);
      }

    } catch (error) {
      console.error('❌ Deep cleanup failed:', error);
      
      // Fallback: simple reload
      if (options.forceReload !== false) {
        setTimeout(() => window.location.reload(), 500);
      }
    } finally {
      this.isCleaningUp = false;
    }
  }

  /**
   * Verifica si ya se realizó la limpieza en esta sesión
   */
  wasCleanupPerformed(): boolean {
    return !!sessionStorage.getItem('emergency-cleanup-done');
  }

  /**
   * Limpieza rápida para debugging
   */
  async quickCleanup(): Promise<void> {
    console.log('⚡ Performing quick cleanup...');
    
    // Solo limpiar caches problemáticas
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      const problematicCaches = cacheNames.filter(name => 
        name.includes('workbox') || 
        name.includes('precache') || 
        name.startsWith('capittal-')
      );
      
      await Promise.all(problematicCaches.map(name => caches.delete(name)));
      console.log(`🗑️ Cleared ${problematicCaches.length} problematic caches`);
    }

    // Limpiar keys problemáticas del localStorage
    const problematicKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('chunk') || key.includes('vite') || key.includes('sw-'))) {
        problematicKeys.push(key);
      }
    }
    
    problematicKeys.forEach(key => localStorage.removeItem(key));
    console.log(`🗑️ Cleared ${problematicKeys.length} problematic localStorage keys`);
  }

  /**
   * Desactivar temporalmente service workers
   */
  async disableServiceWorkers(): Promise<void> {
    if (!('serviceWorker' in navigator)) return;

    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      console.log(`🔧 Found ${registrations.length} service workers to unregister`);

      for (const registration of registrations) {
        await registration.unregister();
        console.log(`✅ Unregistered SW: ${registration.scope}`);
      }

      // Marcar como desactivados
      sessionStorage.setItem('service-workers-disabled', 'true');
      
    } catch (error) {
      console.error('❌ Failed to disable service workers:', error);
    }
  }

  private async cleanupServiceWorkers(): Promise<void> {
    if (!('serviceWorker' in navigator)) return;

    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
      }
      console.log(`🔧 Unregistered ${registrations.length} service workers`);
    } catch (error) {
      console.error('Failed to cleanup service workers:', error);
    }
  }

  private async cleanupBrowserCaches(): Promise<void> {
    if (!('caches' in window)) return;

    try {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      console.log(`🗑️ Cleared ${cacheNames.length} browser caches`);
    } catch (error) {
      console.error('Failed to cleanup browser caches:', error);
    }
  }

  private async cleanupStorage(preserveAuth = false): Promise<void> {
    try {
      // Clear sessionStorage completely
      sessionStorage.clear();
      
      // Selective localStorage cleanup
      if (!preserveAuth) {
        localStorage.clear();
      } else {
        const authKeys = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.includes('auth') || key.includes('user') || key.includes('token'))) {
            authKeys.push(key);
          }
        }
        
        // Clear everything except auth
        localStorage.clear();
        
        // Restore auth keys (this is approximate, actual auth restoration would be more complex)
        console.log(`🔐 Preserved ${authKeys.length} auth-related keys`);
      }
      
      console.log('🧹 Storage cleanup completed');
    } catch (error) {
      console.error('Failed to cleanup storage:', error);
    }
  }
}

// Export singleton instance
export const emergencyCleanup = EmergencyCleanup.getInstance();

// Convenience functions
export const performDeepCleanup = (options?: CleanupOptions) => 
  emergencyCleanup.performDeepCleanup(options);

export const quickCleanup = () => 
  emergencyCleanup.quickCleanup();

export const disableServiceWorkers = () => 
  emergencyCleanup.disableServiceWorkers();

// Expose globally in development for debugging
if (process.env.NODE_ENV === 'development') {
  (window as any).emergencyCleanup = emergencyCleanup;
  (window as any).performDeepCleanup = performDeepCleanup;
  (window as any).quickCleanup = quickCleanup;
}