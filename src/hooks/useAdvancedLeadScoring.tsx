import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useOptimizedQuery, useSmartInvalidation } from './useOptimizedQuery';

interface LeadScoringRule {
  id: string;
  name: string;
  trigger_type: string;
  page_pattern?: string;
  points: number;
  description: string;
  is_active: boolean;
  decay_days?: number;
  industry_specific?: string[];
  company_size_filter?: string[];
}

interface LeadScore {
  id: string;
  visitor_id: string;
  company_domain?: string;
  company_name?: string;
  industry?: string;
  company_size?: string;
  location?: string;
  total_score: number;
  hot_lead_threshold: number;
  is_hot_lead: boolean;
  last_activity: string;
  first_visit: string;
  visit_count: number;
  email?: string;
  phone?: string;
  contact_name?: string;
  lead_status: string;
  assigned_to?: string;
  notes?: string;
  crm_synced: boolean;
}

interface LeadAlert {
  id: string;
  lead_score_id: string;
  alert_type: string;
  threshold_reached?: number;
  message: string;
  is_read: boolean;
  priority: string;
  created_at: string;
  lead_score?: LeadScore;
}

// Placeholder data optimizado
const HOT_LEADS_PLACEHOLDER = Array.from({ length: 5 }, (_, i) => ({
  id: `hot-placeholder-${i}`,
  visitor_id: `visitor-${i}`,
  total_score: 85 + i * 2,
  is_hot_lead: true,
  lead_status: 'active',
  company_name: 'Empresa ejemplo',
  last_activity: new Date().toISOString(),
  first_visit: new Date().toISOString(),
  visit_count: 3 + i,
  hot_lead_threshold: 80,
  crm_synced: false
}));

