
import { useState, useEffect, useCallback } from 'react';
import { AnalyticsManager, AnalyticsConfig, CompanyData, AnalyticsEvent, initAnalytics, getAnalytics } from '@/utils/analytics/AnalyticsManager';

export const useMarketingIntelligence = (config?: AnalyticsConfig) => {
  const [analytics, setAnalytics] = useState<AnalyticsManager | null>(null);
  const [companies, setCompanies] = useState<CompanyData[]>([]);
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const defaultConfig: AnalyticsConfig = {
      ga4MeasurementId: 'G-XXXXXXXXXX', // Usuario deberá configurar
      clarityProjectId: 'XXXXXXXXXX', // Usuario deberá configurar
      leadfeederTrackingId: 'XXXXXXXXXX', // Usuario deberá configurar
      enableCompanyTracking: true,
      ...config
    };

    const analyticsManager = initAnalytics(defaultConfig);
    setAnalytics(analyticsManager);
    setIsLoading(false);

    // Actualizar datos cada 30 segundos
    const interval = setInterval(() => {
      updateData();
    }, 30000);

    return () => clearInterval(interval);
  }, [config]);

  const updateData = useCallback(() => {
    const analyticsManager = getAnalytics();
    if (analyticsManager) {
      setCompanies(analyticsManager.getCompanies());
      setEvents(analyticsManager.getEvents());
      setSummary(analyticsManager.getAnalyticsSummary());
    }
  }, []);

  useEffect(() => {
    if (analytics) {
      updateData();
    }
  }, [analytics, updateData]);

  const trackEvent = useCallback((eventName: string, properties?: Record<string, any>) => {
    analytics?.trackEvent(eventName, properties);
    // Actualizar datos inmediatamente después de trackear
    setTimeout(updateData, 100);
  }, [analytics, updateData]);

  const trackPageView = useCallback((path?: string) => {
    analytics?.trackPageView(path);
    setTimeout(updateData, 100);
  }, [analytics, updateData]);

  const getLeadScore = useCallback((companyDomain: string): number => {
    return analytics?.calculateLeadScore(companyDomain) || 0;
  }, [analytics]);

  const getTopCompanies = useCallback((limit: number = 10): CompanyData[] => {
    return analytics?.getTopCompanies(limit) || [];
  }, [analytics]);

  return {
    analytics,
    companies,
    events,
    summary,
    isLoading,
    trackEvent,
    trackPageView,
    getLeadScore,
    getTopCompanies,
    refetch: updateData
  };
};
