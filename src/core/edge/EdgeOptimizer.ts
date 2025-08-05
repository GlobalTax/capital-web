// ============= EDGE OPTIMIZER =============
// Optimización para CDN y Edge Computing

import { logger } from '@/utils/logger';

interface CacheConfig {
  ttl: number;
  maxSize: number;
  strategy: 'lru' | 'fifo' | 'lfu';
}

interface CDNResource {
  url: string;
  type: 'image' | 'video' | 'document' | 'script' | 'style';
  priority: 'high' | 'medium' | 'low';
  cacheable: boolean;
}

export class EdgeOptimizer {
  private cache = new Map<string, { data: any; timestamp: number; accessCount: number }>();
  private preloadQueue = new Set<string>();
  private cdnEndpoints = [
    'https://cdn.jsdelivr.net',
    'https://unpkg.com',
    'https://cdnjs.cloudflare.com'
  ];

  private readonly DEFAULT_CONFIG: CacheConfig = {
    ttl: 5 * 60 * 1000, // 5 minutos
    maxSize: 100,
    strategy: 'lru'
  };

  // ============= EDGE CACHING =============
  set(key: string, data: any, config: Partial<CacheConfig> = {}): void {
    const finalConfig = { ...this.DEFAULT_CONFIG, ...config };
    
    // Limpiar cache si está lleno
    if (this.cache.size >= finalConfig.maxSize) {
      this.evictCache(finalConfig.strategy);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      accessCount: 0
    });

