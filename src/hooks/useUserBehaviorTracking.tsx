// ============= USER BEHAVIOR TRACKING HOOK =============
// Hook para trackear comportamiento del usuario y predecir navegación

import { useCallback, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

interface UserBehavior {
  visitedRoutes: string[];
  timeSpentOnRoute: Record<string, number>;
  clickPatterns: string[];
  scrollDepth: Record<string, number>;
  interactions: Record<string, number>;
}

interface BehaviorMetrics {
  averageTimeOnPage: number;
  bounceRate: number;
  mostVisitedPages: Array<{ path: string; visits: number }>;
  engagementScore: number;
}

export const useUserBehaviorTracking = () => {
  const location = useLocation();
  const behavior = useRef<UserBehavior>({
    visitedRoutes: [],
    timeSpentOnRoute: {},
    clickPatterns: [],
    scrollDepth: {},
    interactions: {}
  });

  const routeStartTime = useRef<number>(Date.now());
  const maxScrollDepth = useRef<number>(0);
  const interactionCount = useRef<number>(0);

  // Trackear cambio de ruta
  useEffect(() => {
    const currentPath = location.pathname;
    const now = Date.now();
    
    // Guardar tiempo en ruta anterior
    if (behavior.current.visitedRoutes.length > 0) {
      const previousPath = behavior.current.visitedRoutes[behavior.current.visitedRoutes.length - 1];
      const timeSpent = now - routeStartTime.current;
      
      behavior.current.timeSpentOnRoute[previousPath] = 
        (behavior.current.timeSpentOnRoute[previousPath] || 0) + timeSpent;
        
      // Guardar profundidad de scroll
      behavior.current.scrollDepth[previousPath] = Math.max(
        behavior.current.scrollDepth[previousPath] || 0,
        maxScrollDepth.current
      );
      
      // Guardar interacciones
      behavior.current.interactions[previousPath] = 
        (behavior.current.interactions[previousPath] || 0) + interactionCount.current;
    }

    // Registrar nueva ruta
    behavior.current.visitedRoutes.push(currentPath);
    routeStartTime.current = now;
    maxScrollDepth.current = 0;
    interactionCount.current = 0;

    // Mantener historial limitado (últimas 50 rutas)
    if (behavior.current.visitedRoutes.length > 50) {
      behavior.current.visitedRoutes = behavior.current.visitedRoutes.slice(-50);
    }
  }, [location.pathname]);

  // Trackear scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercentage = (scrollTop / documentHeight) * 100;
      
      maxScrollDepth.current = Math.max(maxScrollDepth.current, scrollPercentage);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Trackear interacciones
  useEffect(() => {
    const handleInteraction = (event: Event) => {
      if (['click', 'keydown', 'touchstart'].includes(event.type)) {
        interactionCount.current++;
      }
    };

    ['click', 'keydown', 'touchstart'].forEach(eventType => {
      document.addEventListener(eventType, handleInteraction, { passive: true });
    });

    return () => {
      ['click', 'keydown', 'touchstart'].forEach(eventType => {
        document.removeEventListener(eventType, handleInteraction);
      });
    };
  }, []);

  // Registrar patrón de clicks
  const recordClickPattern = useCallback((target: string) => {
    behavior.current.clickPatterns.push(target);
    
    // Mantener solo los últimos 20 clicks
    if (behavior.current.clickPatterns.length > 20) {
      behavior.current.clickPatterns.shift();
    }
  }, []);

  // Obtener comportamiento actual
  const getBehavior = useCallback((): UserBehavior => {
    return { ...behavior.current };
  }, []);

  // Calcular métricas de comportamiento
  const getMetrics = useCallback((): BehaviorMetrics => {
    const routes = behavior.current.visitedRoutes;
    const timeSpent = behavior.current.timeSpentOnRoute;
    
    // Calcular tiempo promedio por página
    const totalTime = Object.values(timeSpent).reduce((sum, time) => sum + time, 0);
    const averageTimeOnPage = totalTime / Object.keys(timeSpent).length || 0;
    
    // Calcular bounce rate (páginas con menos de 30 segundos)
    const shortVisits = Object.values(timeSpent).filter(time => time < 30000).length;
    const bounceRate = (shortVisits / Object.keys(timeSpent).length) * 100 || 0;
    
    // Páginas más visitadas
    const routeFrequency: Record<string, number> = {};
    routes.forEach(route => {
      routeFrequency[route] = (routeFrequency[route] || 0) + 1;
    });
    
    const mostVisitedPages = Object.entries(routeFrequency)
      .map(([path, visits]) => ({ path, visits }))
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 5);
    
    // Score de engagement (basado en tiempo, scroll e interacciones)
    const avgScrollDepth = Object.values(behavior.current.scrollDepth).reduce((sum, depth) => sum + depth, 0) / 
                           Object.keys(behavior.current.scrollDepth).length || 0;
    const avgInteractions = Object.values(behavior.current.interactions).reduce((sum, interactions) => sum + interactions, 0) / 
                           Object.keys(behavior.current.interactions).length || 0;
    
    const engagementScore = Math.min(100, 
      (averageTimeOnPage / 1000) * 0.3 + // Tiempo en segundos
      avgScrollDepth * 0.4 + // Profundidad de scroll
      avgInteractions * 0.3 // Interacciones
    );

    return {
      averageTimeOnPage,
      bounceRate,
      mostVisitedPages,
      engagementScore
    };
  }, []);

  // Predecir próxima ruta probable
  const predictNextRoute = useCallback((): string | null => {
    const routes = behavior.current.visitedRoutes;
    if (routes.length < 2) return null;

    const currentRoute = routes[routes.length - 1];
    const sequences: Record<string, string[]> = {};

    // Construir secuencias de navegación
    for (let i = 0; i < routes.length - 1; i++) {
      const from = routes[i];
      const to = routes[i + 1];
      
      if (!sequences[from]) {
        sequences[from] = [];
      }
      sequences[from].push(to);
    }

    const possibleNext = sequences[currentRoute];
    if (!possibleNext || possibleNext.length === 0) return null;

    // Encontrar la ruta más común después de la actual
    const routeCounts: Record<string, number> = {};
    possibleNext.forEach(route => {
      routeCounts[route] = (routeCounts[route] || 0) + 1;
    });

    const mostLikely = Object.entries(routeCounts)
      .sort(([, a], [, b]) => b - a)[0];

    return mostLikely ? mostLikely[0] : null;
  }, []);

  // Limpiar datos al desmontar
  useEffect(() => {
    return () => {
      // Guardar comportamiento en localStorage para persistencia
      localStorage.setItem('userBehavior', JSON.stringify(behavior.current));
    };
  }, []);

  // Cargar comportamiento guardado al montar
  useEffect(() => {
    const savedBehavior = localStorage.getItem('userBehavior');
    if (savedBehavior) {
      try {
        const parsed = JSON.parse(savedBehavior);
        behavior.current = { ...behavior.current, ...parsed };
      } catch (error) {
        console.warn('Failed to load saved user behavior:', error);
      }
    }
  }, []);

  return {
    recordClickPattern,
    getBehavior,
    getMetrics,
    predictNextRoute
  };
};