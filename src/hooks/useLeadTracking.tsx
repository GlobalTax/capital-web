import { useEffect, useCallback } from 'react';
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

  // Función principal de tracking
  const trackEvent = useCallback(async (
    eventType: string,
    pagePath: string,
    eventData: Record<string, any> = {},
    pointsAwarded: number = 0
  ) => {
    try {
      const visitorId = getOrCreateVisitorId();
      const sessionId = getOrCreateSessionId();
      const companyDomain = detectCompanyDomain();

      // Obtener UTM parameters
      const urlParams = new URLSearchParams(window.location.search);
      const utmSource = urlParams.get('utm_source');
      const utmMedium = urlParams.get('utm_medium');
      const utmCampaign = urlParams.get('utm_campaign');

      await supabase.from('lead_behavior_events').insert({
        session_id: sessionId,
        visitor_id: visitorId,
        company_domain: companyDomain,
        event_type: eventType,
        page_path: pagePath,
        event_data: eventData,
        points_awarded: pointsAwarded,
        user_agent: navigator.userAgent,
        referrer: document.referrer,
        utm_source: utmSource,
        utm_medium: utmMedium,
        utm_campaign: utmCampaign
      });

    } catch (error) {
      console.debug('Lead tracking error:', error);
      // Fallar silenciosamente para no afectar UX
    }
  }, [getOrCreateVisitorId, getOrCreateSessionId, detectCompanyDomain]);

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
    getVisitorId: getOrCreateVisitorId,
    getSessionId: getOrCreateSessionId
  };
};