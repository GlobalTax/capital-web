// ============= USE LEAD METRICS HOOK =============
// Hook para calcular métricas de leads desde la base de datos

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useContactStatuses, ContactStatus } from '@/hooks/useContactStatuses';
import { 
  LeadMetricsData, 
  StatusDistribution, 
  FunnelStage,
  CampaignQuality,
  TemporalDataPoint,
  TERMINAL_STATUS_KEYS,
  QUALIFIED_STATUS_KEYS,
  MEETING_STATUS_KEYS,
  PSH_STATUS_KEYS,
  WON_STATUS_KEYS,
  DISCARD_STATUS_KEYS,
} from './types';
import { format, subDays, parseISO, startOfDay, endOfDay } from 'date-fns';

interface LeadRecord {
  id: string;
  lead_status_crm: string | null;
  origin: string;
  created_at: string;
  lead_received_at?: string;
  campaign?: string;
  source?: string;
}

interface UseLeadMetricsOptions {
  dateFrom?: Date;
  dateTo?: Date;
  campaign?: string;
  leadType?: string;
}

export const useLeadMetrics = (options: UseLeadMetricsOptions = {}) => {
  const { statuses, isLoading: statusesLoading } = useContactStatuses();
  
  // Fetch all leads for metrics calculation
  const { data: leads, isLoading: leadsLoading, refetch } = useQuery({
    queryKey: ['lead-metrics-data', options.dateFrom?.toISOString(), options.dateTo?.toISOString()],
    queryFn: async () => {
      const allLeads: LeadRecord[] = [];
      
      // Fetch from company_valuations with LIMIT to prevent timeout
      const { data: valuations, error: valError } = await supabase
        .from('company_valuations')
        .select('id, lead_status_crm, created_at, lead_received_at, lead_form')
        .is('is_deleted', false)
        .order('created_at', { ascending: false })
        .limit(5000);
      
      if (valError) {
        console.warn('[useLeadMetrics] Error fetching valuations:', valError.message);
      }
      
      if (valuations && Array.isArray(valuations)) {
        allLeads.push(...valuations.map(v => ({
          id: v.id,
          lead_status_crm: v.lead_status_crm,
          origin: 'valuation',
          created_at: v.created_at,
          lead_received_at: v.lead_received_at || undefined,
          source: v.lead_form || 'Valoración',
        })));
      }
      
      // Fetch from contact_leads with LIMIT
      const { data: contacts, error: contactsError } = await supabase
        .from('contact_leads')
        .select('id, lead_status_crm, created_at, lead_received_at, lead_form')
        .is('is_deleted', false)
        .order('created_at', { ascending: false })
        .limit(5000);
      
      if (contactsError) {
        console.warn('[useLeadMetrics] Error fetching contacts:', contactsError.message);
      }
      
      if (contacts && Array.isArray(contacts)) {
        allLeads.push(...contacts.map(c => ({
          id: c.id,
          lead_status_crm: c.lead_status_crm,
          origin: 'contact',
          created_at: c.created_at,
          lead_received_at: c.lead_received_at || undefined,
          source: c.lead_form || 'Contacto',
        })));
      }
      
      // Fetch from acquisition_leads with LIMIT
      const { data: acquisitions, error: acqError } = await supabase
        .from('acquisition_leads')
        .select('id, lead_status_crm, created_at, lead_received_at, lead_form')
        .is('is_deleted', false)
        .order('created_at', { ascending: false })
        .limit(5000);
      
      if (acqError) {
        console.warn('[useLeadMetrics] Error fetching acquisitions:', acqError.message);
      }
      
      if (acquisitions && Array.isArray(acquisitions)) {
        allLeads.push(...acquisitions.map(a => ({
          id: a.id,
          lead_status_crm: a.lead_status_crm,
          origin: 'acquisition',
          created_at: a.created_at,
          lead_received_at: a.lead_received_at || undefined,
          source: a.lead_form || 'Compra',
        })));
      }
      
      // Fetch from collaborator_applications with LIMIT
      const { data: collaborators, error: collabError } = await supabase
        .from('collaborator_applications')
        .select('id, lead_status_crm, created_at, lead_form')
        .is('is_deleted', false)
        .order('created_at', { ascending: false })
        .limit(2000);
      
      if (collabError) {
        console.warn('[useLeadMetrics] Error fetching collaborators:', collabError.message);
      }
      
      if (collaborators && Array.isArray(collaborators)) {
        allLeads.push(...collaborators.map(c => ({
          id: c.id,
          lead_status_crm: c.lead_status_crm,
          origin: 'collaborator',
          created_at: c.created_at,
          source: c.lead_form || 'Colaborador',
        })));
      }
      
      return allLeads;
    },
    staleTime: 1000 * 60, // 1 minute cache
    refetchOnWindowFocus: true,
  });

  // Filter leads by date range with safe date parsing
  const filteredLeads = useMemo(() => {
    if (!leads || !Array.isArray(leads)) return [];
    
    let filtered = [...leads];
    
    if (options.dateFrom) {
      const from = startOfDay(options.dateFrom);
      filtered = filtered.filter(l => {
        try {
          const dateStr = l.lead_received_at || l.created_at;
          if (!dateStr) return false;
          const date = parseISO(dateStr);
          return !isNaN(date.getTime()) && date >= from;
        } catch {
          return false;
        }
      });
    }
    
    if (options.dateTo) {
      const to = endOfDay(options.dateTo);
      filtered = filtered.filter(l => {
        try {
          const dateStr = l.lead_received_at || l.created_at;
          if (!dateStr) return false;
          const date = parseISO(dateStr);
          return !isNaN(date.getTime()) && date <= to;
        } catch {
          return false;
        }
      });
    }
    
    if (options.campaign) {
      filtered = filtered.filter(l => l.source?.toLowerCase().includes(options.campaign!.toLowerCase()));
    }
    
    return filtered;
  }, [leads, options.dateFrom, options.dateTo, options.campaign]);

  // Calculate metrics
  const metrics: LeadMetricsData = useMemo(() => {
    if (!filteredLeads.length || !statuses.length) {
      return {
        statusDistribution: [],
        funnel: [],
        transitions: [],
        campaignQuality: [],
        temporalEvolution: [],
        totals: { totalLeads: 0, activeLeads: 0, wonLeads: 0, lostLeads: 0 },
      };
    }

    // 1. Status Distribution
    const statusCounts = new Map<string, number>();
    filteredLeads.forEach(lead => {
      const status = lead.lead_status_crm || 'nuevo';
      statusCounts.set(status, (statusCounts.get(status) || 0) + 1);
    });

    const totalLeads = filteredLeads.length;
    
    const statusDistribution: StatusDistribution[] = statuses
      .filter(s => s.is_active)
      .map(status => ({
        status_key: status.status_key,
        label: status.label,
        color: status.color,
        count: statusCounts.get(status.status_key) || 0,
        percentage: totalLeads > 0 ? ((statusCounts.get(status.status_key) || 0) / totalLeads) * 100 : 0,
        position: status.position,
      }))
      .filter(s => s.count > 0)
      .sort((a, b) => b.count - a.count);

    // 2. Funnel (based on status position order)
    const sortedStatuses = [...statuses].filter(s => s.is_active).sort((a, b) => a.position - b.position);
    const firstStageCount = statusCounts.get(sortedStatuses[0]?.status_key) || 0;
    
    let cumulativeForFunnel = totalLeads;
    const funnel: FunnelStage[] = sortedStatuses.map((status, index) => {
      const count = statusCounts.get(status.status_key) || 0;
      const isTerminal = TERMINAL_STATUS_KEYS.includes(status.status_key);
      
      // For funnel, we track cumulative (leads that reached this stage or beyond)
      const leadsAtOrBeyond = sortedStatuses
        .slice(index)
        .reduce((sum, s) => sum + (statusCounts.get(s.status_key) || 0), 0);
      
      const prevCount = index > 0 
        ? sortedStatuses.slice(index - 1).reduce((sum, s) => sum + (statusCounts.get(s.status_key) || 0), 0)
        : totalLeads;
      
      return {
        status_key: status.status_key,
        label: status.label,
        color: status.color,
        count,
        percentage: totalLeads > 0 ? (count / totalLeads) * 100 : 0,
        conversionFromPrevious: prevCount > 0 ? (leadsAtOrBeyond / prevCount) * 100 : 0,
        conversionFromFirst: totalLeads > 0 ? (leadsAtOrBeyond / totalLeads) * 100 : 0,
        position: status.position,
        isTerminal,
      };
    }).filter(f => f.count > 0 || f.position <= 6); // Show first 6 stages even if empty

    // 3. Campaign Quality
    const campaignGroups = new Map<string, LeadRecord[]>();
    filteredLeads.forEach(lead => {
      const campaign = lead.source || lead.origin || 'Directo';
      const existing = campaignGroups.get(campaign) || [];
      existing.push(lead);
      campaignGroups.set(campaign, existing);
    });

    const campaignQuality: CampaignQuality[] = Array.from(campaignGroups.entries())
      .map(([campaign, campaignLeads]) => {
        const total = campaignLeads.length;
        const qualified = campaignLeads.filter(l => 
          QUALIFIED_STATUS_KEYS.includes(l.lead_status_crm || '')
        ).length;
        const discarded = campaignLeads.filter(l => 
          DISCARD_STATUS_KEYS.includes(l.lead_status_crm || '')
        ).length;
        const meeting = campaignLeads.filter(l => 
          MEETING_STATUS_KEYS.includes(l.lead_status_crm || '')
        ).length;
        const psh = campaignLeads.filter(l => 
          PSH_STATUS_KEYS.includes(l.lead_status_crm || '')
        ).length;
        const won = campaignLeads.filter(l => 
          WON_STATUS_KEYS.includes(l.lead_status_crm || '')
        ).length;

        // Calculate average funnel depth
        const getDepth = (statusKey: string | null): number => {
          if (!statusKey) return 1;
          const status = statuses.find(s => s.status_key === statusKey);
          return status?.position || 1;
        };
        const avgDepth = campaignLeads.reduce((sum, l) => sum + getDepth(l.lead_status_crm), 0) / total;

        return {
          campaign,
          totalLeads: total,
          qualifiedPercentage: total > 0 ? (qualified / total) * 100 : 0,
          discardedPercentage: total > 0 ? (discarded / total) * 100 : 0,
          meetingPercentage: total > 0 ? (meeting / total) * 100 : 0,
          pshPercentage: total > 0 ? (psh / total) * 100 : 0,
          wonPercentage: total > 0 ? (won / total) * 100 : 0,
          avgConversionDepth: avgDepth,
        };
      })
      .filter(c => c.totalLeads >= 3) // Only show campaigns with meaningful data
      .sort((a, b) => b.totalLeads - a.totalLeads);

    // 4. Temporal Evolution (last 30 days)
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = subDays(new Date(), 29 - i);
      return format(date, 'yyyy-MM-dd');
    });

    const temporalEvolution: TemporalDataPoint[] = last30Days.map(dateStr => {
      const dayLeads = filteredLeads.filter(l => {
        try {
          const dateToCheck = l.lead_received_at || l.created_at;
          if (!dateToCheck) return false;
          const leadDate = format(parseISO(dateToCheck), 'yyyy-MM-dd');
          return leadDate === dateStr;
        } catch {
          // Skip malformed dates without crashing
          return false;
        }
      });

      return {
        date: dateStr,
        newLeads: dayLeads.length,
        qualifiedLeads: dayLeads.filter(l => QUALIFIED_STATUS_KEYS.includes(l.lead_status_crm || '')).length,
        meetingLeads: dayLeads.filter(l => MEETING_STATUS_KEYS.includes(l.lead_status_crm || '')).length,
        wonLeads: dayLeads.filter(l => WON_STATUS_KEYS.includes(l.lead_status_crm || '')).length,
      };
    });

    // 5. Totals
    const wonLeads = filteredLeads.filter(l => WON_STATUS_KEYS.includes(l.lead_status_crm || '')).length;
    const lostLeads = filteredLeads.filter(l => DISCARD_STATUS_KEYS.includes(l.lead_status_crm || '')).length;
    const activeLeads = totalLeads - wonLeads - lostLeads;

    return {
      statusDistribution,
      funnel,
      transitions: [], // TODO: Implement when we have state history
      campaignQuality,
      temporalEvolution,
      totals: { totalLeads, activeLeads, wonLeads, lostLeads },
    };
  }, [filteredLeads, statuses]);

  return {
    metrics,
    isLoading: statusesLoading || leadsLoading,
    refetch,
    totalLeads: leads?.length || 0,
    filteredCount: filteredLeads.length,
  };
};
