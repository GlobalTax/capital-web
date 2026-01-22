import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMemo } from 'react';

export interface CampaignHistoryRecord {
  id: string;
  campaign_cost_id: string;
  campaign_name: string | null;
  channel: string | null;
  results: number | null;
  amount: number | null;
  cost_per_result: number | null;
  daily_budget: number | null;
  monthly_budget: number | null;
  target_cpl: number | null;
  internal_status: 'ok' | 'watch' | 'stop' | null;
  delivery_status: 'active' | 'paused' | null;
  notes: string | null;
  recorded_at: string;
  changed_by: string | null;
  change_type: 'create' | 'update' | 'import' | null;
}

export interface EvolutionData {
  date: string;
  campaignName: string;
  channel: string;
  leads: number;
  spend: number;
  cpl: number;
}

export interface CampaignSummary {
  campaignName: string;
  channel: string;
  avgCpl: number;
  totalLeads: number;
  totalSpend: number;
  cplVariation: number;
  recordCount: number;
}

export interface AlertData {
  campaignName: string;
  channel: string;
  currentStatus: 'ok' | 'watch' | 'stop';
  statusChangeCount: number;
  trend: 'improving' | 'worsening' | 'stable';
}

export type PeriodFilter = '7d' | '30d' | '90d' | 'all';

