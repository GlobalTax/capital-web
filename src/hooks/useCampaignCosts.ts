// ============= CAMPAIGN COSTS HOOK =============
// Hook para gestionar costes de campañas publicitarias

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';

export interface CampaignCost {
  id: string;
  channel: 'meta_ads' | 'google_ads' | 'linkedin_ads' | 'other';
  campaign_name: string | null;
  period_start: string;
  period_end: string;
  amount: number;
  impressions: number | null;
  clicks: number | null;
  ctr: number | null;
  cpc: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  // New fields for Excel-style table
  delivery_status: 'active' | 'paused' | null;
  results: number | null;
  daily_budget: number | null;
  monthly_budget: number | null;
  target_cpl: number | null;
  internal_status: 'ok' | 'watch' | 'stop' | null;
}

export interface CampaignCostInput {
  channel: 'meta_ads' | 'google_ads' | 'linkedin_ads' | 'other';
  campaign_name?: string;
  period_start: string;
  period_end: string;
  amount: number;
  impressions?: number;
  clicks?: number;
  ctr?: number;
  cpc?: number;
  notes?: string;
  // New fields for Excel-style table
  delivery_status?: 'active' | 'paused';
  results?: number;
  daily_budget?: number;
  monthly_budget?: number;
  target_cpl?: number;
  internal_status?: 'ok' | 'watch' | 'stop';
}

export interface ChannelAnalytics {
  channel: string;
  channelLabel: string;
  totalSpend: number;
  totalLeads: number;
  totalValuations: number;
  cac: number;
  trend: number;
}

export interface PeriodAnalytics {
  period: string;
  spend: number;
  leads: number;
  cac: number;
}

const CHANNEL_LABELS: Record<string, string> = {
  meta_ads: 'Meta Ads',
  google_ads: 'Google Ads',
  linkedin_ads: 'LinkedIn Ads',
  other: 'Otros'
};

const CHANNEL_UTM_MAPPING: Record<string, string[]> = {
  meta_ads: ['facebook', 'fb', 'instagram', 'ig', 'meta'],
  google_ads: ['google', 'gads', 'adwords', 'cpc'],
  linkedin_ads: ['linkedin', 'li'],
  other: ['other', 'direct', 'organic']
};

