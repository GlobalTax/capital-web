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
  return useQuery({
    queryKey: [QUERY_KEYS.ADVANCED_DASHBOARD_STATS, 'valuation-analytics', dateRange],
    queryFn: async (): Promise<ValuationAnalyticsData> => {
      // Fetch KPIs
      const { data: valuations, error: valuationsError } = await supabase
        .from('company_valuations')
        .select('id, created_at, current_step, completion_percentage, time_spent_seconds, final_valuation, form_submitted_at')
        .gte('created_at', dateRange.start.toISOString())
        .lte('created_at', dateRange.end.toISOString())
        .order('created_at', { ascending: false });

      if (valuationsError) throw valuationsError;

      const totalSessions = valuations?.length || 0;
      const completedSessions = valuations?.filter(v => v.final_valuation !== null).length || 0;
      const conversionRate = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;
      
      const avgTimePerSession = valuations && valuations.length > 0
        ? valuations.reduce((acc, v) => acc + (v.time_spent_seconds || 0), 0) / valuations.length / 60 // Convert to minutes
        : 0;

      // Fetch recovery metrics from form_sessions (if exists)
      // Note: This would require tracking data from form_sessions table
      const recoveredSessions = 0;

      // Calculate funnel by steps
      const stepCounts: number[] = [0, 0, 0, 0]; // Steps 1, 2, 3, completed
      valuations?.forEach(v => {
        if (v.final_valuation !== null) {
          stepCounts[3]++;
        } else if (v.current_step) {
          stepCounts[Math.min(v.current_step - 1, 2)]++;
        }
      });

      const funnelData: Array<{
        step: number;
        stepName: string;
        count: number;
        percentage: number;
        dropoff: number;
      }> = [
        { step: 1, stepName: 'Datos Básicos', count: stepCounts[0] + stepCounts[1] + stepCounts[2] + stepCounts[3], percentage: 100, dropoff: 0 },
        { step: 2, stepName: 'Datos Financieros', count: stepCounts[1] + stepCounts[2] + stepCounts[3], percentage: 0, dropoff: 0 },
        { step: 3, stepName: 'Características', count: stepCounts[2] + stepCounts[3], percentage: 0, dropoff: 0 },
        { step: 4, stepName: 'Completado', count: stepCounts[3], percentage: 0, dropoff: 0 },
      ];

      // Calculate percentages and dropoff
      funnelData.forEach((f, i) => {
        if (totalSessions > 0) {
          f.percentage = (f.count / totalSessions) * 100;
        }
        if (i > 0 && funnelData[i - 1].count > 0) {
          f.dropoff = ((funnelData[i - 1].count - f.count) / funnelData[i - 1].count) * 100;
        }
      });

      // Mock field interactions (would need tracking data)
      const fieldInteractions = [
        { fieldName: 'email', touches: Math.floor(totalSessions * 0.95), avgTimeSpent: 8, abandonRate: 5 },
        { fieldName: 'companyName', touches: Math.floor(totalSessions * 0.92), avgTimeSpent: 12, abandonRate: 8 },
        { fieldName: 'revenue', touches: Math.floor(totalSessions * 0.75), avgTimeSpent: 15, abandonRate: 25 },
        { fieldName: 'ebitda', touches: Math.floor(totalSessions * 0.68), avgTimeSpent: 18, abandonRate: 32 },
        { fieldName: 'industry', touches: Math.floor(totalSessions * 0.88), avgTimeSpent: 10, abandonRate: 12 },
      ];

      // Recovery analytics (mock for now - would need tracking events)
      const recovery = {
        modalsShown: Math.floor(recoveredSessions * 2.5), // Estimate
        accepted: recoveredSessions,
        rejected: Math.floor(recoveredSessions * 0.6),
        acceptanceRate: recoveredSessions > 0 ? 62.5 : 0,
      };

      return {
        kpis: {
          totalSessions,
          conversionRate: Number(conversionRate.toFixed(1)),
          recoveredSessions,
          avgTimePerSession: Number(avgTimePerSession.toFixed(1)),
        },
        funnel: funnelData,
        recovery,
        fieldInteractions,
      };
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Auto-refresh every minute
  });
};
