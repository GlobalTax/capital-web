// ============= SERVICE WORKER UTILITIES =============
// Gestión de service worker para cache avanzado

interface CacheConfig {
  name: string;
  version: string;
  strategies: {
    static: string[];
    api: string[];
    images: string[];
  };
}

class ServiceWorkerManager {
  private config: CacheConfig = {
    name: 'capittal-cache',
    version: 'v1.0.0',
    strategies: {
      static: ['/static/', '/assets/', '/_app/'],
      api: ['/api/', '/supabase/'],
      images: ['.jpg', '.jpeg', '.png', '.webp', '.svg']
    }
  };

  async register(): Promise<ServiceWorkerRegistration | null> {
    // Registrar SW solo en producción
    if (!import.meta.env.PROD) {
      console.info('SW: registro omitido en no-producción');
      return null;
    }
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Worker not supported');
      return null;
    }
 
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // Nueva versión disponible
              this.notifyUpdate();
            }
          });
        }
      });

      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  }

  async unregister(): Promise<boolean> {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        return registration.unregister();
      }
    }
    return false;
  }

  async clearCache(): Promise<void> {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter(name => name.startsWith(this.config.name))
          .map(name => caches.delete(name))
      );
    }
  }

  async getCacheSize(): Promise<{ total: number; breakdown: Record<string, number> }> {
    if (!('caches' in window)) return { total: 0, breakdown: {} };

    const cacheNames = await caches.keys();
    const breakdown: Record<string, number> = {};
    let total = 0;

    for (const name of cacheNames) {
      if (name.startsWith(this.config.name)) {
        const cache = await caches.open(name);
        const keys = await cache.keys();
        
        let cacheSize = 0;
        for (const key of keys) {
          const response = await cache.match(key);
          if (response) {
            const blob = await response.blob();
            cacheSize += blob.size;
          }
        }
        
        breakdown[name] = cacheSize;
        total += cacheSize;
      }
    }

    return { total, breakdown };
  }

  private notifyUpdate(): void {
    // Enviar evento personalizado para que la app maneje la actualización
    window.dispatchEvent(new CustomEvent('sw-update-available'));
  }

  async prefetchCriticalResources(urls: string[]): Promise<void> {
    if (!('caches' in window)) return;

    const cache = await caches.open(`${this.config.name}-critical`);
    
    await Promise.all(
      urls.map(async (url) => {
        try {
          const response = await fetch(url);
          if (response.ok) {
            await cache.put(url, response);
          }
        } catch (error) {
          console.warn(`Failed to prefetch ${url}:`, error);
        }
      })
    );
  }
}

export const serviceWorkerManager = new ServiceWorkerManager();