const getDateFilter = (period: PeriodFilter): Date | null => {
  if (period === 'all') return null;
  const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

export const useCampaignHistory = (
  period: PeriodFilter = '30d',
  campaignFilter?: string
) => {
  // Fetch all history
  const { data: history, isLoading, error, refetch } = useQuery({
    queryKey: ['campaign_history', period, campaignFilter],
    queryFn: async () => {
      let query = supabase
        .from('campaign_cost_history')
        .select('*')
        .order('recorded_at', { ascending: false });

      const dateFilter = getDateFilter(period);
      if (dateFilter) {
        query = query.gte('recorded_at', dateFilter.toISOString());
      }

      if (campaignFilter && campaignFilter !== 'all') {
        query = query.eq('campaign_name', campaignFilter);
      }

      const { data, error } = await query.limit(1000);
      if (error) throw error;
      return data as CampaignHistoryRecord[];
    },
    staleTime: 30000,
  });

  // Evolution data (Table A)
  const evolutionData = useMemo((): EvolutionData[] => {
    if (!history || history.length === 0) return [];

    return history.map(record => ({
      date: new Date(record.recorded_at).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
      }),
      campaignName: record.campaign_name || 'Sin nombre',
      channel: record.channel || 'Desconocido',
      leads: record.results || 0,
      spend: Number(record.amount) || 0,
      cpl: Number(record.cost_per_result) || 0,
    }));
  }, [history]);

  // Campaign summaries (Table B)
  const campaignSummaries = useMemo((): CampaignSummary[] => {
    if (!history || history.length === 0) return [];

    const grouped = history.reduce((acc, record) => {
      const key = record.campaign_name || 'Sin nombre';
      if (!acc[key]) {
        acc[key] = {
          records: [],
          channel: record.channel || 'Desconocido',
        };
      }
      acc[key].records.push(record);
      return acc;
    }, {} as Record<string, { records: CampaignHistoryRecord[]; channel: string }>);

    return Object.entries(grouped).map(([campaignName, { records, channel }]) => {
      const totalLeads = records.reduce((sum, r) => sum + (r.results || 0), 0);
      const totalSpend = records.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
      const avgCpl = totalLeads > 0 ? totalSpend / totalLeads : 0;

      // Calculate CPL variation (latest vs previous)
      const sortedRecords = [...records].sort(
        (a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime()
      );
      
      let cplVariation = 0;
      if (sortedRecords.length >= 2) {
        const latestCpl = Number(sortedRecords[0].cost_per_result) || 0;
        const previousCpl = Number(sortedRecords[1].cost_per_result) || 0;
        if (previousCpl > 0) {
          cplVariation = ((latestCpl - previousCpl) / previousCpl) * 100;
        }
      }

      return {
        campaignName,
        channel,
        avgCpl,
        totalLeads,
        totalSpend,
        cplVariation,
        recordCount: records.length,
      };
    });
  }, [history]);

  // Alerts data (Table C)
  const alertsData = useMemo((): AlertData[] => {
    if (!history || history.length === 0) return [];

    const grouped = history.reduce((acc, record) => {
      const key = record.campaign_name || 'Sin nombre';
      if (!acc[key]) {
        acc[key] = {
          records: [],
          channel: record.channel || 'Desconocido',
        };
      }
      acc[key].records.push(record);
      return acc;
    }, {} as Record<string, { records: CampaignHistoryRecord[]; channel: string }>);

    return Object.entries(grouped).map(([campaignName, { records, channel }]) => {
      const sortedRecords = [...records].sort(
        (a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime()
      );

      const currentStatus = sortedRecords[0]?.internal_status || 'ok';

      // Count status changes
      let statusChangeCount = 0;
      for (let i = 1; i < sortedRecords.length; i++) {
        if (sortedRecords[i].internal_status !== sortedRecords[i - 1].internal_status) {
          statusChangeCount++;
        }
      }

      // Calculate trend based on CPL evolution
      let trend: 'improving' | 'worsening' | 'stable' = 'stable';
      if (sortedRecords.length >= 3) {
        const recentCpls = sortedRecords.slice(0, 3).map(r => Number(r.cost_per_result) || 0);
        const olderCpls = sortedRecords.slice(3, 6).map(r => Number(r.cost_per_result) || 0);
        
        if (recentCpls.length > 0 && olderCpls.length > 0) {
          const recentAvg = recentCpls.reduce((a, b) => a + b, 0) / recentCpls.length;
          const olderAvg = olderCpls.reduce((a, b) => a + b, 0) / olderCpls.length;
          
          const change = olderAvg > 0 ? ((recentAvg - olderAvg) / olderAvg) * 100 : 0;
          if (change < -5) trend = 'improving';
          else if (change > 5) trend = 'worsening';
        }
      }

      return {
        campaignName,
        channel,
        currentStatus,
        statusChangeCount,
        trend,
      };
    });
  }, [history]);

  // Chart data: CPL evolution over time
  const cplEvolutionData = useMemo(() => {
    if (!history || history.length === 0) return [];

    // Group by date and campaign
    const grouped = history.reduce((acc, record) => {
      const date = new Date(record.recorded_at).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
      });
      if (!acc[date]) acc[date] = {};
      const campaign = record.campaign_name || 'Sin nombre';
      if (!acc[date][campaign]) {
        acc[date][campaign] = {
          cpl: Number(record.cost_per_result) || 0,
          count: 1,
        };
      }
      return acc;
    }, {} as Record<string, Record<string, { cpl: number; count: number }>>);

    return Object.entries(grouped)
      .map(([date, campaigns]) => ({
        date,
        ...Object.fromEntries(
          Object.entries(campaigns).map(([campaign, data]) => [campaign, data.cpl])
        ),
      }))
      .reverse();
  }, [history]);

  // Chart data: Leads vs Spend
  const leadsVsSpendData = useMemo(() => {
    if (!history || history.length === 0) return [];

    const grouped = history.reduce((acc, record) => {
      const date = new Date(record.recorded_at).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
      });
      if (!acc[date]) {
        acc[date] = { leads: 0, spend: 0 };
      }
      acc[date].leads += record.results || 0;
      acc[date].spend += Number(record.amount) || 0;
      return acc;
    }, {} as Record<string, { leads: number; spend: number }>);

    return Object.entries(grouped)
      .map(([date, data]) => ({
        date,
        leads: data.leads,
        spend: data.spend,
      }))
      .reverse();
  }, [history]);

  // Chart data: Status distribution
  const statusDistributionData = useMemo(() => {
    if (!campaignSummaries || campaignSummaries.length === 0) return [];

    const latestStatuses = alertsData.reduce((acc, alert) => {
      acc[alert.currentStatus] = (acc[alert.currentStatus] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return [
      { name: 'OK', value: latestStatuses['ok'] || 0, color: 'hsl(142, 76%, 36%)' },
      { name: 'Vigilar', value: latestStatuses['watch'] || 0, color: 'hsl(48, 96%, 53%)' },
      { name: 'Parar', value: latestStatuses['stop'] || 0, color: 'hsl(0, 84%, 60%)' },
    ].filter(item => item.value > 0);
  }, [alertsData, campaignSummaries]);

  // Get unique campaign names for filter
  const uniqueCampaigns = useMemo(() => {
    if (!history) return [];
    const names = new Set(history.map(r => r.campaign_name).filter(Boolean));
    return Array.from(names) as string[];
  }, [history]);

  return {
    history,
    isLoading,
    error,
    refetch,
    // Derived data
    evolutionData,
    campaignSummaries,
    alertsData,
    // Chart data
    cplEvolutionData,
    leadsVsSpendData,
    statusDistributionData,
    // Filters
    uniqueCampaigns,
    hasEnoughData: (history?.length || 0) >= 3,
  };
};
