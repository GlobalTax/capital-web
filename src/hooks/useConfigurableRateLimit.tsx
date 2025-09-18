// ============= CONFIGURABLE RATE LIMIT SYSTEM =============
// Hook avanzado de rate limiting con umbrales dinámicos y override de emergencia

import { useCallback, useRef } from 'react';
import { useErrorHandler } from './useErrorHandler';
import { useEmergencyOverride } from './useEmergencyOverride';
import { logger } from '@/utils/logger';

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  blockDurationMs?: number;
  category?: string;
  elevatedMultiplier?: number; // Multiplier when emergency override is active
}

interface RequestLog {
  timestamp: number;
  count: number;
  category: string;
}

interface RateLimitMetrics {
  totalRequests: number;
  blockedRequests: number;
  currentWindowRequests: number;
  isCurrentlyBlocked: boolean;
  timeUntilReset: number;
}

export const useConfigurableRateLimit = (config: RateLimitConfig) => {
  const { 
    maxRequests, 
    windowMs, 
    blockDurationMs = windowMs,
    category = 'default',
    elevatedMultiplier = 3
  } = config;
  
  const { handleError } = useErrorHandler();
  const { overrideState } = useEmergencyOverride();
  
  const requestLogRef = useRef<Map<string, RequestLog>>(new Map());
  const blockedUntilRef = useRef<Map<string, number>>(new Map());
  const metricsRef = useRef<Map<string, RateLimitMetrics>>(new Map());

  // Calculate effective limits with emergency override
  const getEffectiveLimits = useCallback(() => {
    const isElevated = overrideState.rateLimitElevated && 
                      overrideState.expiresAt && 
                      Date.now() < overrideState.expiresAt;
    
    return {
      maxRequests: isElevated ? Math.floor(maxRequests * elevatedMultiplier) : maxRequests,
      windowMs,
      blockDurationMs: isElevated ? Math.floor(blockDurationMs / 2) : blockDurationMs,
      isElevated
    };
  }, [maxRequests, windowMs, blockDurationMs, elevatedMultiplier, overrideState]);

  const updateMetrics = useCallback((key: string, log: RequestLog | null, isBlocked: boolean) => {
    const now = Date.now();
    const blockedUntil = blockedUntilRef.current.get(key) || 0;
    
    const metrics: RateLimitMetrics = {
      totalRequests: log?.count || 0,
      blockedRequests: isBlocked ? 1 : 0,
      currentWindowRequests: log?.count || 0,
      isCurrentlyBlocked: now < blockedUntil,
      timeUntilReset: Math.max(0, blockedUntil - now)
    };
    
    metricsRef.current.set(key, metrics);
  }, []);

  const isRateLimited = useCallback((key: string = 'default'): boolean => {
    const now = Date.now();
    const effectiveLimits = getEffectiveLimits();
    
    // Check if blocked
    const blockedUntil = blockedUntilRef.current.get(key);
    if (blockedUntil && now < blockedUntil) {
      updateMetrics(key, null, true);
      return true;
    }

    const log = requestLogRef.current.get(key);
    
    if (!log) {
      // First request
      const newLog = { timestamp: now, count: 1, category };
      requestLogRef.current.set(key, newLog);
      updateMetrics(key, newLog, false);
      return false;
    }

    // Check if we're in the same time window
    if (now - log.timestamp < effectiveLimits.windowMs) {
      if (log.count >= effectiveLimits.maxRequests) {
        // Exceeded limit, block
        blockedUntilRef.current.set(key, now + effectiveLimits.blockDurationMs);
        
        const errorMessage = effectiveLimits.isElevated 
          ? `Rate limit excedido (modo elevado): ${log.count}/${effectiveLimits.maxRequests} en ${effectiveLimits.windowMs}ms`
          : `Rate limit excedido: ${log.count}/${effectiveLimits.maxRequests} en ${effectiveLimits.windowMs}ms`;
        
        handleError(
          new Error(errorMessage),
          { 
            component: 'useConfigurableRateLimit', 
            metadata: { 
              key, 
              category, 
              count: log.count, 
              maxRequests: effectiveLimits.maxRequests,
              isElevated: effectiveLimits.isElevated,
              emergencyOverride: overrideState
            } 
          }
        );
        
        logger.warn('Rate limit exceeded', {
          key,
          category,
          count: log.count,
          limit: effectiveLimits.maxRequests,
          isElevated: effectiveLimits.isElevated,
          blockDuration: effectiveLimits.blockDurationMs
        }, { context: 'system', component: 'useConfigurableRateLimit' });
        
        updateMetrics(key, log, true);
        return true;
      } else {
        // Increment counter
        log.count++;
        updateMetrics(key, log, false);
        return false;
      }
    } else {
      // New time window
      const newLog = { timestamp: now, count: 1, category };
      requestLogRef.current.set(key, newLog);
      updateMetrics(key, newLog, false);
      return false;
    }
  }, [category, getEffectiveLimits, handleError, overrideState, updateMetrics]);

  const executeWithRateLimit = useCallback(async <T,>(
    fn: () => Promise<T>,
    key: string = 'default'
  ): Promise<T | null> => {
    if (isRateLimited(key)) {
      return null;
    }

    try {
      const result = await fn();
      
      // Log successful execution
      if (getEffectiveLimits().isElevated) {
        logger.debug('Rate limited operation executed (elevated mode)', {
          key,
          category
        }, { context: 'system', component: 'useConfigurableRateLimit' });
      }
      
      return result;
    } catch (error) {
      handleError(error as Error, { 
        component: 'useConfigurableRateLimit', 
        action: 'executeWithRateLimit',
        metadata: { key, category }
      });
      return null;
    }
  }, [isRateLimited, getEffectiveLimits, handleError, category]);

  const getRemainingRequests = useCallback((key: string = 'default'): number => {
    const log = requestLogRef.current.get(key);
    const effectiveLimits = getEffectiveLimits();
    
    if (!log) return effectiveLimits.maxRequests;
    
    const now = Date.now();
    if (now - log.timestamp >= effectiveLimits.windowMs) {
      return effectiveLimits.maxRequests;
    }
    
    return Math.max(0, effectiveLimits.maxRequests - log.count);
  }, [getEffectiveLimits]);

  const getMetrics = useCallback((key: string = 'default'): RateLimitMetrics | null => {
    return metricsRef.current.get(key) || null;
  }, []);

  const getAllMetrics = useCallback((): Map<string, RateLimitMetrics> => {
    return new Map(metricsRef.current);
  }, []);

  const clearRateLimit = useCallback((key?: string) => {
    if (key) {
      requestLogRef.current.delete(key);
      blockedUntilRef.current.delete(key);
      metricsRef.current.delete(key);
      
      logger.info('Rate limit cleared for key', { key, category }, { 
        context: 'system', 
        component: 'useConfigurableRateLimit' 
      });
    } else {
      requestLogRef.current.clear();
      blockedUntilRef.current.clear();
      metricsRef.current.clear();
      
      logger.info('All rate limits cleared', { category }, { 
        context: 'system', 
        component: 'useConfigurableRateLimit' 
      });
    }
  }, [category]);

  const resetBlocks = useCallback(() => {
    blockedUntilRef.current.clear();
    // Update all metrics to reflect unblocked state
    for (const [key, log] of requestLogRef.current.entries()) {
      updateMetrics(key, log, false);
    }
    
    logger.info('All rate limit blocks reset', { category }, { 
      context: 'system', 
      component: 'useConfigurableRateLimit' 
    });
  }, [category, updateMetrics]);

  return {
    // Core functionality
    isRateLimited,
    executeWithRateLimit,
    getRemainingRequests,
    clearRateLimit,
    
    // Advanced features
    getMetrics,
    getAllMetrics,
    resetBlocks,
    
    // Status information
    isElevatedMode: getEffectiveLimits().isElevated,
    effectiveLimits: getEffectiveLimits(),
    category
  };
};