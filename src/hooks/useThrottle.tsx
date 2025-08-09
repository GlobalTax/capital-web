// ============= THROTTLE HOOK =============
// Hook optimizado para throttle con performance monitoring

import { useCallback, useRef } from 'react';
import { performanceMonitor } from '@/shared/services/performance-monitor.service';

export const useThrottle = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  trackPerformance = false
): T => {
  const lastCallRef = useRef<number>(0);
  const callbackRef = useRef(callback);

  // Actualizar la referencia del callback
  callbackRef.current = callback;

  const throttledCallback = useCallback(
    ((...args: Parameters<T>) => {
      const now = Date.now();
      
      if (now - lastCallRef.current >= delay) {
        lastCallRef.current = now;
        
        if (trackPerformance) {
          performanceMonitor.startTimer('throttled-operation', 'interaction');
          try {
            const result = callbackRef.current(...args);
            performanceMonitor.endTimer('throttled-operation');
            return result;
          } catch (error) {
            performanceMonitor.endTimer('throttled-operation');
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