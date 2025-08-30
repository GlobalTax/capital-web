// ============= PREDICTIVE NAVIGATION HOOK =============
// Hook para navegación predictiva basada en ML patterns

import { useCallback, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useUserBehaviorTracking } from './useUserBehaviorTracking';
import { useRoutePreloader } from './useRoutePreloader';
import { resourceHints } from '@/utils/resourceHints';

interface NavigationPrediction {
  route: string;
  confidence: number;
  reason: 'sequence' | 'frequency' | 'time-based' | 'scroll-depth';
}

interface PredictiveConfig {
  enabled?: boolean;
  confidenceThreshold?: number;
  maxPredictions?: number;
  updateInterval?: number;
}

export const usePredictiveNavigation = (config: PredictiveConfig = {}) => {
  const {
    enabled = false,
    confidenceThreshold = 0.6,
    maxPredictions = 3,
    updateInterval = 5000
  } = config;

  const location = useLocation();
  const { getBehavior, getMetrics } = useUserBehaviorTracking();
  const { preloadRoute } = useRoutePreloader();
  
  const predictions = useRef<NavigationPrediction[]>([]);
  const lastPredictionTime = useRef<number>(0);

  // Algoritmo de predicción basado en patrones
  const generatePredictions = useCallback((): NavigationPrediction[] => {
    if (!enabled) return [];

    const behavior = getBehavior();
    const metrics = getMetrics();
    const currentRoute = location.pathname;
    
    const newPredictions: NavigationPrediction[] = [];

    // 1. Predicción basada en secuencias históricas
    const sequencePredictions = predictBySequence(behavior, currentRoute);
    newPredictions.push(...sequencePredictions);

    // 2. Predicción basada en frecuencia de visitas
    const frequencyPredictions = predictByFrequency(behavior, currentRoute);
    newPredictions.push(...frequencyPredictions);

    // 3. Predicción basada en tiempo en página
    const timePredictions = predictByTime(behavior, currentRoute, metrics);
    newPredictions.push(...timePredictions);

    // 4. Predicción basada en profundidad de scroll
    const scrollPredictions = predictByScrollDepth(behavior, currentRoute);
    newPredictions.push(...scrollPredictions);

    // Consolidar y rankear predicciones
    const consolidated = consolidatePredictions(newPredictions);
    
    return consolidated
      .filter(p => p.confidence >= confidenceThreshold)
      .slice(0, maxPredictions);
  }, [enabled, confidenceThreshold, maxPredictions, location.pathname, getBehavior, getMetrics]);

  // Ejecutar predicciones y preloading
  const executePredictions = useCallback(() => {
    const now = Date.now();
    
    if (now - lastPredictionTime.current < updateInterval) return;

    const newPredictions = generatePredictions();
    predictions.current = newPredictions;
    lastPredictionTime.current = now;

    // Preload rutas predichas
    newPredictions.forEach((prediction, index) => {
      setTimeout(() => {
        preloadRoute(prediction.route);
        resourceHints.applyHint({
          url: prediction.route,
          type: 'prefetch',
          as: 'document'
        });
      }, index * 500); // Escalonar preloads
    });

    console.debug('🔮 Navigation predictions:', newPredictions);
  }, [generatePredictions, preloadRoute, updateInterval]);

  // Ejecutar predicciones periódicamente
  useEffect(() => {
    if (!enabled) return;

    const interval = setInterval(executePredictions, updateInterval);
    
    // Ejecutar inmediatamente también
    executePredictions();

    return () => clearInterval(interval);
  }, [enabled, executePredictions, updateInterval]);

  // Ejecutar al cambiar de ruta
  useEffect(() => {
    if (enabled) {
      // Delay para permitir que se registre la nueva ruta
      setTimeout(executePredictions, 1000);
    }
  }, [location.pathname, enabled, executePredictions]);

  return {
    predictions: predictions.current,
    refreshPredictions: executePredictions
  };
};

// Predicción basada en secuencias de navegación
function predictBySequence(behavior: any, currentRoute: string): NavigationPrediction[] {
  const routes = behavior.visitedRoutes;
  const sequences: Record<string, string[]> = {};

  // Construir mapa de secuencias
  for (let i = 0; i < routes.length - 1; i++) {
    const from = routes[i];
    const to = routes[i + 1];
    
    if (!sequences[from]) sequences[from] = [];
    sequences[from].push(to);
  }

  const possibleNext = sequences[currentRoute] || [];
  const routeCounts: Record<string, number> = {};
  
  possibleNext.forEach(route => {
    routeCounts[route] = (routeCounts[route] || 0) + 1;
  });

  return Object.entries(routeCounts).map(([route, count]) => ({
    route,
    confidence: count / possibleNext.length,
    reason: 'sequence' as const
  }));
}

// Predicción basada en frecuencia general
function predictByFrequency(behavior: any, currentRoute: string): NavigationPrediction[] {
  const routes = behavior.visitedRoutes;
  const routeCounts: Record<string, number> = {};
  
  routes.forEach(route => {
    if (route !== currentRoute) {
      routeCounts[route] = (routeCounts[route] || 0) + 1;
    }
  });

  const total = Object.values(routeCounts).reduce((sum, count) => sum + count, 0);
  
  return Object.entries(routeCounts)
    .map(([route, count]) => ({
      route,
      confidence: count / total,
      reason: 'frequency' as const
    }))
    .filter(p => p.confidence > 0.1);
}

// Predicción basada en tiempo promedio en página
function predictByTime(behavior: any, currentRoute: string, metrics: any): NavigationPrediction[] {
  const timeSpent = behavior.timeSpentOnRoute;
  const avgTime = metrics.averageTimeOnPage;
  
  // Si el usuario ha pasado más tiempo del promedio, es probable que navegue
  const currentTime = Date.now() - (behavior.routeStartTime || Date.now());
  
  if (currentTime > avgTime * 1.2) {
    // Buscar rutas frecuentes después de tiempo prolongado
    return [{
      route: '/dashboard',
      confidence: 0.7,
      reason: 'time-based' as const
    }];
  }

  return [];
}

// Predicción basada en profundidad de scroll
function predictByScrollDepth(behavior: any, currentRoute: string): NavigationPrediction[] {
  const scrollDepth = behavior.scrollDepth[currentRoute] || 0;
  
  // Si el usuario ha scrolleado mucho, puede estar buscando más información
  if (scrollDepth > 80) {
    return [{
      route: '/search',
      confidence: 0.6,
      reason: 'scroll-depth' as const
    }];
  }

  return [];
}

// Consolidar predicciones múltiples para la misma ruta
function consolidatePredictions(predictions: NavigationPrediction[]): NavigationPrediction[] {
  const routeMap: Record<string, NavigationPrediction[]> = {};
  
  predictions.forEach(prediction => {
    if (!routeMap[prediction.route]) {
      routeMap[prediction.route] = [];
    }
    routeMap[prediction.route].push(prediction);
  });

  return Object.entries(routeMap).map(([route, preds]) => {
    // Combinar confidencias usando weighted average
    const totalConfidence = preds.reduce((sum, p) => sum + p.confidence, 0);
    const avgConfidence = totalConfidence / preds.length;
    
    // Boost por múltiples fuentes
    const boost = Math.min(0.2, (preds.length - 1) * 0.1);
    
    return {
      route,
      confidence: Math.min(1, avgConfidence + boost),
      reason: preds[0].reason
    };
  }).sort((a, b) => b.confidence - a.confidence);
}