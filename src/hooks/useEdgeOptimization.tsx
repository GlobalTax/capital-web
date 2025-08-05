import { useState, useEffect, useCallback } from 'react';
import { edgeOptimizer } from '@/core/edge/EdgeOptimizer';
import { securityManager } from '@/core/security/SecurityManager';
import { logger } from '@/utils/logger';

interface EdgeOptimizationStats {
  cache: {
    size: number;
    memory: string;
    hitRate: number;
  };
  preload: {
    queueSize: number;
  };
  performance: {
    userAgent: string;
    connection: string;
  };
  security: {
    totalEvents: number;
    eventsByType: Record<string, number>;
    eventsBySeverity: Record<string, number>;
    activeRateLimits: number;
    blockedIPs: number;
  };
}

export const useEdgeOptimization = () => {
  const [stats, setStats] = useState<EdgeOptimizationStats | null>(null);
  const [isServiceWorkerActive, setIsServiceWorkerActive] = useState(false);
  const [optimizationLevel, setOptimizationLevel] = useState<'basic' | 'enhanced' | 'aggressive'>('enhanced');

  const updateStats = useCallback(() => {
    try {
      const edgeStats = edgeOptimizer.getEdgeStats();
      const securityStats = securityManager.getSecurityMetrics();

      setStats({
        ...edgeStats,
        security: securityStats
      });

      logger.debug('Edge optimization stats updated', { edgeStats, securityStats }, {
        context: 'performance',
        component: 'useEdgeOptimization'
      });
    } catch (error) {
      logger.error('Failed to update edge stats', error as Error, {
        context: 'performance',
        component: 'useEdgeOptimization'
      });
    }
  }, []);

  useEffect(() => {
    const initializeOptimizations = async () => {
      try {
        const swRegistration = await edgeOptimizer.registerServiceWorker();
        setIsServiceWorkerActive(!!swRegistration);

        await edgeOptimizer.preloadResource('/api/health', 'script');
        
        logger.info('Edge optimizations initialized', { 
          serviceWorker: !!swRegistration,
          optimizationLevel 
        }, {
          context: 'performance',
          component: 'useEdgeOptimization'
        });

      } catch (error) {
        logger.error('Failed to initialize edge optimizations', error as Error, {
          context: 'performance',
          component: 'useEdgeOptimization'
        });
      }
    };

    initializeOptimizations();
    updateStats();

    const interval = setInterval(updateStats, 30000);
    return () => clearInterval(interval);
  }, [optimizationLevel, updateStats]);

  const optimizeImage = useCallback((url: string, options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'avif' | 'jpeg' | 'png';
  } = {}) => {
    return edgeOptimizer.optimizeImageURL(url, options);
  }, []);

  const preloadResource = useCallback(async (url: string, type: 'image' | 'video' | 'document' | 'script' | 'style' = 'script') => {
    try {
      await edgeOptimizer.preloadResource(url, type);
      updateStats();
      return true;
    } catch (error) {
      logger.error('Failed to preload resource', error as Error, {
        context: 'performance',
        component: 'useEdgeOptimization',
        data: { url }
      });
      return false;
    }
  }, [updateStats]);

  const optimizedFetch = useCallback(async (url: string, options: RequestInit = {}) => {
    try {
      return await edgeOptimizer.optimizeRequest(url, options);
    } catch (error) {
      logger.error('Optimized fetch failed', error as Error, {
        context: 'performance',
        component: 'useEdgeOptimization',
        data: { url }
      });
      throw error;
    }
  }, []);

  const validateInput = useCallback((input: string, options: {
    allowHTML?: boolean;
    maxLength?: number;
    stripScripts?: boolean;
  } = {}) => {
    const sanitized = securityManager.sanitizeInput(input, options);
    const hasXSS = securityManager.detectXSSAttempt(input);
    
    return {
      sanitized,
      isValid: !hasXSS,
      hasXSS
    };
  }, []);

  const checkRateLimit = useCallback((identifier: string, category: string = 'api') => {
    return securityManager.checkRateLimit(identifier, category);
  }, []);

  const measurePerformance = useCallback(async (
    operation: () => Promise<any> | any,
    operationName: string
  ) => {
    return await edgeOptimizer.measurePerformance(operation, operationName);
  }, []);

  const clearCache = useCallback(() => {
    edgeOptimizer.clearCache();
    securityManager.clearSecurityEvents();
    updateStats();
    
    logger.info('All caches cleared', undefined, {
      context: 'performance',
      component: 'useEdgeOptimization'
    });
  }, [updateStats]);

  const changeOptimizationLevel = useCallback((level: typeof optimizationLevel) => {
    setOptimizationLevel(level);
    
    logger.info('Optimization level changed', { level }, {
      context: 'performance',
      component: 'useEdgeOptimization'
    });
  }, []);

  return {
    stats,
    isServiceWorkerActive,
    optimizationLevel,
    optimizeImage,
    preloadResource,
    optimizedFetch,
    measurePerformance,
    validateInput,
    checkRateLimit,
    updateStats,
    clearCache,
    changeOptimizationLevel
  };
};