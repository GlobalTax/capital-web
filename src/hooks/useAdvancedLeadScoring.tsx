
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

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

interface LeadBehaviorEvent {
  id: string;
  session_id: string;
  visitor_id: string;
  company_domain?: string;
  event_type: string;
  page_path?: string;
  event_data: Record<string, any>;
  points_awarded: number;
  created_at: string;
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

export const useAdvancedLeadScoring = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentSession] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [visitorId] = useState(() => {
    // Generar visitor ID basado en IP y user agent (simulado)
    const stored = localStorage.getItem('visitor_id');
    if (stored) return stored;
    
    const newId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('visitor_id', newId);
    return newId;
  });

  // Obtener reglas de scoring
  const { data: scoringRules } = useQuery({
    queryKey: ['leadScoringRules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lead_scoring_rules')
        .select('*')
        .eq('is_active', true)
        .order('points', { ascending: false });

      if (error) throw error;
      return data as LeadScoringRule[];
    },
  });

  // Obtener leads calientes
  const { data: hotLeads, isLoading: isLoadingHotLeads } = useQuery({
    queryKey: ['hotLeads'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lead_scores')
        .select('*')
        .eq('is_hot_lead', true)
        .eq('lead_status', 'active')
        .order('total_score', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as LeadScore[];
    },
  });

  // Obtener todas las puntuaciones de leads
  const { data: allLeads, isLoading: isLoadingAllLeads } = useQuery({
    queryKey: ['allLeads'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lead_scores')
        .select('*')
        .order('total_score', { ascending: false })
        .limit(200);

      if (error) throw error;
      return data as LeadScore[];
    },
  });

  // Obtener alertas no leídas
  const { data: unreadAlerts } = useQuery({
    queryKey: ['leadAlerts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lead_alerts')
        .select(`
          *,
          lead_score:lead_scores(*)
        `)
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data as LeadAlert[];
    },
  });

  // Registrar evento de comportamiento
  const trackBehaviorEvent = useMutation({
    mutationFn: async ({
      eventType,
      pagePath,
      eventData = {},
      companyDomain
    }: {
      eventType: string;
      pagePath?: string;
      eventData?: Record<string, any>;
      companyDomain?: string;
    }) => {
      // Encontrar regla aplicable
      const applicableRule = scoringRules?.find(rule => {
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
          event_data: eventData,
          points_awarded: pointsAwarded,
          rule_id: applicableRule?.id,
          user_agent: navigator.userAgent,
          referrer: document.referrer || null,
          utm_source: new URLSearchParams(window.location.search).get('utm_source'),
          utm_medium: new URLSearchParams(window.location.search).get('utm_medium'),
          utm_campaign: new URLSearchParams(window.location.search).get('utm_campaign'),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Actualizar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['hotLeads'] });
      queryClient.invalidateQueries({ queryKey: ['allLeads'] });
      queryClient.invalidateQueries({ queryKey: ['leadAlerts'] });
    },
  });

  // Marcar alerta como leída
  const markAlertAsRead = useMutation({
    mutationFn: async (alertId: string) => {
      const { error } = await supabase
        .from('lead_alerts')
        .update({ is_read: true })
        .eq('id', alertId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leadAlerts'] });
    },
  });

  // Actualizar información del lead
  const updateLeadInfo = useMutation({
    mutationFn: async ({
      visitorId,
      updates
    }: {
      visitorId: string;
      updates: Partial<LeadScore>;
    }) => {
      const { data, error } = await supabase
        .from('lead_scores')
        .update(updates)
        .eq('visitor_id', visitorId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotLeads'] });
      queryClient.invalidateQueries({ queryKey: ['allLeads'] });
      toast({
        title: "Lead actualizado",
        description: "La información del lead ha sido actualizada exitosamente.",
      });
    },
  });

  // Funciones de tracking automático
  const trackPageView = useCallback((path?: string) => {
    const currentPath = path || window.location.pathname;
    trackBehaviorEvent.mutate({
      eventType: 'page_view',
      pagePath: currentPath,
      eventData: { timestamp: new Date().toISOString() }
    });
  }, [trackBehaviorEvent]);

  const trackCalculatorUse = useCallback((calculatorData: Record<string, any>) => {
    trackBehaviorEvent.mutate({
      eventType: 'calculator_use',
      pagePath: '/calculadora-valoracion',
      eventData: calculatorData
    });
  }, [trackBehaviorEvent]);

  const trackFormFill = useCallback((formData: Record<string, any>) => {
    trackBehaviorEvent.mutate({
      eventType: 'form_fill',
      pagePath: window.location.pathname,
      eventData: formData
    });
  }, [trackBehaviorEvent]);

  const trackDownload = useCallback((downloadData: Record<string, any>) => {
    trackBehaviorEvent.mutate({
      eventType: 'download',
      pagePath: window.location.pathname,
      eventData: downloadData
    });
  }, [trackBehaviorEvent]);

  const trackTimeOnSite = useCallback((timeInMinutes: number) => {
    // Solo trackear cada minuto completo
    if (timeInMinutes > 0 && timeInMinutes % 1 === 0) {
      trackBehaviorEvent.mutate({
        eventType: 'time_on_site',
        pagePath: window.location.pathname,
        eventData: { timeInMinutes }
      });
    }
  }, [trackBehaviorEvent]);

  // Estadísticas agregadas
  const getLeadStats = useCallback(() => {
    if (!allLeads) return null;

    const totalLeads = allLeads.length;
    const hotLeadsCount = allLeads.filter(lead => lead.is_hot_lead).length;
    const averageScore = allLeads.reduce((sum, lead) => sum + lead.total_score, 0) / totalLeads;
    
    const leadsByStatus = allLeads.reduce((acc, lead) => {
      acc[lead.lead_status] = (acc[lead.lead_status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topSources = allLeads
      .filter(lead => lead.company_domain)
      .reduce((acc, lead) => {
        const domain = lead.company_domain!;
        acc[domain] = (acc[domain] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    return {
      totalLeads,
      hotLeadsCount,
      averageScore: Math.round(averageScore),
      conversionRate: ((leadsByStatus.converted || 0) / totalLeads * 100).toFixed(1),
      leadsByStatus,
      topSources: Object.entries(topSources)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([domain, count]) => ({ domain, count }))
    };
  }, [allLeads]);

  // Auto-tracking de tiempo en sitio
  useEffect(() => {
    let timeCounter = 0;
    const interval = setInterval(() => {
      timeCounter += 1;
      if (timeCounter % 60 === 0) { // Cada minuto
        trackTimeOnSite(timeCounter / 60);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [trackTimeOnSite]);

  // Auto-tracking de page views
  useEffect(() => {
    trackPageView();
    
    // Trackear cambios de ruta
    const handleRouteChange = () => {
      setTimeout(() => trackPageView(), 100);
    };

    window.addEventListener('popstate', handleRouteChange);
    return () => window.removeEventListener('popstate', handleRouteChange);
  }, [trackPageView]);

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
    updateLeadInfo,
    
    // Tracking functions
    trackPageView,
    trackCalculatorUse,
    trackFormFill,
    trackDownload,
    trackTimeOnSite,
    
    // Utils
    getLeadStats,
    currentSession,
    visitorId,
  };
};
