
import { useCallback, useRef } from 'react';
import { useErrorHandler } from './useErrorHandler';

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  blockDurationMs?: number;
}

interface RequestLog {
  timestamp: number;
  count: number;
}

export const useRateLimit = (config: RateLimitConfig) => {
  const { maxRequests, windowMs, blockDurationMs = windowMs } = config;
  const requestLogRef = useRef<Map<string, RequestLog>>(new Map());
  const blockedUntilRef = useRef<Map<string, number>>(new Map());
  const { handleError } = useErrorHandler();

  const isRateLimited = useCallback((key: string = 'default'): boolean => {
    const now = Date.now();
    
    // Verificar si está bloqueado
    const blockedUntil = blockedUntilRef.current.get(key);
    if (blockedUntil && now < blockedUntil) {
      return true;
    }

    const log = requestLogRef.current.get(key);
    
    if (!log) {
      // Primera solicitud
      requestLogRef.current.set(key, { timestamp: now, count: 1 });
      return false;
    }

    // Verificar si estamos en la misma ventana de tiempo
    if (now - log.timestamp < windowMs) {
      if (log.count >= maxRequests) {
        // Excedió el límite, bloquear
        blockedUntilRef.current.set(key, now + blockDurationMs);
        handleError(
          new Error(`Rate limit excedido: ${maxRequests} solicitudes en ${windowMs}ms`),
          { 
            component: 'useRateLimit', 
            metadata: { key, count: log.count, maxRequests } 
          }
        );
        return true;
      } else {
        // Incrementar contador
        log.count++;
        return false;
      }
    } else {
      // Nueva ventana de tiempo
      requestLogRef.current.set(key, { timestamp: now, count: 1 });
      return false;
    }
  }, [maxRequests, windowMs, blockDurationMs, handleError]);

  const executeWithRateLimit = useCallback(async <T,>(
    fn: () => Promise<T>,
    key: string = 'default'
  ): Promise<T | null> => {
    if (isRateLimited(key)) {
      return null;
    }

    try {
      return await fn();
    } catch (error) {
      handleError(error as Error, { 
        component: 'useRateLimit', 
        action: 'executeWithRateLimit',
        metadata: { key }
      });
      return null;
    }
  }, [isRateLimited, handleError]);

  const getRemainingRequests = useCallback((key: string = 'default'): number => {
    const log = requestLogRef.current.get(key);
    if (!log) return maxRequests;
    
    const now = Date.now();
    if (now - log.timestamp >= windowMs) {
      return maxRequests;
    }
    
    return Math.max(0, maxRequests - log.count);
  }, [maxRequests, windowMs]);

  const clearRateLimit = useCallback((key?: string) => {
    if (key) {
      requestLogRef.current.delete(key);
      blockedUntilRef.current.delete(key);
    } else {
      requestLogRef.current.clear();
      blockedUntilRef.current.clear();
    }
  }, []);

  return {
    isRateLimited,
    executeWithRateLimit,
    getRemainingRequests,
    clearRateLimit
  };
};
