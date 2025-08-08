// ============= THROTTLE HOOK =============
// Hook optimizado para throttle con performance monitoring

import { useCallback, useRef } from 'react';
import { usePerformanceTimer } from '@/utils/performanceMonitor';

export const useThrottle = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  trackPerformance = false
): T => {
  const lastCallRef = useRef<number>(0);
  const callbackRef = useRef(callback);

  // Actualizar la referencia del callback
  callbackRef.current = callback;

  // Hook de performance
  const { startTimer } = usePerformanceTimer();
  const throttledCallback = useCallback(
    ((...args: Parameters<T>) => {
      const now = Date.now();
      
      if (now - lastCallRef.current >= delay) {
        lastCallRef.current = now;
        
        if (trackPerformance) {
          const end = startTimer('throttled-operation');
          try {
            const result = callbackRef.current(...args);
            end('interaction');
            return result;
          } catch (error) {
            end('interaction');
            throw error;
          }
        } else {
          return callbackRef.current(...args);
        }
      }
    }) as T,
    [delay, trackPerformance]
  );

  return throttledCallback;
};