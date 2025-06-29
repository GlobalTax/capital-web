
import { useState, useEffect, useCallback } from 'react';
import { startOfMonth } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import type { AdvancedDashboardStats, DateRange } from '@/types/dashboard';
import type { DashboardFilters } from '@/types/filters';
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
  const [historicalRevenueData, setHistoricalRevenueData] = useState<any[]>([]);
  const [historicalContentData, setHistoricalContentData] = useState<any[]>([]);

  const fetchAdvancedStats = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('Fetching advanced dashboard stats with filters:', {
        dateRange: effectiveDateRange,
        sectors: filters?.sectors,
        searchQuery: filters?.searchQuery
      });

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

      console.log('Fetched data with filters:', { 
        revenueData, 
        contentData, 
        systemData, 
        topPosts,
        historicalRevenue,
        historicalContent
      });

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

      console.log('Final calculated stats with filters:', calculatedStats);
      setStats(calculatedStats);
    } catch (err) {
      console.error('Error fetching advanced dashboard stats:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  }, [effectiveDateRange, filters]);

  const generateSampleData = useCallback(async () => {
    try {
      await generateSampleMetrics();
      await fetchAdvancedStats();
    } catch (err) {
      console.error('Error generating sample data:', err);
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
