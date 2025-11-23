import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { QUERY_KEYS } from '@/shared/constants/query-keys';

export interface ValuationAnalyticsData {
  kpis: {
    totalSessions: number;
    conversionRate: number;
    recoveredSessions: number;
    avgTimePerSession: number;
  };
  funnel: Array<{
    step: number;
    stepName: string;
    count: number;
    percentage: number;
    dropoff: number;
  }>;
  recovery: {
    modalsShown: number;
    accepted: number;
    rejected: number;
    acceptanceRate: number;
  };
  fieldInteractions: Array<{
    fieldName: string;
    touches: number;
    avgTimeSpent: number;
    abandonRate: number;
  }>;
}

export const useValuationAnalytics = (dateRange: { start: Date; end: Date } = {
  start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
  end: new Date()
}) => {
  // Stable query key using primitive values (strings) instead of Date objects
  const startKey = dateRange.start.toISOString().slice(0, 10); // 'YYYY-MM-DD'
  const endKey = dateRange.end.toISOString().slice(0, 10);

  return useQuery({
    queryKey: [QUERY_KEYS.ADVANCED_DASHBOARD_STATS, 'valuation-analytics', startKey, endKey],
    queryFn: async (): Promise<ValuationAnalyticsData> => {
      console.log('[ValuationAnalytics] Fetching analytics data...', {
        start: dateRange.start.toISOString(),
        end: dateRange.end.toISOString()
      });

      // Call RPC function with SECURITY DEFINER
      const { data, error } = await supabase.rpc('get_valuation_analytics', {
        p_start_date: dateRange.start.toISOString(),
        p_end_date: dateRange.end.toISOString()
      });

      if (error) {
        console.error('[ValuationAnalytics] RPC error:', error);
        throw error;
      }
      
      if (!data) {
        console.error('[ValuationAnalytics] No data returned from analytics');
        throw new Error('No data returned from analytics');
      }

      // Parse the JSON response - data is already parsed by Supabase
      const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
      console.log('[ValuationAnalytics] Data fetched successfully');
      return parsedData as unknown as ValuationAnalyticsData;
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: false, // Disabled while debugging
    retry: (failureCount, error) => {
      // Don't retry on 400/Unauthorized errors
      if (error?.message?.includes('Unauthorized') || error?.message?.includes('permission')) {
        console.warn('[ValuationAnalytics] Permission error detected, not retrying');
        return false;
      }
      return failureCount < 2;
    },
  });
};
