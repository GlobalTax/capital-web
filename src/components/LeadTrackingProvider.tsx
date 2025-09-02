import React, { useEffect } from 'react';
import { useLeadTracking } from '@/hooks/useLeadTracking';
import { useLocation } from 'react-router-dom';
import { logger } from '@/utils/logger';

interface LeadTrackingProviderProps {
  children: React.ReactNode;
  enabled?: boolean;
}

export const LeadTrackingProvider: React.FC<LeadTrackingProviderProps> = ({ 
  children, 
  enabled = true 
}) => {
  const location = useLocation();
  
  // Completely disable tracking in admin routes, development, and iframe contexts
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isInIframe = typeof window !== 'undefined' && window.top !== window.self;
  const trackingEnabled = enabled && !isAdminRoute && import.meta.env.PROD && !isInIframe;
  
  const { trackPageView, trackCalculatorUsage, trackContactInterest } = useLeadTracking({
    enablePageTracking: trackingEnabled,
    enableTimeTracking: trackingEnabled,
    enableCalculatorTracking: trackingEnabled,
    enableContactTracking: trackingEnabled
  });

  // Track route changes (skip admin routes)
  useEffect(() => {
    if (!trackingEnabled) return;
    
    logger.debug('Route changed', { 
      pathname: location.pathname,
      search: location.search 
    }, { context: 'marketing', component: 'LeadTrackingProvider' });
    
    // Track page view with debounce
    const timeoutId = setTimeout(() => {
      trackPageView(location.pathname);
    }, 300); // Increased debounce for stability
    
    return () => clearTimeout(timeoutId);
  }, [location, trackPageView, trackingEnabled]);

  // Track specific high-value pages
  useEffect(() => {
    if (!trackingEnabled) return;
    
    if (location.pathname.includes('/lp/calculadora')) {
      trackCalculatorUsage('page_visit');
    }
    
    if (location.pathname.includes('/contacto')) {
      trackContactInterest('page_visit');
    }
    
    if (location.pathname.includes('/venta-empresas') || 
        location.pathname.includes('/servicios/valoraciones') ||
        location.pathname.includes('/servicios/due-diligence')) {
      logger.info('High-intent page visited', { pathname: location.pathname }, { context: 'marketing', component: 'LeadTrackingProvider' });
      trackPageView(location.pathname + '_high_intent');
    }
  }, [location.pathname, trackingEnabled, trackPageView, trackCalculatorUsage, trackContactInterest]);

  // Expose tracking functions globally for manual tracking (only if enabled)
  useEffect(() => {
    if (!trackingEnabled) return;
    
    // Make tracking available globally for forms and interactions
    (window as any).capittalTracking = {
      trackCalculatorUsage,
      trackContactInterest,
      trackPageView
    };
    
    return () => {
      delete (window as any).capittalTracking;
    };
  }, [trackingEnabled, trackCalculatorUsage, trackContactInterest, trackPageView]);

  return <>{children}</>;
};