export const useCampaignCosts = () => {
  const queryClient = useQueryClient();

  // Fetch all campaign costs
  const { data: costs = [], isLoading: isLoadingCosts, error } = useQuery({
    queryKey: ['campaign_costs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campaign_costs')
        .select('*')
        .order('period_start', { ascending: false });
      
      if (error) throw error;
      return data as CampaignCost[];
    }
  });

  // Add new campaign cost
  const addCostMutation = useMutation({
    mutationFn: async (input: CampaignCostInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('campaign_costs')
        .insert({
          ...input,
          created_by: user?.id
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaign_costs'] });
      toast.success('Gasto de campaña añadido');
    },
    onError: (error) => {
      console.error('Error adding campaign cost:', error);
      toast.error('Error al añadir el gasto');
    }
  });

  // Update campaign cost
  const updateCostMutation = useMutation({
    mutationFn: async ({ id, ...input }: CampaignCostInput & { id: string }) => {
      const { data, error } = await supabase
        .from('campaign_costs')
        .update(input)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaign_costs'] });
      toast.success('Gasto actualizado');
    },
    onError: (error) => {
      console.error('Error updating campaign cost:', error);
      toast.error('Error al actualizar el gasto');
    }
  });

  // Delete campaign cost
  const deleteCostMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('campaign_costs')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaign_costs'] });
      toast.success('Gasto eliminado');
    },
    onError: (error) => {
      console.error('Error deleting campaign cost:', error);
      toast.error('Error al eliminar el gasto');
    }
  });

  // Update single cell (optimistic)
  const updateCellMutation = useMutation({
    mutationFn: async ({ id, field, value }: { 
      id: string; 
      field: string; 
      value: string | number | null 
    }) => {
      const { data, error } = await supabase
        .from('campaign_costs')
        .update({ [field]: value, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onMutate: async ({ id, field, value }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['campaign_costs'] });
      
      // Snapshot previous value
      const previous = queryClient.getQueryData<CampaignCost[]>(['campaign_costs']);
      
      // Optimistically update
      queryClient.setQueryData<CampaignCost[]>(['campaign_costs'], (old) =>
        old?.map((row) => row.id === id ? { ...row, [field]: value } : row)
      );
      
      return { previous };
    },
    onError: (err, vars, context) => {
      // Rollback on error
      if (context?.previous) {
        queryClient.setQueryData(['campaign_costs'], context.previous);
      }
      toast.error('Error al guardar');
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['campaign_costs'] });
    }
  });

  // Get leads by channel and period
  const getLeadsByChannelAndPeriod = async (
    channel: string, 
    periodStart: string, 
    periodEnd: string
  ): Promise<{ leads: number; valuations: number }> => {
    const utmValues = CHANNEL_UTM_MAPPING[channel] || [];
    
    // Get contact_leads
    let leadsQuery = supabase
      .from('contact_leads')
      .select('id', { count: 'exact' })
      .gte('created_at', periodStart)
      .lte('created_at', periodEnd);
    
    // Filter by UTM source
    if (utmValues.length > 0) {
      leadsQuery = leadsQuery.or(
        utmValues.map(v => `utm_source.ilike.%${v}%`).join(',')
      );
    }
    
    const { count: leadsCount } = await leadsQuery;

    // Get company_valuations
    let valuationsQuery = supabase
      .from('company_valuations')
      .select('id', { count: 'exact' })
      .gte('created_at', periodStart)
      .lte('created_at', periodEnd);
    
    if (utmValues.length > 0) {
      valuationsQuery = valuationsQuery.or(
        utmValues.map(v => `utm_source.ilike.%${v}%`).join(',')
      );
    }
    
    const { count: valuationsCount } = await valuationsQuery;

    return {
      leads: leadsCount || 0,
      valuations: valuationsCount || 0
    };
  };

  // Calculate channel analytics
  const { data: channelAnalytics = [], isLoading: isLoadingAnalytics } = useQuery({
    queryKey: ['campaign_costs_analytics', costs],
    queryFn: async () => {
      const analytics: ChannelAnalytics[] = [];
      const channels = ['meta_ads', 'google_ads', 'linkedin_ads', 'other'] as const;
      
      // Current month
      const now = new Date();
      const monthStart = format(startOfMonth(now), 'yyyy-MM-dd');
      const monthEnd = format(endOfMonth(now), 'yyyy-MM-dd');
      
      // Previous month for trend calculation
      const prevMonthStart = format(startOfMonth(subMonths(now, 1)), 'yyyy-MM-dd');
      const prevMonthEnd = format(endOfMonth(subMonths(now, 1)), 'yyyy-MM-dd');

      for (const channel of channels) {
        // Current month spend
        const currentSpend = costs
          .filter(c => c.channel === channel && 
            c.period_start >= monthStart && c.period_end <= monthEnd)
          .reduce((sum, c) => sum + Number(c.amount), 0);
        
        // Previous month spend for trend
        const prevSpend = costs
          .filter(c => c.channel === channel && 
            c.period_start >= prevMonthStart && c.period_end <= prevMonthEnd)
          .reduce((sum, c) => sum + Number(c.amount), 0);

        // Get leads for current month
        const { leads, valuations } = await getLeadsByChannelAndPeriod(
          channel, 
          monthStart, 
          monthEnd
        );

        const totalContacts = leads + valuations;
        const cac = totalContacts > 0 ? currentSpend / totalContacts : 0;
        const trend = prevSpend > 0 
          ? Math.round(((currentSpend - prevSpend) / prevSpend) * 100) 
          : 0;

        analytics.push({
          channel,
          channelLabel: CHANNEL_LABELS[channel],
          totalSpend: currentSpend,
          totalLeads: leads,
          totalValuations: valuations,
          cac: Math.round(cac * 100) / 100,
          trend
        });
      }

      return analytics;
    },
    enabled: costs.length >= 0
  });

  // Get monthly analytics for chart
  const { data: monthlyAnalytics = [] } = useQuery({
    queryKey: ['campaign_costs_monthly', costs],
    queryFn: async () => {
      const analytics: PeriodAnalytics[] = [];
      const now = new Date();

      for (let i = 5; i >= 0; i--) {
        const monthDate = subMonths(now, i);
        const monthStart = format(startOfMonth(monthDate), 'yyyy-MM-dd');
        const monthEnd = format(endOfMonth(monthDate), 'yyyy-MM-dd');
        const period = format(monthDate, 'MMM yyyy');

        const spend = costs
          .filter(c => c.period_start >= monthStart && c.period_end <= monthEnd)
          .reduce((sum, c) => sum + Number(c.amount), 0);

        // Get total leads for the period
        const { data: leadsData } = await supabase
          .from('contact_leads')
          .select('id', { count: 'exact' })
          .gte('created_at', monthStart)
          .lte('created_at', monthEnd);

        const { data: valuationsData } = await supabase
          .from('company_valuations')
          .select('id', { count: 'exact' })
          .gte('created_at', monthStart)
          .lte('created_at', monthEnd);

        const leads = (leadsData?.length || 0) + (valuationsData?.length || 0);
        const cac = leads > 0 ? spend / leads : 0;

        analytics.push({
          period,
          spend,
          leads,
          cac: Math.round(cac * 100) / 100
        });
      }

      return analytics;
    },
    enabled: costs.length >= 0
  });

  // Summary stats
  const totalSpend = costs.reduce((sum, c) => sum + Number(c.amount), 0);
  const currentMonthCosts = costs.filter(c => {
    const now = new Date();
    const monthStart = format(startOfMonth(now), 'yyyy-MM-dd');
    return c.period_start >= monthStart;
  });
  const currentMonthSpend = currentMonthCosts.reduce((sum, c) => sum + Number(c.amount), 0);

  return {
    // Data
    costs,
    channelAnalytics,
    monthlyAnalytics,
    
    // Summary
    totalSpend,
    currentMonthSpend,
    
    // Loading states
    isLoadingCosts,
    isLoadingAnalytics,
    error,
    
    // Mutations
    addCost: addCostMutation.mutate,
    updateCost: updateCostMutation.mutate,
    deleteCost: deleteCostMutation.mutate,
    updateCell: updateCellMutation.mutateAsync,
    isAdding: addCostMutation.isPending,
    isUpdating: updateCostMutation.isPending,
    isDeleting: deleteCostMutation.isPending,
    
    // Helpers
    channelLabels: CHANNEL_LABELS,
    getLeadsByChannelAndPeriod
  };
};