export const useAdvancedLeadScoring = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { invalidateRelatedQueries } = useSmartInvalidation();
  
  const [currentSession] = useState(() => 
    `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  );
  const [visitorId] = useState(() => {
    const stored = localStorage.getItem('visitor_id');
    if (stored) return stored;
    
    const newId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('visitor_id', newId);
    return newId;
  });

  // Rate limiting optimizado
  const lastTrackingTime = useRef(0);
  const trackingCooldown = 5000;
  
  const canTrack = useCallback(() => {
    const now = Date.now();
    if (now - lastTrackingTime.current < trackingCooldown) {
      return false;
    }
    lastTrackingTime.current = now;
    return true;
  }, []);

  // Obtener reglas de scoring optimizadas con select
  const { data: scoringRules } = useOptimizedQuery(
    ['leadScoringRules'],
    async () => {
      const { data, error } = await supabase
        .from('lead_scoring_rules')
        .select('id, name, trigger_type, page_pattern, points, is_active, decay_days')
        .eq('is_active', true)
        .order('points', { ascending: false });

      if (error) {
        if (error.code === 'PGRST301' || error.message?.includes('row-level security')) {
          console.warn('No admin access to scoring rules, using public rules only');
          return [];
        }
        throw error;
      }
      return data as LeadScoringRule[];
    },
    'static', // Reglas cambian raramente
    {
      placeholderData: [],
      select: (data) => data?.filter(rule => rule.is_active) || []
    }
  );

  // Hot leads optimizado con select
  const { data: hotLeads, isLoading: isLoadingHotLeads } = useOptimizedQuery(
    ['hotLeads'],
    async () => {
      const { data, error } = await supabase
        .from('lead_scores')
        .select(`
          id,
          visitor_id,
          company_name,
          company_domain,
          total_score,
          is_hot_lead,
          lead_status,
          last_activity,
          visit_count
        `)
        .eq('is_hot_lead', true)
        .eq('lead_status', 'active')
        .order('total_score', { ascending: false })
        .limit(50);

      if (error) {
        if (error.code === 'PGRST301' || error.message?.includes('row-level security')) {
          console.warn('No admin access to hot leads');
          return [];
        }
        throw error;
      }
      return data as LeadScore[];
    },
    'critical', // Hot leads son críticos
    {
      placeholderData: HOT_LEADS_PLACEHOLDER,
      select: (data) => data?.filter(lead => lead.is_hot_lead) || []
    }
  );

  // All leads optimizado
  const { data: allLeads, isLoading: isLoadingAllLeads } = useOptimizedQuery(
    ['allLeads'],
    async () => {
      const { data, error } = await supabase
        .from('lead_scores')
        .select(`
          id,
          visitor_id,
          company_name,
          company_domain,
          total_score,
          lead_status,
          last_activity,
          visit_count,
          is_hot_lead
        `)
        .order('total_score', { ascending: false })
        .limit(200);

      if (error) {
        if (error.code === 'PGRST301' || error.message?.includes('row-level security')) {
          console.warn('No admin access to all leads');
          return [];
        }
        throw error;
      }
      return data as LeadScore[];
    },
    'important',
    {
      placeholderData: [],
      select: (data) => data || []
    }
  );

  // Unread alerts optimizado
  const { data: unreadAlerts } = useOptimizedQuery(
    ['leadAlerts'],
    async () => {
      const { data, error } = await supabase
        .from('lead_alerts')
        .select(`
          id,
          alert_type,
          message,
          priority,
          threshold_reached,
          created_at,
          lead_score_id
        `)
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        if (error.code === 'PGRST301' || error.message?.includes('row-level security')) {
          console.warn('No admin access to alerts');
          return [];
        }
        throw error;
      }
      return data as LeadAlert[];
    },
    'critical',
    {
      placeholderData: [],
      select: (data) => data || []
    }
  );

  // Track behavior event optimizado
  const trackBehaviorEvent = useMutation({
    mutationFn: async ({
      eventType,
      pagePath,
      eventData = { timestamp: new Date().toISOString() },
      companyDomain
    }: {
      eventType: string;
      pagePath?: string;
      eventData?: Record<string, unknown>;
      companyDomain?: string;
    }) => {
      if (!canTrack()) {
        throw new Error('Rate limited');
      }

      const applicableRule = (scoringRules || []).find(rule => {
        if (rule.trigger_type !== eventType) return false;
        
        if (rule.page_pattern && pagePath) {
          const pattern = rule.page_pattern.replace(/%/g, '.*');
          const regex = new RegExp(pattern, 'i');
          return regex.test(pagePath);
        }
        
        return rule.trigger_type === eventType;
      });

      const pointsAwarded = applicableRule?.points || 0;

      const { data, error } = await supabase
        .from('lead_behavior_events')
        .insert({
          session_id: currentSession,
          visitor_id: visitorId,
          company_domain: companyDomain,
          event_type: eventType,
          page_path: pagePath,
          event_data: eventData as any,
          points_awarded: pointsAwarded,
          rule_id: applicableRule?.id,
          user_agent: navigator.userAgent,
          referrer: document.referrer || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      invalidateRelatedQueries('leads', 1500);
    },
    onError: (error) => {
      if (error.message !== 'Rate limited') {
        console.error('Error tracking behavior:', error);
      }
    },
  });

  const markAlertAsRead = useMutation({
    mutationFn: async (alertId: string) => {
      const { error } = await supabase
        .from('lead_alerts')
        .update({ is_read: true })
        .eq('id', alertId);

      if (error && !error.message?.includes('row-level security')) {
        throw error;
      }
    },
    onSuccess: () => {
      invalidateRelatedQueries('leadAlerts', 500);
    },
  });

  // Tracking functions optimized
  const trackPageView = useCallback((path?: string) => {
    if (!canTrack()) return;
    
    const currentPath = path || window.location.pathname;
    
    trackBehaviorEvent.mutate({
      eventType: 'page_view',
      pagePath: currentPath,
      eventData: { 
        timestamp: new Date().toISOString(),
        referrer: document.referrer || undefined,
      }
    });
  }, [trackBehaviorEvent, canTrack]);

  const trackCalculatorUse = useCallback((calculatorData: Record<string, unknown>) => {
    if (!canTrack()) return;
    
    trackBehaviorEvent.mutate({
      eventType: 'calculator_use',
      pagePath: '/calculadora-valoracion',
      eventData: {
        timestamp: new Date().toISOString(),
        ...calculatorData
      }
    });
  }, [trackBehaviorEvent, canTrack]);

  const trackFormFill = useCallback((formData: Record<string, unknown>) => {
    if (!canTrack()) return;
    
    trackBehaviorEvent.mutate({
      eventType: 'form_fill',
      pagePath: window.location.pathname,
      eventData: {
        timestamp: new Date().toISOString(),
        ...formData
      }
    });
  }, [trackBehaviorEvent, canTrack]);

  const trackDownload = useCallback((downloadData: Record<string, unknown>) => {
    if (!canTrack()) return;
    
    trackBehaviorEvent.mutate({
      eventType: 'download',
      pagePath: window.location.pathname,
      eventData: {
        timestamp: new Date().toISOString(),
        ...downloadData
      }
    });
  }, [trackBehaviorEvent, canTrack]);

  // Stats optimizados con useMemo
  const getLeadStats = useCallback(() => {
    if (!allLeads || allLeads.length === 0) {
      return {
        totalLeads: 0,
        hotLeadsCount: 0,
        averageScore: 0,
        conversionRate: '0.0',
        leadsByStatus: {},
        topSources: []
      };
    }

    const totalLeads = allLeads.length;
    const hotLeadsCount = allLeads.filter(lead => lead.is_hot_lead).length;
    const averageScore = allLeads.reduce((sum, lead) => sum + lead.total_score, 0) / totalLeads;
    
    const leadsByStatus = allLeads.reduce((acc, lead) => {
      acc[lead.lead_status] = (acc[lead.lead_status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalLeads,
      hotLeadsCount,
      averageScore: Math.round(averageScore),
      conversionRate: ((leadsByStatus.converted || 0) / totalLeads * 100).toFixed(1),
      leadsByStatus,
      topSources: []
    };
  }, [allLeads]);

  return {
    // Data
    scoringRules,
    hotLeads,
    allLeads,
    unreadAlerts,
    
    // Loading states
    isLoadingHotLeads,
    isLoadingAllLeads,
    
    // Mutations
    trackBehaviorEvent,
    markAlertAsRead,
    
    // Tracking functions
    trackPageView,
    trackCalculatorUse,
    trackFormFill,
    trackDownload,
    
    // Utils
    getLeadStats,
    currentSession,
    visitorId,
  };
};
