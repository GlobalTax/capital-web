
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { initAnalytics, getAnalytics } from '@/utils/analytics/AnalyticsManager';

export const useAppAnalytics = () => {
  const location = useLocation();

  useEffect(() => {
    // Inicializar analytics cuando la app carga
    const analytics = initAnalytics({
      ga4MeasurementId: 'G-XXXXXXXXXX', // Configurar con el ID real
      clarityProjectId: 'XXXXXXXXXX', // Configurar con el ID real
      leadfeederTrackingId: 'XXXXXXXXXX', // Configurar con el ID real
      enableCompanyTracking: true
    });

    console.log('Marketing Intelligence Platform initialized');
  }, []);

  useEffect(() => {
    // Track page views automáticamente en cada cambio de ruta
    const analytics = getAnalytics();
    if (analytics) {
      analytics.trackPageView(location.pathname);
    }
  }, [location]);

  // Función helper para trackear eventos desde cualquier componente
  const trackEvent = (eventName: string, properties?: Record<string, any>) => {
    const analytics = getAnalytics();
    analytics?.trackEvent(eventName, properties);
  };

  return { trackEvent };
};
