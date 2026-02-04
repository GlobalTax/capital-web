// ============= UNIFIED COSTS HOOK =============
// Hook unificado para costes publicitarios que combina:
// - ads_costs_history (costes importados de Meta/Google)
// - campaign_leads_stats (leads vinculados)
// - unified_costs_daily (vista materializada)

import { useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format, parseISO, startOfMonth, endOfMonth, subMonths } from 'date-fns';

// ============= TYPES =============

export interface UnifiedCostRecord {
  date: string;
  campaign_id: string | null;
  campaign_name: string;
  original_campaign_name: string;
  channel: string;
  spend: number;
  results: number;
  impressions: number;
  reach: number;
  clicks: number;
  cost_per_result: number | null;
}

export interface CampaignLeadStats {
  campaign_id: string;
  campaign_name: string;
  lead_date: string;
  lead_count: number;
  qualified_count: number;
  avg_ebitda: number | null;
  avg_revenue: number | null;
}

export interface UnifiedCostWithLeads extends UnifiedCostRecord {
  leads: number;
  qualifiedLeads: number;
  realCPL: number | null;
  qualifiedCPL: number | null;
  avgEbitda: number | null;
}

export interface CampaignSummary {
  campaign_id: string | null;
  campaign_name: string;
  totalSpend: number;
  totalResults: number;
  totalLeads: number;
  totalQualifiedLeads: number;
  avgCostPerResult: number;
  realCPL: number | null;
  qualifiedCPL: number | null;
  avgEbitda: number | null;
  activeDays: number;
  percentOfTotal: number;
}

export interface UnifiedCostsOptions {
  dateFrom?: string;
  dateTo?: string;
  channel?: 'meta_ads' | 'google_ads' | 'all';
  campaignId?: string;
}

// ============= MAIN HOOK =============

