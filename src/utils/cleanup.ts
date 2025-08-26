// ============= CLEANUP UTILITIES =============
// Dead code elimination and cleanup helpers

import { logger } from './logger';

// Memory cleanup for large objects
export const cleanupMemory = {
  // Clear large arrays and objects
  clearData: (data: any): void => {
    if (Array.isArray(data)) {
      data.length = 0;
    } else if (typeof data === 'object' && data !== null) {
      Object.keys(data).forEach(key => delete data[key]);
    }
  },

  // Cleanup DOM references
  clearDOMRefs: (refs: (HTMLElement | null)[]): void => {
    refs.forEach(ref => {
      if (ref) {
        ref.removeEventListener?.('click', () => {});
        ref.removeEventListener?.('scroll', () => {});
        ref.removeEventListener?.('resize', () => {});
      }
    });
  },

  // Cleanup intervals and timeouts
  clearTimers: (timers: (NodeJS.Timeout | number)[]): void => {
    timers.forEach(timer => {
      clearTimeout(timer);
      clearInterval(timer);
    });
  }
};

// Performance monitoring cleanup
export const performanceCleanup = {
  // Clear performance marks
  clearMarks: (prefix?: string): void => {
    try {
      if (typeof performance !== 'undefined' && performance.clearMarks) {
        if (prefix) {
          // Clear specific marks
          performance.getEntriesByType('mark')
            .filter(mark => mark.name.startsWith(prefix))
            .forEach(mark => performance.clearMarks(mark.name));
        } else {
          performance.clearMarks();
        }
      }
    } catch (error) {
        logger.warn('Error clearing performance marks', error as Error, {
        context: 'system',
        component: 'performanceCleanup'
      });
    }
  },

  // Clear performance measures
  clearMeasures: (prefix?: string): void => {
    try {
      if (typeof performance !== 'undefined' && performance.clearMeasures) {
        if (prefix) {
          performance.getEntriesByType('measure')
            .filter(measure => measure.name.startsWith(prefix))
            .forEach(measure => performance.clearMeasures(measure.name));
        } else {
          performance.clearMeasures();
        }
      }
    } catch (error) {
        logger.warn('Error clearing performance measures', error as Error, {
        context: 'system',
        component: 'performanceCleanup'
      });
    }
  }
};

// Cache cleanup utilities
export const cacheCleanup = {
  // Clear expired localStorage items
  clearExpiredStorage: (): void => {
    try {
      const now = Date.now();
      Object.keys(localStorage).forEach(key => {
        if (key.includes('_expires_')) {
          const expiryTime = parseInt(localStorage.getItem(key) || '0');
          if (now > expiryTime) {
            localStorage.removeItem(key);
            localStorage.removeItem(key.replace('_expires_', ''));
          }
        }
      });
    } catch (error) {
        logger.warn('Error clearing expired localStorage', error as Error, {
        context: 'system',
        component: 'cacheCleanup'
      });
    }
  },

  // Clean old cache entries
  clearOldCacheEntries: (maxAge: number = 24 * 60 * 60 * 1000): void => {
    try {
      const now = Date.now();
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('capittal_cache_')) {
          const item = localStorage.getItem(key);
          if (item) {
            try {
              const parsed = JSON.parse(item);
              if (parsed.timestamp && (now - parsed.timestamp) > maxAge) {
                localStorage.removeItem(key);
              }
            } catch {
              // Invalid JSON, remove it
              localStorage.removeItem(key);
            }
          }
        }
      });
    } catch (error) {
        logger.warn('Error clearing old cache entries', error as Error, {
        context: 'system',
        component: 'cacheCleanup'
      });
    }
  }
};

// Component cleanup hook
export const useCleanup = () => {
  const cleanup = (cleanupFns: (() => void)[]): (() => void) => {
    return () => {
      cleanupFns.forEach(fn => {
        try {
          fn();
        } catch (error) {
          logger.warn('Error in cleanup function', error as Error, {
            context: 'system',
            component: 'useCleanup'
          });
        }
      });
    };
  };

  return { cleanup };
};

// Global cleanup on app unmount
export const globalCleanup = (): void => {
  performanceCleanup.clearMarks('capittal_');
  performanceCleanup.clearMeasures('capittal_');
  cacheCleanup.clearExpiredStorage();
  cacheCleanup.clearOldCacheEntries();
  
  logger.info('Global cleanup completed', undefined, {
    context: 'system',
    component: 'globalCleanup'
  });
};