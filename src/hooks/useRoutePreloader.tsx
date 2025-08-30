// ============= ROUTE PRELOADER HOOK =============
// Hook para precargar rutas en hover y navegación predictiva

import { useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { performanceMonitor } from '@/utils/performanceMonitor';

interface PreloadOptions {
  prefetchDelay?: number;
  hoverDelay?: number;
  enabled?: boolean;
}

interface RoutePreloader {
  preloadRoute: (path: string) => Promise<void>;
  prefetchOnHover: (element: HTMLElement, path: string) => () => void;
  predictivePreload: (userBehavior: UserBehavior) => void;
}

interface UserBehavior {
  visitedRoutes: string[];
  timeSpentOnRoute: Record<string, number>;
  clickPatterns: string[];
}

export const useRoutePreloader = (options: PreloadOptions = {}): RoutePreloader => {
  const { prefetchDelay = 200, hoverDelay = 100, enabled = true } = options;
  const navigate = useNavigate();
  const preloadedRoutes = useRef<Set<string>>(new Set());
  const hoverTimers = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const userBehavior = useRef<UserBehavior>({
    visitedRoutes: [],
    timeSpentOnRoute: {},
    clickPatterns: []
  });

  // Precargar una ruta específica
  const preloadRoute = useCallback(async (path: string): Promise<void> => {
    if (!enabled || preloadedRoutes.current.has(path)) return;

    const startTime = performance.now();

    try {
      // Handle special route mappings for better UX
      const routeMap: Record<string, string> = {
        '/blog': '/recursos/blog',
        '/recursos/blog': '/recursos/blog'
      };
      
      const mappedPath = routeMap[path] || path;
      
      // Preload route module with proper extension handling
      let routeModule = null;
      
      // For known route patterns, try specific imports
      if (mappedPath === '/recursos/blog') {
        try {
          routeModule = await import('@/pages/recursos/Blog.tsx');
        } catch (e) {
          console.warn(`Could not preload blog route: ${path}`);
        }
      } else {
        // For other routes, try a more generic approach
        console.warn(`Route preloading not configured for: ${path}`);
      }
      
      if (routeModule) {
        preloadedRoutes.current.add(path);
        
        // Precargar recursos críticos relacionados
        await preloadCriticalResources(path);
      }
    } catch (error) {
      console.warn(`Failed to preload route ${path}:`, error);
    } finally {
      const endTime = performance.now();
      performanceMonitor.record(`preload-${path}`, endTime - startTime, 'loading');
    }
  }, [enabled]);

  // Configurar hover preloading
  const prefetchOnHover = useCallback((element: HTMLElement, path: string) => {
    if (!enabled) return () => {};

    const handleMouseEnter = () => {
      const timer = setTimeout(() => {
        preloadRoute(path);
      }, hoverDelay);
      
      hoverTimers.current.set(path, timer);
    };

    const handleMouseLeave = () => {
      const timer = hoverTimers.current.get(path);
      if (timer) {
        clearTimeout(timer);
        hoverTimers.current.delete(path);
      }
    };

    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
      handleMouseLeave();
    };
  }, [enabled, hoverDelay, preloadRoute]);

  // Preloading predictivo basado en comportamiento
  const predictivePreload = useCallback((behavior: UserBehavior) => {
    if (!enabled) return;

    // Analizar patrones de navegación
    const likelyNextRoutes = analyzeBehaviorPatterns(behavior);
    
    // Precargar las rutas más probables
    likelyNextRoutes.slice(0, 3).forEach(route => {
      setTimeout(() => preloadRoute(route.path), route.priority * 1000);
    });
  }, [enabled, preloadRoute]);

  // Precargar recursos críticos para una ruta
  const preloadCriticalResources = async (path: string): Promise<void> => {
    const criticalAssets = getCriticalAssetsForRoute(path);
    
    const preloadPromises = criticalAssets.map(async (asset) => {
      try {
        if (asset.type === 'image') {
          const img = new Image();
          img.src = asset.url;
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
          });
        } else if (asset.type === 'css') {
          const link = document.createElement('link');
          link.rel = 'prefetch';
          link.href = asset.url;
          document.head.appendChild(link);
        }
      } catch (error) {
        console.warn(`Failed to preload asset ${asset.url}:`, error);
      }
    });

    await Promise.allSettled(preloadPromises);
  };

  // Limpiar timers al desmontar
  useEffect(() => {
    return () => {
      hoverTimers.current.forEach(timer => clearTimeout(timer));
      hoverTimers.current.clear();
    };
  }, []);

  return {
    preloadRoute,
    prefetchOnHover,
    predictivePreload
  };
};

// Analizar patrones de comportamiento para predecir próximas rutas
function analyzeBehaviorPatterns(behavior: UserBehavior): Array<{ path: string; priority: number }> {
  const routeFrequency: Record<string, number> = {};
  const routeSequences: Record<string, string[]> = {};

  // Analizar frecuencia de visitas
  behavior.visitedRoutes.forEach(route => {
    routeFrequency[route] = (routeFrequency[route] || 0) + 1;
  });

  // Analizar secuencias de navegación
  for (let i = 0; i < behavior.visitedRoutes.length - 1; i++) {
    const current = behavior.visitedRoutes[i];
    const next = behavior.visitedRoutes[i + 1];
    
    if (!routeSequences[current]) {
      routeSequences[current] = [];
    }
    routeSequences[current].push(next);
  }

  // Calcular probabilidades
  const predictions: Array<{ path: string; priority: number }> = [];
  
  Object.entries(routeSequences).forEach(([from, toRoutes]) => {
    const routeCounts: Record<string, number> = {};
    toRoutes.forEach(route => {
      routeCounts[route] = (routeCounts[route] || 0) + 1;
    });

    Object.entries(routeCounts).forEach(([route, count]) => {
      const probability = count / toRoutes.length;
      const frequency = routeFrequency[route] || 0;
      const priority = (probability * 0.7) + (frequency * 0.3);
      
      predictions.push({ path: route, priority });
    });
  });

  return predictions.sort((a, b) => b.priority - a.priority);
}

// Obtener assets críticos para una ruta específica
function getCriticalAssetsForRoute(path: string): Array<{ url: string; type: 'image' | 'css' | 'js' }> {
  const assetMap: Record<string, Array<{ url: string; type: 'image' | 'css' | 'js' }>> = {
    '/dashboard': [
      { url: '/assets/dashboard-chart.svg', type: 'image' },
      { url: '/assets/dashboard.css', type: 'css' }
    ],
    '/leads': [
      { url: '/assets/leads-table.css', type: 'css' },
      { url: '/assets/lead-icons.svg', type: 'image' }
    ],
    '/marketing': [
      { url: '/assets/marketing-analytics.css', type: 'css' },
      { url: '/assets/charts.js', type: 'js' }
    ]
  };

  return assetMap[path] || [];
}