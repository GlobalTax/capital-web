
import { useState, useEffect, useCallback } from 'react';
import { AnalyticsManager, AnalyticsConfig, CompanyData, AnalyticsEvent, initAnalytics, getAnalytics } from '@/utils/analytics/AnalyticsManager';
import { LeadIntelligence } from '@/utils/analytics/CompanyEnrichment';
import { Alert } from '@/utils/analytics/AlertingSystem';

export const useMarketingIntelligence = (config?: AnalyticsConfig) => {
  const [analytics, setAnalytics] = useState<AnalyticsManager | null>(null);
  const [companies, setCompanies] = useState<CompanyData[]>([]);
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [leadIntelligence, setLeadIntelligence] = useState<LeadIntelligence[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const defaultConfig: AnalyticsConfig = {
      ga4MeasurementId: 'G-XXXXXXXXXX', // Usuario deberá configurar
      clarityProjectId: 'XXXXXXXXXX', // Usuario deberá configurar
      leadfeederTrackingId: 'XXXXXXXXXX', // Usuario deberá configurar
      enableCompanyTracking: true,
      enableEnrichment: true, // Enable company enrichment
      enableAlerting: true, // Enable automated alerts
      ...config
    };

    const analyticsManager = initAnalytics(defaultConfig);
    setAnalytics(analyticsManager);
    setIsLoading(false);

    // Listen for alert events
    const handleAlerts = (event: CustomEvent) => {
      console.log('New marketing intelligence alerts received:', event.detail);
      updateData(); // Refresh all data when new alerts arrive
    };

    window.addEventListener('marketing-intelligence-alert', handleAlerts as EventListener);

    // DISABLED - Frequent updates consuming too many resources
    console.debug('🚫 Marketing intelligence auto-update disabled to reduce Edge Function consumption');
    
    // Manual refresh only on user action
    // const interval = setInterval(() => {
    //   updateData();
    // }, 30000);

    return () => {
      window.removeEventListener('marketing-intelligence-alert', handleAlerts as EventListener);
      // clearInterval(interval);
    };
  }, [config]);

  const updateData = useCallback(() => {
    const analyticsManager = getAnalytics();
    if (analyticsManager) {
      setCompanies(analyticsManager.getCompanies());
      setEvents(analyticsManager.getEvents());
      setLeadIntelligence(analyticsManager.getAllLeadIntelligence());
      setAlerts(analyticsManager.getAlerts());
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

  const getLeadIntelligenceByDomain = useCallback((domain: string): LeadIntelligence | undefined => {
    return analytics?.getLeadIntelligence(domain);
  }, [analytics]);

  const enrichCompanyData = useCallback(async (domain: string) => {
    return await analytics?.enrichCompanyData(domain);
  }, [analytics]);

  const markAlertAsRead = useCallback((alertId: string) => {
    analytics?.markAlertAsRead(alertId);
    updateData();
  }, [analytics, updateData]);

  const getUnreadAlertsCount = useCallback((): number => {
    return analytics?.getUnreadAlertsCount() || 0;
  }, [analytics]);

  const getAlertsByPriority = useCallback((priority: Alert['priority']) => {
    return analytics?.getAlerts({ priority }) || [];
  }, [analytics]);

  const getAlertsByType = useCallback((type: Alert['type']) => {
    return analytics?.getAlerts({ type }) || [];
  }, [analytics]);

  return {
    analytics,
    companies,
    events,
    leadIntelligence,
    alerts,
    summary,
    isLoading,
    trackEvent,
    trackPageView,
    getLeadScore,
    getTopCompanies,
    getLeadIntelligenceByDomain,
    enrichCompanyData,
    markAlertAsRead,
    getUnreadAlertsCount,
    getAlertsByPriority,
    getAlertsByType,
    refetch: updateData
  };
};
