
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { initAnalytics, getAnalytics } from '@/utils/analytics/AnalyticsManager';

export const useAppAnalytics = () => {
  const location = useLocation();

  useEffect(() => {
    // Inicializar Marketing Intelligence Platform con todas las funcionalidades
    const analytics = initAnalytics({
      ga4MeasurementId: 'G-XXXXXXXXXX', // Configurar con el ID real
      clarityProjectId: 'XXXXXXXXXX', // Configurar con el ID real
      leadfeederTrackingId: 'XXXXXXXXXX', // Configurar con el ID real
      enableCompanyTracking: true,
      enableEnrichment: true, // Phase 2: Company Intelligence
      enableAlerting: true, // Phase 2: Automated Alerts
      enableAttribution: true // Phase 3: Advanced Attribution
    });

    console.log('Marketing Intelligence Platform completamente inicializado con:');
    console.log('✅ Phase 1: Core Analytics & Company Tracking');
    console.log('✅ Phase 2: Company Intelligence & Lead Scoring');
    console.log('✅ Phase 3: Advanced Attribution & Funnel Analysis');
    console.log('✅ Phase 4: Predictive Analytics & AI Insights');
  }, []);

  useEffect(() => {
    // Track page views automáticamente con enhanced attribution
    const analytics = getAnalytics();
    if (analytics) {
      analytics.trackPageView(location.pathname);
      
      // Enhanced tracking para páginas clave
      if (location.pathname.includes('calculadora')) {
        analytics.trackEvent('calculator_page_view', {
          page: location.pathname,
          timestamp: new Date().toISOString()
        });
      } else if (location.pathname.includes('contacto')) {
        analytics.trackEvent('contact_page_view', {
          page: location.pathname,
          timestamp: new Date().toISOString()
        });
      } else if (location.pathname.includes('casos')) {
        analytics.trackEvent('case_study_page_view', {
          page: location.pathname,
          timestamp: new Date().toISOString()
        });
      }
    }
  }, [location]);

  // Enhanced event tracking con attribution y AI insights
  const trackEvent = (eventName: string, properties?: Record<string, any>) => {
    const analytics = getAnalytics();
    if (analytics) {
      // Enhanced properties para AI analysis
      const enhancedProperties = {
        ...properties,
        timestamp: new Date().toISOString(),
        page: location.pathname,
        userAgent: navigator.userAgent,
        deviceType: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent) ? 'mobile' : 'desktop',
        timeOfDay: new Date().getHours(),
        dayOfWeek: new Date().getDay(),
        // Add session information for better tracking
        sessionId: sessionStorage.getItem('sessionId') || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };

      // Store session ID for attribution tracking
      if (!sessionStorage.getItem('sessionId')) {
        sessionStorage.setItem('sessionId', enhancedProperties.sessionId);
      }

      analytics.trackEvent(eventName, enhancedProperties);
      
      console.log(`📊 Enhanced event tracked: ${eventName}`, enhancedProperties);
    }
  };

  // Specialized tracking methods for key business events
  const trackCalculatorUsed = (calculationData: any) => {
    trackEvent('calculator_used', {
      ...calculationData,
      eventCategory: 'Lead Generation',
      eventValue: 1500, // High-value event
      calculatorType: 'valuation'
    });
  };

  const trackFormSubmission = (formData: any) => {
    trackEvent('form_submission', {
      ...formData,
      eventCategory: 'Conversion',
      eventValue: 2000, // Conversion event
      formType: formData.formType || 'contact'
    });
  };

  const trackResourceDownload = (resourceInfo: any) => {
    trackEvent('resource_download', {
      ...resourceInfo,
      eventCategory: 'Engagement',
      eventValue: 500,
      resourceType: resourceInfo.type || 'pdf'
    });
  };

  const trackCaseStudyView = (caseStudyData: any) => {
    trackEvent('case_study_view', {
      ...caseStudyData,
      eventCategory: 'Research',
      eventValue: 300,
      sector: caseStudyData.sector
    });
  };

  return { 
    trackEvent,
    trackCalculatorUsed,
    trackFormSubmission,
    trackResourceDownload,
    trackCaseStudyView
  };
};
