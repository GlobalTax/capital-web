import { useCallback } from 'react';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export const useHubVentaTracking = () => {
  const trackEvent = useCallback((eventName: string, params?: Record<string, unknown>) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventName, params);
    }
    // Also push to dataLayer for GTM
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({
        event: eventName,
        ...params,
      });
    }
  }, []);

  const trackPageView = useCallback(() => {
    trackEvent('page_view_venta_empresa');
  }, [trackEvent]);

  const trackFormStart = useCallback(() => {
    trackEvent('form_start_venta_empresa');
  }, [trackEvent]);

  const trackFormSubmit = useCallback((formData?: Record<string, unknown>) => {
    trackEvent('form_submit_venta_empresa', formData);
  }, [trackEvent]);

  const trackCTAClick = useCallback((ctaType: string) => {
    trackEvent('cta_click_venta_empresa', { cta_type: ctaType });
  }, [trackEvent]);

  const trackFAQExpand = useCallback((question: string) => {
    trackEvent('faq_expand_venta_empresa', { question });
  }, [trackEvent]);

  const trackPhoneClick = useCallback(() => {
    trackEvent('phone_click_venta_empresa');
  }, [trackEvent]);

  return {
    trackEvent,
    trackPageView,
    trackFormStart,
    trackFormSubmit,
    trackCTAClick,
    trackFAQExpand,
    trackPhoneClick,
  };
};
