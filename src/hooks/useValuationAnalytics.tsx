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

      // Fetch recovery metrics from tracking_events
      const { data: recoveryEvents } = await supabase
        .from('tracking_events')
        .select('event_type, session_id')
        .in('event_type', ['recovery_modal_shown', 'recovery_accepted', 'recovery_rejected'])
        .gte('created_at', dateRange.start.toISOString())
        .lte('created_at', dateRange.end.toISOString());

      const recoveryModalShown = recoveryEvents?.filter(e => e.event_type === 'recovery_modal_shown').length || 0;
      const recoveryAccepted = recoveryEvents?.filter(e => e.event_type === 'recovery_accepted').length || 0;
      const recoveryRejected = recoveryEvents?.filter(e => e.event_type === 'recovery_rejected').length || 0;
      const recoveredSessions = recoveryAccepted;

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

      // Fetch field interactions from tracking_events
      const { data: fieldEvents } = await supabase
        .from('tracking_events')
        .select('event_type, event_data, session_id, created_at')
        .in('event_type', ['field_focus', 'field_blur', 'field_change'])
        .gte('created_at', dateRange.start.toISOString())
        .lte('created_at', dateRange.end.toISOString());

      // Group field events by field name
      const fieldStatsMap = new Map<string, { touches: number; totalTime: number; abandons: number; focusEvents: Map<string, Date> }>();
      
      fieldEvents?.forEach(event => {
        const eventData = event.event_data as Record<string, any> | null;
        const fieldName = eventData?.field_name;
        if (!fieldName) return;

        if (!fieldStatsMap.has(fieldName)) {
          fieldStatsMap.set(fieldName, { touches: 0, totalTime: 0, abandons: 0, focusEvents: new Map() });
        }

        const stats = fieldStatsMap.get(fieldName)!;

        if (event.event_type === 'field_focus') {
          stats.touches++;
          stats.focusEvents.set(event.session_id, new Date(event.created_at));
        } else if (event.event_type === 'field_blur') {
          const focusTime = stats.focusEvents.get(event.session_id);
          if (focusTime) {
            const blurTime = new Date(event.created_at);
            const timeSpent = (blurTime.getTime() - focusTime.getTime()) / 1000;
            stats.totalTime += timeSpent;
            stats.focusEvents.delete(event.session_id);
          }
        } else if (event.event_type === 'field_change') {
          // Field was changed (not abandoned)
          const focusTime = stats.focusEvents.get(event.session_id);
          if (focusTime) {
            stats.focusEvents.delete(event.session_id);
          }
        }
      });

      // Calculate abandons (fields that were focused but never changed)
      fieldStatsMap.forEach(stats => {
        stats.abandons = stats.focusEvents.size;
      });

      const fieldInteractions = Array.from(fieldStatsMap.entries()).map(([fieldName, stats]) => ({
        fieldName,
        touches: stats.touches,
        avgTimeSpent: stats.touches > 0 ? Math.round(stats.totalTime / stats.touches) : 0,
        abandonRate: stats.touches > 0 ? Math.round((stats.abandons / stats.touches) * 100) : 0,
      })).sort((a, b) => b.abandonRate - a.abandonRate);

      // Recovery analytics from tracking events
      const recovery = {
        modalsShown: recoveryModalShown,
        accepted: recoveryAccepted,
        rejected: recoveryRejected,
        acceptanceRate: recoveryModalShown > 0 ? Math.round((recoveryAccepted / recoveryModalShown) * 100) : 0,
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
