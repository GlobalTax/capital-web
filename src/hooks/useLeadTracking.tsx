import { useCallback, useRef, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';
import { useEmergencyOverride } from './useEmergencyOverride';
import { useStorageFallback } from './useStorageFallback';

interface TrackingOptions {
  enablePageTracking?: boolean;
  enableTimeTracking?: boolean;
  enableCalculatorTracking?: boolean;
  enableContactTracking?: boolean;
}

interface VisitorSession {
  sessionId: string;
  visitorId: string;
  companyDomain?: string;
  startTime: number;
  pageViews: string[];
}

export const useLeadTracking = (options: TrackingOptions = {}) => {
  const {
    enablePageTracking = true,
    enableTimeTracking = true,
    enableCalculatorTracking = true,
    enableContactTracking = true
  } = options;

  // Enhanced circuit breaker state with degraded mode and exponential backoff
  const [circuitState, setCircuitState] = useState<{
    isOpen: boolean;
    failureCount: number;
    lastFailureTime: number;
    isDisabled: boolean;
    isDegraded: boolean; // New: allows reduced frequency instead of full block
    backoffLevel: number; // For exponential backoff
  }>({
    isOpen: false,
    failureCount: 0,
    lastFailureTime: 0,
    isDisabled: false,
    isDegraded: false,
    backoffLevel: 0
  });

  // Improved circuit breaker configuration
  const MAX_FAILURES = 5; // Increased threshold for better resilience
  const DEGRADED_FAILURES = 3; // Start degraded mode earlier
  const MAX_BACKOFF_LEVEL = 4; // Maximum backoff level
  
  // Dynamic backoff times (exponential: 1min, 2min, 5min, 10min, 20min)
  const getBackoffTime = useCallback((level: number) => {
    const backoffTimes = [60000, 120000, 300000, 600000, 1200000]; // 1m, 2m, 5m, 10m, 20m
    return backoffTimes[Math.min(level, backoffTimes.length - 1)];
  }, []);

  const shouldAllowRequest = useCallback((urgency: 'low' | 'medium' | 'high' = 'medium') => {
    const { overrideState } = useEmergencyOverride();
    
    // Emergency override check
    if (overrideState.circuitBreakerDisabled && 
        overrideState.expiresAt && 
        Date.now() < overrideState.expiresAt) {
      logger.info('Circuit breaker bypassed via emergency override', {
        reason: overrideState.reason,
        activatedBy: overrideState.activatedBy
      }, { context: 'system', component: 'useLeadTracking' });
      return true;
    }
    
    if (circuitState.isDisabled) {
      return false; // Completely disabled
    }
    
    if (!circuitState.isOpen && !circuitState.isDegraded) {
      return true; // Circuit healthy
    }
    
    const now = Date.now();
    const timeSinceLastFailure = now - circuitState.lastFailureTime;
    const backoffTime = getBackoffTime(circuitState.backoffLevel);
    
    // Check if circuit should transition back to closed
    if (timeSinceLastFailure > backoffTime) {
      return true; // Allow request to test circuit
    }
    
    // Degraded mode: allow reduced requests based on urgency
    if (circuitState.isDegraded && !circuitState.isOpen) {
      const degradedInterval = Math.floor(backoffTime / (urgency === 'high' ? 2 : urgency === 'medium' ? 4 : 8));
      return timeSinceLastFailure > degradedInterval;
    }
    
    return false;
  }, [circuitState, getBackoffTime]);

  const recordSuccess = useCallback(() => {
    setCircuitState(prev => {
      // Gradual recovery: reduce backoff level on success
      const newBackoffLevel = Math.max(0, prev.backoffLevel - 1);
      
      logger.info('Circuit breaker success recorded', {
        previousFailureCount: prev.failureCount,
        previousBackoffLevel: prev.backoffLevel,
        newBackoffLevel
      }, { context: 'system', component: 'useLeadTracking' });
      
      return {
        ...prev,
        isOpen: false,
        isDegraded: newBackoffLevel > 0, // Stay degraded if backoff level > 0
        failureCount: Math.max(0, prev.failureCount - 1), // Gradually reduce failure count
        backoffLevel: newBackoffLevel
      };
    });
  }, []);

  const recordFailure = useCallback((error?: Error) => {
    setCircuitState(prev => {
      const newFailureCount = prev.failureCount + 1;
      const newBackoffLevel = Math.min(MAX_BACKOFF_LEVEL, prev.backoffLevel + 1);
      const shouldDegrade = newFailureCount >= DEGRADED_FAILURES;
      const shouldOpen = newFailureCount >= MAX_FAILURES;
      const shouldDisable = newFailureCount >= MAX_FAILURES * 2; // Complete disable after many failures
      
      logger.warn('Circuit breaker failure recorded', {
        newFailureCount,
        newBackoffLevel,
        shouldDegrade,
        shouldOpen,
        shouldDisable,
        error: error?.message,
        backoffTime: getBackoffTime(newBackoffLevel)
      }, { context: 'system', component: 'useLeadTracking' });
      
      return {
        isOpen: shouldOpen,
        isDegraded: shouldDegrade,
        failureCount: newFailureCount,
        lastFailureTime: Date.now(),
        isDisabled: shouldDisable,
        backoffLevel: newBackoffLevel
      };
    });
  }, [getBackoffTime]);

  // Generar IDs únicos para sesión y visitante
  const getOrCreateVisitorId = useCallback(() => {
    let visitorId = localStorage.getItem('capittal_visitor_id');
    if (!visitorId) {
      visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('capittal_visitor_id', visitorId);
    }
    return visitorId;
  }, []);

  const getOrCreateSessionId = useCallback(() => {
    let sessionId = sessionStorage.getItem('capittal_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('capittal_session_id', sessionId);
    }
    return sessionId;
  }, []);

  // Detectar empresa desde email o dominio
  const detectCompanyDomain = useCallback(() => {
    // Intentar detectar desde localStorage, email o referrer
    const savedDomain = localStorage.getItem('capittal_company_domain');
    if (savedDomain) return savedDomain;

    // Detectar desde referrer si viene de un dominio corporativo
    const referrer = document.referrer;
    if (referrer && !referrer.includes(window.location.hostname)) {
      try {
        const domain = new URL(referrer).hostname;
        if (!['google.com', 'linkedin.com', 'facebook.com', 'twitter.com'].includes(domain)) {
          localStorage.setItem('capittal_company_domain', domain);
          return domain;
        }
      } catch (e) {
        // Ignore invalid URLs
      }
    }

    return undefined;
  }, []);

  // Función principal de tracking con circuit breaker
  const trackEvent = useCallback(async (
    eventType: string,
    pagePath: string,
    eventData: Record<string, any> = {},
    pointsAwarded: number = 0
  ) => {
    // Check circuit breaker before attempting request
    if (!shouldAllowRequest()) {
      console.debug('🚫 Tracking blocked by circuit breaker');
      return;
    }

    try {
      const visitorId = getOrCreateVisitorId();
      const sessionId = getOrCreateSessionId();
      const companyDomain = detectCompanyDomain();

      // Obtener UTM parameters
      const urlParams = new URLSearchParams(window.location.search);
      const utmSource = urlParams.get('utm_source');
      const utmMedium = urlParams.get('utm_medium');
      const utmCampaign = urlParams.get('utm_campaign');

      const trackingEvent = {
        visitor_id: visitorId,
        session_id: sessionId,
        event_type: eventType,
        page_path: pagePath,
        event_data: eventData || {},
        company_domain: companyDomain,
        referrer: document.referrer || null,
        utm_source: utmSource,
        utm_medium: utmMedium,
        utm_campaign: utmCampaign
      };

      console.debug('🔄 Tracking event:', eventType, 'for visitor:', visitorId.substring(0, 8) + '...');
      
      // Skip tracking in development, admin routes, or when circuit is open
      if (process.env.NODE_ENV !== 'production' || 
          window.location.pathname.startsWith('/admin') ||
          circuitState.isOpen) {
        console.debug('⏭️ Tracking skipped (dev/admin/circuit-open)');
        return;
      }
      
      // Use secure tracking edge function with optimized timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Tracking timeout')), 8000); // Increased timeout for stability
      });

      const requestPromise = supabase.functions.invoke('secure-tracking', {
        body: { event: trackingEvent }
      });

      const result = await Promise.race([requestPromise, timeoutPromise]);
      
      if (result && typeof result === 'object' && 'error' in result && result.error) {
        recordFailure();
        console.warn('⚠️ Lead tracking failed, retrying...', result.error);
        
        // Retry logic - intentar una vez más con timeout más largo
        try {
          const retryPromise = supabase.functions.invoke('secure-tracking', {
            body: { event: trackingEvent }
          });
          const retryTimeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Retry tracking timeout')), 12000);
          });
          
          const retryResult = await Promise.race([retryPromise, retryTimeoutPromise]);
          if (retryResult && typeof retryResult === 'object' && 'error' in retryResult && retryResult.error) {
            throw retryResult.error;
          }
          
          recordSuccess();
          console.debug('✅ Event tracked successfully after retry:', eventType);
          return;
        } catch (retryError) {
          console.error('❌ Lead tracking failed after retry:', retryError);
          throw result.error;
        }
      }
      
      recordSuccess();
      console.debug('✅ Event tracked successfully via secure endpoint:', eventType);

    } catch (error) {
      recordFailure();
      console.error('❌ Lead tracking error:', error);
      // Fallar silenciosamente para no afectar UX pero logear el error
    }
  }, [getOrCreateVisitorId, getOrCreateSessionId, detectCompanyDomain, shouldAllowRequest, recordSuccess, recordFailure]);

  // Tracking de páginas visitadas - DISABLED to reduce Edge Function consumption
  const trackPageView = useCallback(async (pagePath?: string) => {
    if (!enablePageTracking) return;
    
    // TEMPORARILY DISABLED - consuming too many Edge Functions
    console.debug('📄 Page view tracking disabled to reduce consumption');
    return;
    
    const currentPath = pagePath || window.location.pathname;
    const timeOnPage = Date.now();
    
    await trackEvent('page_view', currentPath, { 
      timestamp: timeOnPage,
      title: document.title 
    }, 5);
  }, [enablePageTracking, trackEvent]);

  // Tracking de tiempo en página
  const trackTimeOnPage = useCallback(async (pagePath?: string) => {
    if (!enableTimeTracking) return;

    const currentPath = pagePath || window.location.pathname;
    const startTime = Date.now();
    
    const handleBeforeUnload = async () => {
      const timeSpent = Math.round((Date.now() - startTime) / 1000);
      if (timeSpent > 30) { // Solo trackear si pasó más de 30 segundos
        await trackEvent('time_on_page', currentPath, { 
          seconds: timeSpent 
        }, Math.min(Math.round(timeSpent / 30), 15)); // Max 15 puntos por tiempo
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      handleBeforeUnload(); // Llamar también al cleanup
    };
  }, [enableTimeTracking, trackEvent]);

  // Tracking específico para calculadora - REDUCED
  const trackCalculatorUsage = useCallback(async (action: string, data: any = {}) => {
    if (!enableCalculatorTracking) return;
    
    // Only track critical calculator events to reduce consumption
    const criticalActions = ['completed', 'email_submitted'];
    if (!criticalActions.includes(action)) {
      console.debug('📊 Non-critical calculator event skipped:', action);
      return;
    }
    
    await trackEvent('calculator_usage', '/calculadora-valoracion', {
      action,
      ...data
    }, action === 'completed' ? 25 : 10);
  }, [enableCalculatorTracking, trackEvent]);

  // Tracking específico para páginas de contacto
  const trackContactInterest = useCallback(async (action: string, data: any = {}) => {
    if (!enableContactTracking) return;
    
    await trackEvent('contact_interest', '/contacto', {
      action,
      ...data
    }, action === 'form_submit' ? 30 : 20);
  }, [enableContactTracking, trackEvent]);

  // Track valuation completion with high-value scoring
  const trackValuationCompleted = useCallback(async (companyData: any, metadata: any = {}) => {
    try {
      await trackEvent('calculator_usage', window.location.pathname, {
        action: 'valuation_completed',
        companyData: {
          industry: companyData.industry,
          employeeRange: companyData.employeeRange,
          revenue: companyData.revenue,
          ebitda: companyData.ebitda,
          location: companyData.location
        },
        result: {
          finalValuation: companyData.finalValuation,
          ebitdaMultipleUsed: companyData.ebitdaMultipleUsed,
          valuationRangeMin: companyData.valuationRangeMin,
          valuationRangeMax: companyData.valuationRangeMax
        },
        metadata: {
          timeSpent: metadata.timeSpent,
          currentStep: metadata.currentStep,
          completedAt: new Date().toISOString()
        },
        timestamp: Date.now()
      }, 75); // Very high points for completed valuations
    } catch (error) {
      console.error('Failed to track valuation completion', error);
    }
  }, [trackEvent]);

  // Auto-tracking DISABLED al montar el componente
  useEffect(() => {
    // TEMPORARILY DISABLED - Auto tracking was consuming too many Edge Functions
    console.debug('🚫 Auto-tracking disabled to reduce Edge Function consumption');
    
    // Track only initial page view in critical pages
    if (window.location.pathname.includes('/lp/calculadora') || 
        window.location.pathname.includes('/contacto')) {
      trackPageView();
    }
    
    // No time tracking setup to save resources
    return () => {
      // Cleanup if needed
    };
  }, [trackPageView]);

  return {
    trackEvent,
    trackPageView,
    trackTimeOnPage,
    trackCalculatorUsage,
    trackContactInterest,
    trackValuationCompleted,
    getVisitorId: getOrCreateVisitorId,
    getSessionId: getOrCreateSessionId
  };
};