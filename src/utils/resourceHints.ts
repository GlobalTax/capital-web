// ============= RESOURCE HINTS UTILITIES =============
// Sistema avanzado de resource hints para optimización de carga

interface ResourceHint {
  url: string;
  type: 'prefetch' | 'preload' | 'preconnect' | 'dns-prefetch';
  as?: 'script' | 'style' | 'image' | 'font' | 'document';
  crossorigin?: 'anonymous' | 'use-credentials';
  importance?: 'high' | 'low';
}

class ResourceHintsManager {
  private appliedHints = new Set<string>();
  private observer?: IntersectionObserver;

  // Aplicar hint de recurso
  applyHint(hint: ResourceHint): void {
    const hintKey = `${hint.type}-${hint.url}`;
    
    if (this.appliedHints.has(hintKey)) return;

    const link = document.createElement('link');
    link.rel = hint.type;
    link.href = hint.url;
    
    if (hint.as) link.setAttribute('as', hint.as);
    if (hint.crossorigin) link.crossOrigin = hint.crossorigin;
    if (hint.importance) link.setAttribute('importance', hint.importance);

    // Configurar callbacks para monitoreo
    link.onload = () => {
      console.debug(`✅ Resource hint loaded: ${hint.url}`);
    };
    
    link.onerror = () => {
      console.warn(`❌ Resource hint failed: ${hint.url}`);
    };

    document.head.appendChild(link);
    this.appliedHints.add(hintKey);
  }

  // Preconectar con dominios externos críticos
  preconnectToCriticalDomains(): void {
    const criticalDomains = [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
      'https://api.supabase.com'
    ];

    criticalDomains.forEach(domain => {
      this.applyHint({ url: domain, type: 'preconnect' });
    });
  }

  // Prefetch DNS para dominios que se usarán
  dnsPrefetch(domains: string[]): void {
    domains.forEach(domain => {
      this.applyHint({ url: domain, type: 'dns-prefetch' });
    });
  }

  // Preload de assets críticos
  preloadCriticalAssets(): void {
    const criticalAssets: ResourceHint[] = [
      {
        url: '/fonts/inter-var.woff2',
        type: 'preload',
        as: 'font',
        crossorigin: 'anonymous',
        importance: 'high'
      },
      {
        url: '/assets/logo.svg',
        type: 'preload',
        as: 'image',
        importance: 'high'
      }
    ];

    criticalAssets.forEach(asset => this.applyHint(asset));
  }

  // Prefetch de rutas probables basado en la ruta actual
  prefetchLikelyRoutes(currentPath: string): void {
    const routeMap: Record<string, string[]> = {
      '/': ['/dashboard', '/leads', '/marketing'],
      '/dashboard': ['/leads', '/analytics', '/reports'],
      '/leads': ['/leads/import', '/leads/export', '/dashboard'],
      '/marketing': ['/marketing/campaigns', '/marketing/analytics', '/dashboard']
    };

    const likelyRoutes = routeMap[currentPath] || [];
    
    likelyRoutes.forEach(route => {
      // Prefetch con delay progresivo
      setTimeout(() => {
        this.applyHint({
          url: route,
          type: 'prefetch',
          as: 'document'
        });
      }, 1000);
    });
  }

  // Prefetch inteligente basado en viewport
  setupIntelligentPrefetch(): void {
    if (!('IntersectionObserver' in window)) return;

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const element = entry.target as HTMLElement;
          const prefetchUrl = element.dataset.prefetch;
          
          if (prefetchUrl) {
            this.applyHint({
              url: prefetchUrl,
              type: 'prefetch',
              as: 'document'
            });
          }
        }
      });
    }, {
      rootMargin: '50px',
      threshold: 0.1
    });

    // Observar elementos con data-prefetch
    document.querySelectorAll('[data-prefetch]').forEach(el => {
      this.observer!.observe(el);
    });
  }

  // Preload condicional basado en conexión
  adaptivePreload(): void {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      
      if (connection) {
        const effectiveType = connection.effectiveType;
        const saveData = connection.saveData;
        
        // Solo preload agresivo en conexiones rápidas
        if (!saveData && ['4g'].includes(effectiveType)) {
          this.preloadCriticalAssets();
          this.preconnectToCriticalDomains();
        } else if (['3g', '4g'].includes(effectiveType)) {
          // Preload selectivo
          this.preconnectToCriticalDomains();
        }
        // No preload en conexiones lentas o con save-data
      } else {
        // Fallback: preload moderado
        this.preconnectToCriticalDomains();
      }
    } else {
      // Navegadores sin Network Information API
      this.preconnectToCriticalDomains();
    }
  }

  // Limpiar hints aplicados
  cleanup(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
    
    // Remover links de prefetch/preload que ya no son necesarios
    document.querySelectorAll('link[rel="prefetch"], link[rel="preload"]').forEach(link => {
      const href = link.getAttribute('href');
      if (href && !this.isResourceStillNeeded(href)) {
        link.remove();
      }
    });
  }

  private isResourceStillNeeded(url: string): boolean {
    // Lógica para determinar si un recurso sigue siendo necesario
    // Por ejemplo, no remover fonts o assets críticos
    const criticalResources = ['/fonts/', '/assets/logo', '/api/'];
    return criticalResources.some(pattern => url.includes(pattern));
  }

  // Obtener métricas de resource hints
  getMetrics(): { applied: number; successful: number; failed: number } {
    const links = document.querySelectorAll('link[rel="prefetch"], link[rel="preload"], link[rel="preconnect"]');
    
    return {
      applied: this.appliedHints.size,
      successful: 0, // Se podría trackear con listeners
      failed: 0 // Se podría trackear con listeners
    };
  }
}

export const resourceHints = new ResourceHintsManager();