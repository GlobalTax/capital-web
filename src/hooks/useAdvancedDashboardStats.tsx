
import { useState, useEffect, useCallback } from 'react';
import { startOfMonth } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import type { AdvancedDashboardStats, DateRange } from '@/types/dashboard';
import type { DashboardFilters } from '@/types/filters';
import type { RevenueDataPoint, ContentDataPoint } from '@/types/dashboardTypes';
import { logger } from '@/utils/logger';
import { DatabaseError, NetworkError } from '@/types/errorTypes';
import { 
  fetchRevenueMetrics, 
  fetchContentMetrics, 
  fetchSystemMetrics,
  fetchTopPerformingPosts,
  fetchHistoricalRevenueMetrics,
  fetchHistoricalContentMetrics,
  calculateAdvancedMetrics,
  generateSampleMetrics
} from '@/utils/analytics';

export const useAdvancedDashboardStats = (filters?: DashboardFilters) => {
  const [stats, setStats] = useState<AdvancedDashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>({
    start: startOfMonth(new Date()),
    end: new Date()
  });

  // Usar filtros si se proporcionan, sino usar dateRange interno
  const effectiveDateRange = filters?.dateRange || dateRange;

  // Datos adicionales para gráficos
  const [historicalRevenueData, setHistoricalRevenueData] = useState<unknown[]>([]);
  const [historicalContentData, setHistoricalContentData] = useState<unknown[]>([]);

  const fetchAdvancedStats = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      logger.debug('Starting dashboard stats fetch', {
        dateRange: effectiveDateRange,
        sectors: filters?.sectors,
        searchQuery: filters?.searchQuery
      }, { context: 'system', component: 'useAdvancedDashboardStats' });

      // Fetch parallel data con filtros aplicados
      const [
        revenueData, 
        contentData, 
        systemData, 
        topPosts,
        historicalRevenue,
        historicalContent
      ] = await Promise.all([
        fetchRevenueMetrics(effectiveDateRange, filters?.sectors),
        fetchContentMetrics(effectiveDateRange, filters?.searchQuery),
        fetchSystemMetrics(),
        fetchTopPerformingPosts(filters?.searchQuery),
        fetchHistoricalRevenueMetrics(filters?.sectors),
        fetchHistoricalContentMetrics(filters?.searchQuery)
      ]);

      logger.debug('Dashboard data fetched successfully', { 
        revenueCount: revenueData.length,
        contentCount: contentData.length,
        systemMetrics: Object.keys(systemData).length,
        topPostsCount: topPosts.length
      }, { context: 'system', component: 'useAdvancedDashboardStats' });

      // Set historical data for charts
      setHistoricalRevenueData(historicalRevenue);
      setHistoricalContentData(historicalContent);

      // Calculate advanced metrics
      const calculatedStats = calculateAdvancedMetrics(revenueData, contentData, systemData);
      
      // Add top performing posts
      calculatedStats.topPerformingPosts = topPosts;

      // Get total leads from contact_leads table con filtros
      let leadsQuery = supabase
        .from('contact_leads')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', effectiveDateRange.start.toISOString())
        .lte('created_at', effectiveDateRange.end.toISOString());

      // Aplicar filtro de búsqueda a leads si existe
      if (filters?.searchQuery) {
        leadsQuery = leadsQuery.or(`full_name.ilike.%${filters.searchQuery}%,company.ilike.%${filters.searchQuery}%`);
      }

      const { count: leadsCount } = await leadsQuery;
      calculatedStats.totalLeads = leadsCount || 0;

      logger.info('Dashboard stats calculated successfully', {
        totalLeads: calculatedStats.totalLeads,
        metricsCount: Object.keys(calculatedStats).length
      }, { context: 'system', component: 'useAdvancedDashboardStats' });
      setStats(calculatedStats);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error desconocido');
      if (error.message.includes('network') || error.message.includes('fetch')) {
        const networkError = new NetworkError('Failed to fetch dashboard data', undefined, { filters });
        logger.error('Network error in dashboard fetch', networkError, { context: 'system', component: 'useAdvancedDashboardStats' });
      } else if (error.message.includes('database') || error.message.includes('supabase')) {
        const dbError = new DatabaseError('Database error in dashboard fetch', 'SELECT', { filters });
        logger.error('Database error in dashboard fetch', dbError, { context: 'system', component: 'useAdvancedDashboardStats' });
      } else {
        logger.error('Unknown error in dashboard fetch', error, { context: 'system', component: 'useAdvancedDashboardStats' });
      }
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [effectiveDateRange, filters]);

  const generateSampleData = useCallback(async () => {
    try {
      await generateSampleMetrics();
      await fetchAdvancedStats();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error generando datos de ejemplo');
      logger.error('Failed to generate sample data', error, { context: 'system', component: 'useAdvancedDashboardStats' });
      setError('Error generando datos de ejemplo');
    }
  }, [fetchAdvancedStats]);

  const updateDateRange = useCallback((newDateRange: DateRange) => {
    setDateRange(newDateRange);
  }, []);

  const refetch = useCallback(() => {
    fetchAdvancedStats();
  }, [fetchAdvancedStats]);

  useEffect(() => {
    fetchAdvancedStats();
  }, [fetchAdvancedStats]);

  return {
    stats,
    isLoading,
    error,
    dateRange: effectiveDateRange,
    historicalRevenueData,
    historicalContentData,
    updateDateRange,
    refetch,
    generateSampleData
  };
};
