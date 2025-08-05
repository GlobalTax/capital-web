
import { useCallback, useMemo } from 'react';
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
import { useOptimizedQuery, useSmartInvalidation, QUERY_CONFIGS } from '@/shared/services/optimized-queries.service';
import { QUERY_KEYS } from '@/shared/constants/query-keys';

export const useAdvancedDashboardStats = (filters?: DashboardFilters) => {
  const { invalidateRelatedQueries } = useSmartInvalidation();
  
  // Memoized date range
  const dateRange = useMemo(() => ({
    start: startOfMonth(new Date()),
    end: new Date()
  }), []);

  // Usar filtros si se proporcionan, sino usar dateRange interno
  const effectiveDateRange = filters?.dateRange || dateRange;

  // Memoized query key para React Query  
  const queryKey = useMemo(() => [
    QUERY_KEYS.ADVANCED_DASHBOARD_STATS,
    effectiveDateRange.start.toISOString(),
    effectiveDateRange.end.toISOString(),
    filters?.sectors?.join(',') || 'all',
    filters?.searchQuery || 'all'
  ], [effectiveDateRange, filters?.sectors, filters?.searchQuery]);

  // React Query optimizado para el fetch principal
  const { data: statsData, isLoading, error } = useOptimizedQuery<{
    stats: AdvancedDashboardStats;
    historicalRevenueData: unknown[];
    historicalContentData: unknown[];
  }>(
    queryKey,
    async () => {
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
      
      return {
        stats: calculatedStats,
        historicalRevenueData: historicalRevenue,
        historicalContentData: historicalContent
      };
    },
    'important' // Datos importantes que cambian moderadamente
  );

  const generateSampleData = useCallback(async () => {
    try {
      await generateSampleMetrics();
      invalidateRelatedQueries('dashboard');
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error generando datos de ejemplo');
      logger.error('Failed to generate sample data', error, { context: 'system', component: 'useAdvancedDashboardStats' });
      throw error;
    }
  }, [invalidateRelatedQueries]);

  return {
    stats: statsData?.stats || null,
    isLoading,
    error: error?.message || null,
    dateRange: effectiveDateRange,
    historicalRevenueData: statsData?.historicalRevenueData || [],
    historicalContentData: statsData?.historicalContentData || [],
    updateDateRange: () => {}, // No longer needed with React Query
    refetch: () => invalidateRelatedQueries('dashboard'),
    generateSampleData
  };
};
