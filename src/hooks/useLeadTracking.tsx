import { useState, useEffect, useCallback } from 'react';
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

  // Circuit breaker state for tracking failures
  const [circuitBreakerState, setCircuitBreakerState] = useState({
    failureCount: 0,
    lastFailureTime: 0,
    isOpen: false
  });

  // Check if storage is available (privacy protection)
  const isStorageAvailable = useCallback(() => {
    try {
      const test = 'test';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      console.warn('Storage not available, tracking disabled');
      return false;
    }
  }, []);

  // Circuit breaker logic
  const shouldAllowTracking = useCallback(() => {
    if (!isStorageAvailable()) {
      return false;
    }

    const now = Date.now();
    const { failureCount, lastFailureTime, isOpen } = circuitBreakerState;

    // If circuit is open, check if enough time has passed to try again
    if (isOpen) {
      const timeSinceLastFailure = now - lastFailureTime;
      const backoffTime = Math.min(300000, 5000 * Math.pow(2, failureCount)); // Max 5 minutes
      
      if (timeSinceLastFailure > backoffTime) {
        setCircuitBreakerState(prev => ({ ...prev, isOpen: false }));
        return true;
      }
      return false;
    }

    return true;
  }, [circuitBreakerState, isStorageAvailable]);

  // Handle tracking failures
  const handleTrackingFailure = useCallback(() => {
    setCircuitBreakerState(prev => {
      const newFailureCount = prev.failureCount + 1;
      const shouldOpenCircuit = newFailureCount >= 3; // Open after 3 failures

      return {
        failureCount: newFailureCount,
        lastFailureTime: Date.now(),
        isOpen: shouldOpenCircuit
      };
    });
  }, []);

  // Reset circuit breaker on success
  const handleTrackingSuccess = useCallback(() => {
    if (circuitBreakerState.failureCount > 0) {
      setCircuitBreakerState({
        failureCount: 0,
        lastFailureTime: 0,
        isOpen: false
      });
    }
  }, [circuitBreakerState.failureCount]);

  // Generar IDs únicos para sesión y visitante
  const getOrCreateVisitorId = useCallback(() => {
    if (!isStorageAvailable()) {
      // Fallback to session-based ID when storage is blocked
      return `temp_visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    try {
      let visitorId = localStorage.getItem('capittal_visitor_id');
      if (!visitorId) {
        visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('capittal_visitor_id', visitorId);
      }
      return visitorId;
    } catch (e) {
      return `temp_visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
  }, [isStorageAvailable]);

  const getOrCreateSessionId = useCallback(() => {
    if (!isStorageAvailable()) {
      return `temp_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    try {
      let sessionId = sessionStorage.getItem('capittal_session_id');
      if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        sessionStorage.setItem('capittal_session_id', sessionId);
      }
      return sessionId;
    } catch (e) {
      return `temp_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
  }, [isStorageAvailable]);

  // Detectar empresa desde email o dominio
  const detectCompanyDomain = useCallback(() => {
    if (!isStorageAvailable()) {
      return undefined;
    }

    try {
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
    } catch (e) {
      console.warn('Could not detect company domain:', e);
    }

    return undefined;
  }, [isStorageAvailable]);

  // Función principal de tracking con circuit breaker
  const trackEvent = useCallback(async (
    eventType: string,
    pagePath: string,
    eventData: Record<string, any> = {},
    pointsAwarded: number = 0
  ) => {
    // Check circuit breaker before attempting tracking
    if (!shouldAllowTracking()) {
      console.debug('🚫 Tracking disabled by circuit breaker or privacy settings');
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

      console.debug('🔄 Tracking event:', eventType, 'for visitor:', visitorId);
      
      // Use secure tracking edge function with timeout
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Tracking timeout')), 5000)
      );

      const trackingPromise = supabase.functions.invoke('secure-tracking', {
        body: { event: trackingEvent }
      });

      const { error } = await Promise.race([trackingPromise, timeoutPromise]) as any;
      
      if (error) {
        console.error('❌ Lead tracking failed:', error);
        handleTrackingFailure();
        return;
      }
      
      console.debug('✅ Event tracked successfully via secure endpoint:', eventType);
      handleTrackingSuccess();

    } catch (error) {
      console.error('❌ Lead tracking error:', error);
      handleTrackingFailure();
      // Fallar silenciosamente para no afectar UX
    }
  }, [getOrCreateVisitorId, getOrCreateSessionId, detectCompanyDomain, shouldAllowTracking, handleTrackingFailure, handleTrackingSuccess]);

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