export const useUnifiedCosts = (options?: UnifiedCostsOptions) => {
  const queryClient = useQueryClient();
  
  // Default date range: last 3 months
  const defaultDateFrom = format(startOfMonth(subMonths(new Date(), 2)), 'yyyy-MM-dd');
  const defaultDateTo = format(endOfMonth(new Date()), 'yyyy-MM-dd');
  
  const dateFrom = options?.dateFrom || defaultDateFrom;
  const dateTo = options?.dateTo || defaultDateTo;
  const channel = options?.channel || 'all';

  // Query: Unified costs daily (materialized view)
  const { 
    data: dailyCosts, 
    isLoading: isLoadingCosts,
    error: costsError,
    refetch: refetchCosts
  } = useQuery({
    queryKey: ['unified-costs-daily', dateFrom, dateTo, channel],
    queryFn: async () => {
      let query = supabase
        .from('unified_costs_daily')
        .select('*')
        .gte('date', dateFrom)
        .lte('date', dateTo)
        .order('date', { ascending: false });
      
      if (channel !== 'all') {
        query = query.eq('channel', channel);
      }
      
      if (options?.campaignId) {
        query = query.eq('campaign_id', options.campaignId);
      }
      
      const { data, error } = await query.limit(5000);
      
      if (error) {
        console.error('[useUnifiedCosts] Error fetching costs:', error);
        throw error;
      }
      
      return (data ?? []) as UnifiedCostRecord[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });

  // Query: Campaign leads stats (regular view)
  const { 
    data: leadStats, 
    isLoading: isLoadingLeads,
    error: leadsError
  } = useQuery({
    queryKey: ['campaign-leads-stats', dateFrom, dateTo],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campaign_leads_stats')
        .select('*')
        .gte('lead_date', dateFrom)
        .lte('lead_date', dateTo);
      
      if (error) {
        console.error('[useUnifiedCosts] Error fetching lead stats:', error);
        // Return empty array instead of throwing - this view may be empty
        return [] as CampaignLeadStats[];
      }
      
      return (data ?? []) as CampaignLeadStats[];
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  // Combine costs with leads for real CPL calculation
  const costWithLeads = useMemo((): UnifiedCostWithLeads[] => {
    if (!dailyCosts) return [];
    
    return dailyCosts.map(cost => {
      // Find matching leads for this campaign and date
      const matchingLeads = leadStats?.find(
        l => l.campaign_id === cost.campaign_id && l.lead_date === cost.date
      );
      
      const leads = matchingLeads?.lead_count || 0;
      const qualifiedLeads = matchingLeads?.qualified_count || 0;
      
      return {
        ...cost,
        leads,
        qualifiedLeads,
        realCPL: leads > 0 ? cost.spend / leads : null,
        qualifiedCPL: qualifiedLeads > 0 ? cost.spend / qualifiedLeads : null,
        avgEbitda: matchingLeads?.avg_ebitda || null,
      };
    });
  }, [dailyCosts, leadStats]);

  // Campaign summaries with totals
  const campaignSummaries = useMemo((): CampaignSummary[] => {
    if (!costWithLeads.length) return [];
    
    const totalSpendAll = costWithLeads.reduce((sum, r) => sum + r.spend, 0);
    
    // Group by campaign
    const campaignMap = new Map<string, UnifiedCostWithLeads[]>();
    
    for (const record of costWithLeads) {
      const key = record.campaign_name;
      const existing = campaignMap.get(key) || [];
      existing.push(record);
      campaignMap.set(key, existing);
    }
    
    // Calculate summaries
    const summaries: CampaignSummary[] = [];
    
    for (const [campaignName, records] of campaignMap) {
      const totalSpend = records.reduce((sum, r) => sum + r.spend, 0);
      const totalResults = records.reduce((sum, r) => sum + r.results, 0);
      const totalLeads = records.reduce((sum, r) => sum + r.leads, 0);
      const totalQualifiedLeads = records.reduce((sum, r) => sum + r.qualifiedLeads, 0);
      const uniqueDates = new Set(records.map(r => r.date));
      
      // Calculate average EBITDA from records with valid values
      const ebitdaValues = records.filter(r => r.avgEbitda).map(r => r.avgEbitda!);
      const avgEbitda = ebitdaValues.length > 0 
        ? ebitdaValues.reduce((a, b) => a + b, 0) / ebitdaValues.length 
        : null;
      
      summaries.push({
        campaign_id: records[0]?.campaign_id || null,
        campaign_name: campaignName,
        totalSpend,
        totalResults,
        totalLeads,
        totalQualifiedLeads,
        avgCostPerResult: totalResults > 0 ? totalSpend / totalResults : 0,
        realCPL: totalLeads > 0 ? totalSpend / totalLeads : null,
        qualifiedCPL: totalQualifiedLeads > 0 ? totalSpend / totalQualifiedLeads : null,
        avgEbitda,
        activeDays: uniqueDates.size,
        percentOfTotal: totalSpendAll > 0 ? (totalSpend / totalSpendAll) * 100 : 0,
      });
    }
    
    // Sort by total spend descending
    return summaries.sort((a, b) => b.totalSpend - a.totalSpend);
  }, [costWithLeads]);

  // Global stats
  const globalStats = useMemo(() => {
    if (!costWithLeads.length) {
      return {
        totalSpend: 0,
        totalResults: 0,
        totalLeads: 0,
        totalQualifiedLeads: 0,
        avgCostPerResult: 0,
        realCPL: null as number | null,
        qualifiedCPL: null as number | null,
        activeDays: 0,
        campaignCount: 0,
      };
    }
    
    const totalSpend = costWithLeads.reduce((sum, r) => sum + r.spend, 0);
    const totalResults = costWithLeads.reduce((sum, r) => sum + r.results, 0);
    const totalLeads = costWithLeads.reduce((sum, r) => sum + r.leads, 0);
    const totalQualifiedLeads = costWithLeads.reduce((sum, r) => sum + r.qualifiedLeads, 0);
    const uniqueDates = new Set(costWithLeads.map(r => r.date));
    const uniqueCampaigns = new Set(costWithLeads.map(r => r.campaign_name));
    
    return {
      totalSpend,
      totalResults,
      totalLeads,
      totalQualifiedLeads,
      avgCostPerResult: totalResults > 0 ? totalSpend / totalResults : 0,
      realCPL: totalLeads > 0 ? totalSpend / totalLeads : null,
      qualifiedCPL: totalQualifiedLeads > 0 ? totalSpend / totalQualifiedLeads : null,
      activeDays: uniqueDates.size,
      campaignCount: uniqueCampaigns.size,
    };
  }, [costWithLeads]);

  // Refresh materialized view
  const refreshView = async () => {
    try {
      const { error } = await supabase.rpc('refresh_unified_costs');
      if (error) throw error;
      
      // Invalidate queries to refetch
      await queryClient.invalidateQueries({ queryKey: ['unified-costs-daily'] });
      toast.success('Vista de costes actualizada');
    } catch (err) {
      console.error('[useUnifiedCosts] Error refreshing view:', err);
      toast.error('Error al actualizar la vista de costes');
    }
  };

  return {
    // Raw data
    dailyCosts: dailyCosts || [],
    leadStats: leadStats || [],
    
    // Combined data
    costWithLeads,
    campaignSummaries,
    globalStats,
    
    // Loading states
    isLoading: isLoadingCosts || isLoadingLeads,
    isLoadingCosts,
    isLoadingLeads,
    
    // Errors
    error: costsError || leadsError,
    
    // Actions
    refreshView,
    refetchCosts,
  };
};

// ============= HELPER HOOK FOR SPECIFIC CAMPAIGN =============

export const useCampaignCostDetails = (campaignId: string | null) => {
  return useUnifiedCosts({
    campaignId: campaignId || undefined,
  });
};

export default useUnifiedCosts;
