import { useEffect, useCallback, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

  // Circuit breaker state - more aggressive for admin stability
  const [circuitState, setCircuitState] = useState<{
    isOpen: boolean;
    failureCount: number;
    lastFailureTime: number;
    isDisabled: boolean;
  }>({
    isOpen: false,
    failureCount: 0,
    lastFailureTime: 0,
    isDisabled: false
  });

  // Aggressive circuit breaker to reduce Edge Function consumption
  const MAX_FAILURES = 2; // Reduced for faster circuit opening
  const CIRCUIT_RESET_TIME = 600000; // 10 minutes
  const shouldAllowRequest = useCallback(() => {
    if (circuitState.isDisabled) {
      return false; // Tracking completely disabled
    }
    
    if (!circuitState.isOpen) {
      return true; // Circuit closed, allow requests
    }
    
    // Circuit is open, check if enough time has passed to try again
    const now = Date.now();
    const timeSinceLastFailure = now - circuitState.lastFailureTime;
    const backoffTime = 10 * 60 * 1000; // 10 minutes
    
    return timeSinceLastFailure > backoffTime;
  }, [circuitState]);

  const recordSuccess = useCallback(() => {
    setCircuitState(prev => ({
      ...prev,
      isOpen: false,
      failureCount: 0
    }));
  }, []);

  const recordFailure = useCallback(() => {
    setCircuitState(prev => {
      const newFailureCount = prev.failureCount + 1;
      const shouldDisable = newFailureCount >= 10; // Disable after 10 failures
      
      return {
        isOpen: newFailureCount >= 2, // Open circuit after 2 failures
        failureCount: newFailureCount,
        lastFailureTime: Date.now(),
        isDisabled: shouldDisable
      };
    });
  }, []);

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

  // Tracking de páginas visitadas
  const trackPageView = useCallback(async (pagePath?: string) => {
    if (!enablePageTracking) return;
    
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

  // Tracking específico para calculadora
  const trackCalculatorUsage = useCallback(async (action: string, data: any = {}) => {
    if (!enableCalculatorTracking) return;
    
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

  // Auto-tracking al montar el componente
  useEffect(() => {
    // Track page view automáticamente
    trackPageView();
    
    // Track time on page automáticamente
    let cleanup: (() => void) | undefined;
    
    const setupTimeTracking = async () => {
      cleanup = await trackTimeOnPage();
    };
    
    setupTimeTracking();
    
    return () => {
      if (cleanup) cleanup();
    };
  }, [trackPageView, trackTimeOnPage]);

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