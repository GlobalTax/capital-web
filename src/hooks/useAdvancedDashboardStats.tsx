
import { useState, useEffect, useCallback } from 'react';
import { startOfMonth } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import type { AdvancedDashboardStats, DateRange } from '@/types/dashboard';
import { 
  fetchRevenueMetrics, 
  fetchContentMetrics, 
  fetchSystemMetrics,
  fetchTopPerformingPosts,
  calculateAdvancedMetrics,
  generateSampleMetrics
} from '@/utils/analyticsCalculations';

export const useAdvancedDashboardStats = () => {
  const [stats, setStats] = useState<AdvancedDashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>({
    start: startOfMonth(new Date()),
    end: new Date()
  });

  const fetchAdvancedStats = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('Fetching advanced dashboard stats for date range:', dateRange);

      // Fetch parallel data
      const [revenueData, contentData, systemData, topPosts] = await Promise.all([
        fetchRevenueMetrics(dateRange),
        fetchContentMetrics(dateRange),
        fetchSystemMetrics(),
        fetchTopPerformingPosts()
      ]);

      console.log('Fetched data:', { revenueData, contentData, systemData, topPosts });

      // Calculate advanced metrics
      const calculatedStats = calculateAdvancedMetrics(revenueData, contentData, systemData);
      
      // Add top performing posts
      calculatedStats.topPerformingPosts = topPosts;

      // Get total leads from contact_leads table
      const { count: leadsCount } = await supabase
        .from('contact_leads')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', dateRange.start.toISOString())
        .lte('created_at', dateRange.end.toISOString());

      calculatedStats.totalLeads = leadsCount || 0;

      console.log('Final calculated stats:', calculatedStats);
      setStats(calculatedStats);
    } catch (err) {
      console.error('Error fetching advanced dashboard stats:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  }, [dateRange]);

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
    dateRange,
    updateDateRange,
    refetch,
    generateSampleData
  };
};
