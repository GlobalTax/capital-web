
import { useState, useEffect, useCallback } from 'react';
import { AttributionEngine, TouchPoint, ConversionPath } from '@/utils/analytics/AttributionEngine';
import { getAnalytics } from '@/utils/analytics/AnalyticsManager';

export const useAttributionAnalytics = () => {
  const [attributionEngine] = useState(() => new AttributionEngine());
  const [attributionReport, setAttributionReport] = useState<any>(null);
  const [funnelAnalysis, setFunnelAnalysis] = useState<any>(null);
  const [customerJourney, setCustomerJourney] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const generateMockTouchPoints = useCallback(() => {
    const channels = ['Google Ads', 'SEO', 'Direct', 'LinkedIn', 'Email', 'Referral'];
    const pages = ['/', '/calculadora-valoracion', '/venta-empresas', '/contacto', '/servicios/valoraciones'];
    const companies = ['empresademo.com', 'techstartup.com', 'consultingfirm.es', 'retailcompany.com'];
    
    const touchPoints: TouchPoint[] = [];
    
    // Generate realistic customer journeys
    companies.forEach((domain, companyIndex) => {
      const journeyLength = Math.floor(Math.random() * 5) + 2; // 2-6 touchpoints
      const startDate = new Date(Date.now() - (Math.random() * 30 * 24 * 60 * 60 * 1000)); // Last 30 days
      
      for (let i = 0; i < journeyLength; i++) {
        const touchDate = new Date(startDate.getTime() + (i * Math.random() * 7 * 24 * 60 * 60 * 1000));
        const isLastTouch = i === journeyLength - 1;
        
        const touchPoint: TouchPoint = {
          id: `touch_${companyIndex}_${i}`,
          timestamp: touchDate,
          channel: channels[Math.floor(Math.random() * channels.length)],
          source: Math.random() > 0.5 ? 'google' : 'direct',
          medium: Math.random() > 0.5 ? 'cpc' : 'organic',
          page: pages[Math.floor(Math.random() * pages.length)],
          companyDomain: domain,
          sessionId: `session_${companyIndex}_${i}`,
          eventType: isLastTouch && Math.random() > 0.3 ? 'form_submission' : 'page_view',
          value: isLastTouch ? 1500 : undefined
        };
        
        // Add calculator usage for some journeys
        if (touchPoint.page.includes('calculadora') && Math.random() > 0.5) {
          touchPoints.push({
            ...touchPoint,
            id: `calc_${companyIndex}_${i}`,
            eventType: 'calculator_use',
            value: Math.random() > 0.7 ? 2000 : undefined // Some become conversions
          });
        }
        
        touchPoints.push(touchPoint);
      }
    });

    return touchPoints;
  }, []);

  const refreshAnalytics = useCallback(() => {
    setIsLoading(true);
    
    // Add mock touchpoints for demonstration
    const mockTouchPoints = generateMockTouchPoints();
    mockTouchPoints.forEach(tp => attributionEngine.addTouchPoint(tp));
    
    // Generate reports
    const report = attributionEngine.getAttributionReport('linear');
    const funnel = attributionEngine.getFunnelAnalysis();
    const journey = attributionEngine.getCustomerJourneyMap();
    
    setAttributionReport(report);
    setFunnelAnalysis(funnel);
    setCustomerJourney(journey);
    setIsLoading(false);
    
    console.log('Attribution Analytics refreshed:', { report, funnel, journey });
  }, [attributionEngine, generateMockTouchPoints]);

  const trackTouchPoint = useCallback((touchPoint: Partial<TouchPoint>) => {
    const fullTouchPoint: TouchPoint = {
      id: `touch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      channel: 'Direct',
      source: 'direct',
      medium: 'none',
      page: window.location.pathname,
      companyDomain: 'unknown.com',
      sessionId: `session_${Date.now()}`,
      eventType: 'page_view',
      ...touchPoint
    };
    
    attributionEngine.addTouchPoint(fullTouchPoint);
    
    // Refresh analytics after new touchpoint
    setTimeout(() => {
      const report = attributionEngine.getAttributionReport('linear');
      const funnel = attributionEngine.getFunnelAnalysis();
      setAttributionReport(report);
      setFunnelAnalysis(funnel);
    }, 100);
  }, [attributionEngine]);

  const getMultiTouchAttribution = useCallback((modelType: 'first_touch' | 'last_touch' | 'linear' | 'time_decay' | 'position_based' = 'linear') => {
    return attributionEngine.getAttributionReport(modelType);
  }, [attributionEngine]);

  const getConversionPaths = useCallback(() => {
    return attributionEngine.getAllConversionPaths();
  }, [attributionEngine]);

  useEffect(() => {
    // Initial load
    refreshAnalytics();
    
    // DISABLED - Periodic refresh consuming too many Edge Functions
    console.debug('🚫 Attribution analytics auto-refresh disabled');
    
    // Manual refresh only on user action
    // const interval = setInterval(refreshAnalytics, 5 * 60 * 1000);
    // return () => clearInterval(interval);
  }, [refreshAnalytics]);

  return {
    attributionReport,
    funnelAnalysis,
    customerJourney,
    isLoading,
    trackTouchPoint,
    getMultiTouchAttribution,
    getConversionPaths,
    refreshAnalytics
  };
};
