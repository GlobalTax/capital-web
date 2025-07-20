
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
  const { trackPageView, trackCalculatorUsage, trackContactInterest } = useLeadTracking({
    enablePageTracking: enabled,
    enableTimeTracking: enabled,
    enableCalculatorTracking: enabled,
    enableContactTracking: enabled
  });

  // Track route changes
  useEffect(() => {
    if (!enabled) return;
    
    logger.debug('Route change tracked', { pathname: location.pathname }, { context: 'marketing', component: 'LeadTrackingProvider' });
    
    // Track page view on route change
    trackPageView(location.pathname);
    
    // Track specific high-value pages
    if (location.pathname.includes('/calculadora-valoracion')) {
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
    
  }, [location.pathname, enabled, trackPageView, trackCalculatorUsage, trackContactInterest]);

  // Expose tracking functions globally for manual tracking
  useEffect(() => {
    if (!enabled) return;
    
    // Make tracking available globally for forms and interactions
    (window as any).capittalTracking = {
      trackCalculatorUsage,
      trackContactInterest,
      trackPageView
    };
    
    return () => {
      delete (window as any).capittalTracking;
    };
  }, [enabled, trackCalculatorUsage, trackContactInterest, trackPageView]);

  return <>{children}</>;
};
