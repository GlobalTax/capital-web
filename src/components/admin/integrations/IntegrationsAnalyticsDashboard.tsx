
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AnalyticsHeader from './analytics/AnalyticsHeader';
import AnalyticsMetricsCards from './analytics/AnalyticsMetricsCards';
import AnalyticsChartsTabs from './analytics/AnalyticsChartsTabs';
import AnalyticsLoadingState from './analytics/AnalyticsLoadingState';
import {
  processEnrichmentTrends,
  processPerformanceMetrics,
  processSourceDistribution,
  processSuccessRates,
  processResponseTimes,
  processCompanyGrowth
} from './analytics/analyticsDataProcessors';

interface AnalyticsData {
  enrichmentTrends: any[];
  performanceMetrics: any[];
  sourceDistribution: any[];
  successRates: any[];
  responseTimesTrend: any[];
  companyGrowth: any[];
}

const IntegrationsAnalyticsDashboard = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  const fetchAnalyticsData = async () => {
    setIsLoading(true);
    try {
      // Calcular rango de fechas
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Obtener logs de integración para análisis
      const { data: logs } = await supabase
        .from('integration_logs')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      // Obtener empresas Apollo
      const { data: companies } = await supabase
        .from('apollo_companies')
        .select('*')
        .gte('created_at', startDate.toISOString());

      // Obtener contactos Apollo
      const { data: contacts } = await supabase
        .from('apollo_contacts')
        .select('*')
        .gte('created_at', startDate.toISOString());

      // Procesar datos para gráficos
      const enrichmentTrends = processEnrichmentTrends(logs || []);
      const performanceMetrics = processPerformanceMetrics(logs || []);
      const sourceDistribution = processSourceDistribution(companies || []);
      const successRates = processSuccessRates(logs || []);
      const responseTimesTrend = processResponseTimes(logs || []);
      const companyGrowth = processCompanyGrowth(companies || []);

      setAnalyticsData({
        enrichmentTrends,
        performanceMetrics,
        sourceDistribution,
        successRates,
        responseTimesTrend,
        companyGrowth
      });

    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  if (isLoading) {
    return <AnalyticsLoadingState />;
  }

  return (
    <div className="space-y-6">
      <AnalyticsHeader 
        timeRange={timeRange} 
        onTimeRangeChange={setTimeRange} 
      />

      <AnalyticsMetricsCards 
        analyticsData={analyticsData} 
        timeRange={timeRange} 
      />

      <AnalyticsChartsTabs analyticsData={analyticsData} />
    </div>
  );
};

export default IntegrationsAnalyticsDashboard;