    logger.debug('Edge cache set', { key, size: this.cache.size }, { 
      context: 'performance', 
      component: 'EdgeOptimizer' 
    });
  }

  get(key: string, config: Partial<CacheConfig> = {}): any | null {
    const finalConfig = { ...this.DEFAULT_CONFIG, ...config };
    const item = this.cache.get(key);

    if (!item) return null;

    // Verificar TTL
    if (Date.now() - item.timestamp > finalConfig.ttl) {
      this.cache.delete(key);
      return null;
    }

    // Incrementar contador de acceso
    item.accessCount++;

    logger.debug('Edge cache hit', { key, accessCount: item.accessCount }, { 
      context: 'performance', 
      component: 'EdgeOptimizer' 
    });

    return item.data;
  }

  private evictCache(strategy: CacheConfig['strategy']): void {
    const entries = Array.from(this.cache.entries());
    
    let keyToEvict: string;

    switch (strategy) {
      case 'lru':
        // Least Recently Used
        keyToEvict = entries.reduce((oldest, [key, item]) => {
          const [oldestKey, oldestItem] = oldest;
          return item.timestamp < oldestItem.timestamp ? [key, item] : oldest;
        })[0];
        break;

      case 'lfu':
        // Least Frequently Used
        keyToEvict = entries.reduce((least, [key, item]) => {
          const [leastKey, leastItem] = least;
          return item.accessCount < leastItem.accessCount ? [key, item] : least;
        })[0];
        break;

      case 'fifo':
      default:
        // First In, First Out
        keyToEvict = entries[0][0];
        break;
    }

    this.cache.delete(keyToEvict);
    
    logger.debug('Cache evicted', { key: keyToEvict, strategy }, { 
      context: 'edge', 
      component: 'EdgeOptimizer' 
    });
  }

  // ============= RESOURCE PRELOADING =============
  preloadResource(url: string, type: CDNResource['type'] = 'script'): Promise<void> {
    if (this.preloadQueue.has(url)) {
      return Promise.resolve();
    }

    this.preloadQueue.add(url);

    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = url;
      
      switch (type) {
        case 'script':
          link.as = 'script';
          break;
        case 'style':
          link.as = 'style';
          break;
        case 'image':
          link.as = 'image';
          break;
        case 'video':
          link.as = 'video';
          break;
        case 'document':
          link.as = 'document';
          break;
      }

      link.onload = () => {
        logger.debug('Resource preloaded', { url, type }, { 
          context: 'edge', 
          component: 'EdgeOptimizer' 
        });
        resolve();
      };

      link.onerror = () => {
        logger.error('Failed to preload resource', new Error(`Failed to preload: ${url}`), { 
          context: 'edge', 
          component: 'EdgeOptimizer' 
        });
        reject(new Error(`Failed to preload: ${url}`));
      };

      document.head.appendChild(link);
    });
  }

  // ============= CDN OPTIMIZATION =============
  optimizeImageURL(url: string, options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'avif' | 'jpeg' | 'png';
    lazy?: boolean;
  } = {}): string {
    // Si ya es una URL optimizada, devolverla tal como está
    if (url.includes('?') && (url.includes('w=') || url.includes('h='))) {
      return url;
    }

    const params = new URLSearchParams();
    
    if (options.width) params.set('w', options.width.toString());
    if (options.height) params.set('h', options.height.toString());
    if (options.quality) params.set('q', options.quality.toString());
    if (options.format) params.set('f', options.format);

    const optimizedURL = `${url}${url.includes('?') ? '&' : '?'}${params.toString()}`;
    
    logger.debug('Image URL optimized', { original: url, optimized: optimizedURL }, { 
      context: 'edge', 
      component: 'EdgeOptimizer' 
    });

    return optimizedURL;
  }

  // ============= SERVICE WORKER MANAGEMENT =============
  async registerServiceWorker(swPath: string = '/sw.js'): Promise<ServiceWorkerRegistration | null> {
    if (!('serviceWorker' in navigator)) {
      logger.warn('Service Worker not supported', undefined, { 
        context: 'edge', 
        component: 'EdgeOptimizer' 
      });
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.register(swPath);
      
      logger.info('Service Worker registered', { scope: registration.scope }, { 
        context: 'edge', 
        component: 'EdgeOptimizer' 
      });

      // Escuchar actualizaciones
      registration.addEventListener('updatefound', () => {
        logger.info('Service Worker update found', undefined, { 
          context: 'edge', 
          component: 'EdgeOptimizer' 
        });
      });

      return registration;
    } catch (error) {
      logger.error('Service Worker registration failed', error as Error, { 
        context: 'edge', 
        component: 'EdgeOptimizer' 
      });
      return null;
    }
  }

  // ============= NETWORK OPTIMIZATION =============
  async optimizeRequest(url: string, options: RequestInit = {}): Promise<Response> {
    // Verificar cache primero
    const cacheKey = `request:${url}:${JSON.stringify(options)}`;
    const cached = this.get(cacheKey);
    
    if (cached) {
      logger.debug('Request served from cache', { url }, { 
        context: 'edge', 
        component: 'EdgeOptimizer' 
      });
      return new Response(JSON.stringify(cached), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Optimizar headers
    const optimizedOptions: RequestInit = {
      ...options,
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'public, max-age=300',
        ...options.headers
      }
    };

    try {
      const response = await fetch(url, optimizedOptions);
      
      // Cachear respuestas exitosas
      if (response.ok && response.headers.get('content-type')?.includes('application/json')) {
        const data = await response.clone().json();
        this.set(cacheKey, data, { ttl: 5 * 60 * 1000 }); // 5 minutos
      }

      logger.debug('Request completed', { 
        url, 
        status: response.status, 
        cached: false 
      }, { 
        context: 'edge', 
        component: 'EdgeOptimizer' 
      });

      return response;
    } catch (error) {
      logger.error('Request failed', error as Error, { 
        context: 'edge', 
        component: 'EdgeOptimizer' 
      });
      throw error;
    }
  }

  // ============= PERFORMANCE MONITORING =============
  measurePerformance<T>(
    operation: () => Promise<T> | T,
    operationName: string
  ): Promise<{ result: T; duration: number }> {
    const startTime = performance.now();
    
    const measure = async () => {
      try {
        const result = await operation();
        const duration = performance.now() - startTime;
        
        logger.debug('Performance measured', { 
          operation: operationName, 
          duration: `${duration.toFixed(2)}ms` 
        }, { 
          context: 'edge', 
          component: 'EdgeOptimizer' 
        });

        return { result, duration };
      } catch (error) {
        const duration = performance.now() - startTime;
        
        logger.error('Operation failed during measurement', error as Error, { 
          context: 'edge', 
          component: 'EdgeOptimizer',
          operation: operationName,
          duration: `${duration.toFixed(2)}ms`
        });
        
        throw error;
      }
    };

    return measure();
  }

  // ============= STATISTICS =============
  getEdgeStats() {
    const cacheEntries = Array.from(this.cache.entries());
    const totalMemory = JSON.stringify(cacheEntries).length;
    
    return {
      cache: {
        size: this.cache.size,
        memory: `${(totalMemory / 1024).toFixed(2)}KB`,
        hitRate: this.calculateHitRate()
      },
      preload: {
        queueSize: this.preloadQueue.size
      },
      performance: {
        userAgent: navigator.userAgent,
        connection: (navigator as any).connection?.effectiveType || 'unknown'
      }
    };
  }

  private calculateHitRate(): number {
    const entries = Array.from(this.cache.values());
    if (entries.length === 0) return 0;
    
    const totalAccess = entries.reduce((sum, item) => sum + item.accessCount, 0);
    return totalAccess / entries.length;
  }

  // ============= CLEANUP =============
  clearCache(): void {
    this.cache.clear();
    this.preloadQueue.clear();
    
    logger.info('Edge cache cleared', undefined, { 
      context: 'edge', 
      component: 'EdgeOptimizer' 
    });
  }
}

// Singleton instance
export const edgeOptimizer = new EdgeOptimizer();