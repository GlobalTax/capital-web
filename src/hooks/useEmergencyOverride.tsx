// ============= EMERGENCY OVERRIDE SYSTEM =============
// Hook para controles de emergencia de Circuit Breaker y Rate Limits

import { useState, useCallback, useEffect } from 'react';
import { useErrorHandler } from './useErrorHandler';
import { logger } from '@/utils/logger';

interface EmergencyOverrideState {
  circuitBreakerDisabled: boolean;
  rateLimitElevated: boolean;
  expiresAt: number | null;
  reason: string | null;
  activatedBy: string | null;
}

const STORAGE_KEY = 'capittal_emergency_override';
const DEFAULT_DURATION = 30 * 60 * 1000; // 30 minutes default

export const useEmergencyOverride = () => {
  const { handleError } = useErrorHandler();
  
  const [overrideState, setOverrideState] = useState<EmergencyOverrideState>({
    circuitBreakerDisabled: false,
    rateLimitElevated: false,
    expiresAt: null,
    reason: null,
    activatedBy: null
  });

  // Load override state from storage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as EmergencyOverrideState;
        
        // Check if override has expired
        if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
          clearOverride();
          logger.info('Emergency override expired and cleared', {}, { 
            context: 'system', 
            component: 'useEmergencyOverride' 
          });
        } else {
          setOverrideState(parsed);
          logger.warn('Emergency override loaded from storage', { 
            state: parsed 
          }, { 
            context: 'system', 
            component: 'useEmergencyOverride' 
          });
        }
      }
    } catch (error) {
      handleError(error as Error, { 
        component: 'useEmergencyOverride', 
        action: 'loadFromStorage' 
      });
    }
  }, [handleError]);

  // Auto-clear expired overrides
  useEffect(() => {
    if (!overrideState.expiresAt) return;

    const timeUntilExpiry = overrideState.expiresAt - Date.now();
    if (timeUntilExpiry <= 0) {
      clearOverride();
      return;
    }

    const timeout = setTimeout(() => {
      clearOverride();
      logger.info('Emergency override auto-expired', {}, { 
        context: 'system', 
        component: 'useEmergencyOverride' 
      });
    }, timeUntilExpiry);

    return () => clearTimeout(timeout);
  }, [overrideState.expiresAt]);

  const saveOverrideState = useCallback((newState: EmergencyOverrideState) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      setOverrideState(newState);
    } catch (error) {
      handleError(error as Error, { 
        component: 'useEmergencyOverride', 
        action: 'saveState' 
      });
    }
  }, [handleError]);

  const disableCircuitBreaker = useCallback((
    reason: string, 
    durationMs: number = DEFAULT_DURATION,
    activatedBy: string = 'system'
  ) => {
    const newState = {
      ...overrideState,
      circuitBreakerDisabled: true,
      expiresAt: Date.now() + durationMs,
      reason,
      activatedBy
    };

    saveOverrideState(newState);
    
    logger.warn('Circuit Breaker DISABLED via emergency override', { 
      reason, 
      durationMs, 
      activatedBy,
      expiresAt: new Date(newState.expiresAt!).toISOString()
    }, { 
      context: 'system', 
      component: 'useEmergencyOverride' 
    });
  }, [overrideState, saveOverrideState]);

  const elevateRateLimit = useCallback((
    reason: string, 
    durationMs: number = DEFAULT_DURATION,
    activatedBy: string = 'system'
  ) => {
    const newState = {
      ...overrideState,
      rateLimitElevated: true,
      expiresAt: Date.now() + durationMs,
      reason,
      activatedBy
    };

    saveOverrideState(newState);
    
    logger.warn('Rate Limits ELEVATED via emergency override', { 
      reason, 
      durationMs, 
      activatedBy,
      expiresAt: new Date(newState.expiresAt!).toISOString()
    }, { 
      context: 'system', 
      component: 'useEmergencyOverride' 
    });
  }, [overrideState, saveOverrideState]);

  const enableBothOverrides = useCallback((
    reason: string, 
    durationMs: number = DEFAULT_DURATION,
    activatedBy: string = 'admin'
  ) => {
    const newState = {
      circuitBreakerDisabled: true,
      rateLimitElevated: true,
      expiresAt: Date.now() + durationMs,
      reason,
      activatedBy
    };

    saveOverrideState(newState);
    
    logger.warn('BOTH Circuit Breaker and Rate Limits overridden', { 
      reason, 
      durationMs, 
      activatedBy,
      expiresAt: new Date(newState.expiresAt!).toISOString()
    }, { 
      context: 'system', 
      component: 'useEmergencyOverride' 
    });
  }, [saveOverrideState]);

  const clearOverride = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setOverrideState({
        circuitBreakerDisabled: false,
        rateLimitElevated: false,
        expiresAt: null,
        reason: null,
        activatedBy: null
      });
      
      logger.info('Emergency override cleared', {}, { 
        context: 'system', 
        component: 'useEmergencyOverride' 
      });
    } catch (error) {
      handleError(error as Error, { 
        component: 'useEmergencyOverride', 
        action: 'clearOverride' 
      });
    }
  }, [handleError]);

  const getTimeUntilExpiry = useCallback(() => {
    if (!overrideState.expiresAt) return 0;
    return Math.max(0, overrideState.expiresAt - Date.now());
  }, [overrideState.expiresAt]);

  const isActive = overrideState.circuitBreakerDisabled || overrideState.rateLimitElevated;

  return {
    // State
    overrideState,
    isActive,
    timeUntilExpiry: getTimeUntilExpiry(),
    
    // Actions
    disableCircuitBreaker,
    elevateRateLimit,
    enableBothOverrides,
    clearOverride,
    
    // Utilities
    formatExpiryTime: () => {
      if (!overrideState.expiresAt) return '';
      const minutes = Math.ceil(getTimeUntilExpiry() / 60000);
      return `${minutes}m restantes`;
    }
  };
};