import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRateLimit } from './useRateLimit';
import { useOptimizedQuery, useSmartInvalidation } from './useOptimizedQueries';
import { usePerformanceMonitoring } from './usePerformanceMonitoring';
import { LeadEventData } from '@/types/leadEvents';
import { DatabaseError, NetworkError, RateLimitError } from '@/types/errorTypes';
import { logger } from '@/utils/logger';

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
  event_data: Record<string, unknown>;
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
  const { invalidateRelatedQueries } = useSmartInvalidation();
  const { recordQueryPerformance, recordRateLimitHit } = usePerformanceMonitoring();
  const [currentSession] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [visitorId] = useState(() => {
    const stored = localStorage.getItem('visitor_id');
    if (stored) return stored;
    
    const newId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('visitor_id', newId);
    return newId;
  });

  // Rate limiting optimizado y debouncing
  const lastTrackingTime = useRef(0);
  const trackingCooldown = 5000; // 5 segundos entre trackings
  
  const { executeWithRateLimit, isRateLimited: checkRateLimit } = useRateLimit({
    maxRequests: 10,
    windowMs: 60000, // 1 minuto
    blockDurationMs: 30000, // 30 segundos de bloqueo
  });

  // Debounce tracking calls
  const canTrack = useCallback(() => {
    const now = Date.now();
    if (now - lastTrackingTime.current < trackingCooldown) {
      return false;
    }
    lastTrackingTime.current = now;
    return true;
  }, []);

  // Obtener reglas de scoring optimizadas
  const { data: scoringRules } = useOptimizedQuery(
    ['leadScoringRules'],
    async () => {
      const startTime = performance.now();
      const { data, error } = await supabase
        .from('lead_scoring_rules')
        .select('*')
        .eq('is_active', true)
        .order('points', { ascending: false });

      const executionTime = performance.now() - startTime;
      recordQueryPerformance('leadScoringRules', executionTime, false, !!error);

      if (error) {
        if (error.code === 'PGRST301' || error.message?.includes('row-level security')) {
          console.warn('No admin access to scoring rules, using public rules only');
          return [];
        }
        throw error;
      }
      return data as LeadScoringRule[];
    },
    'persistent' // Reglas cambian raramente
  );

  // Obtener leads calientes (con stale time)
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

      if (error) {
        if (error.code === 'PGRST301' || error.message?.includes('row-level security')) {
          console.warn('No admin access to hot leads');
          return [];
        }
        throw error;
      }
      return data as LeadScore[];
    },
    staleTime: 120000, // 2 minutos
    refetchOnWindowFocus: false,
  });

  // Obtener todas las puntuaciones de leads (con stale time)
  const { data: allLeads, isLoading: isLoadingAllLeads } = useQuery({
    queryKey: ['allLeads'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lead_scores')
        .select('*')
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
    staleTime: 180000, // 3 minutos
    refetchOnWindowFocus: false,
  });

  // Obtener alertas no leídas (con stale time)
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

      if (error) {
        if (error.code === 'PGRST301' || error.message?.includes('row-level security')) {
          console.warn('No admin access to alerts');
          return [];
        }
        throw error;
      }
      return data as LeadAlert[];
    },
    staleTime: 60000, // 1 minuto
    refetchOnWindowFocus: false,
  });

  // Registrar evento de comportamiento (con rate limiting)
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
      // Rate limiting check
      if (checkRateLimit('tracking')) {
        throw new RateLimitError('Rate limited for tracking operations');
      }

      // Encontrar regla aplicable con fallback si no hay acceso admin
      const applicableRule = (scoringRules as LeadScoringRule[] || []).find(rule => {
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
          utm_source: new URLSearchParams(window.location.search).get('utm_source'),
          utm_medium: new URLSearchParams(window.location.search).get('utm_medium'),
          utm_campaign: new URLSearchParams(window.location.search).get('utm_campaign'),
        })
        .select()
        .single();

      if (error) {
        throw new DatabaseError('Failed to insert behavior event', 'INSERT', { eventType, error: error.message });
      }
      return data;
    },
    onSuccess: () => {
      // Invalidación inteligente optimizada
      invalidateRelatedQueries('leads', 1500);
    },
    onError: (error) => {
      if (error instanceof RateLimitError) {
        recordRateLimitHit('tracking');
        logger.warn('Rate limit hit for tracking', { operation: 'tracking' });
      } else if (error instanceof DatabaseError) {
        logger.error('Database error in tracking');
      } else {
        logger.error('Unknown error in tracking');
      }
    },
  });

  // Marcar alerta como leída
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

      if (error) {
        if (error.message?.includes('row-level security')) {
          throw new Error('No tienes permisos para actualizar leads. Se requiere acceso de administrador.');
        }
        throw error;
      }
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
    onError: (error: Error) => {
      toast({
        title: "Error al actualizar lead",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Funciones de tracking con rate limiting
  const trackPageView = useCallback((path?: string) => {
    if (!canTrack()) return;
    
    const currentPath = path || window.location.pathname;
    logger.debug('Tracking page view', { path: currentPath });
    
    trackBehaviorEvent.mutate({
      eventType: 'page_view',
      pagePath: currentPath,
      eventData: { 
        timestamp: new Date().toISOString(),
        referrer: document.referrer || undefined,
        utm_source: new URLSearchParams(window.location.search).get('utm_source') || undefined,
        utm_medium: new URLSearchParams(window.location.search).get('utm_medium') || undefined,
        utm_campaign: new URLSearchParams(window.location.search).get('utm_campaign') || undefined
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

  const trackTimeOnSite = useCallback((timeInMinutes: number, pagesVisited?: number) => {
    if (!canTrack()) return;
    
    // Solo trackear cada minuto completo
    if (timeInMinutes > 0 && timeInMinutes % 1 === 0) {
      trackBehaviorEvent.mutate({
        eventType: 'time_on_site',
        pagePath: window.location.pathname,
        eventData: { 
          timestamp: new Date().toISOString(),
          time_minutes: timeInMinutes,
          pages_visited: pagesVisited || 1
        }
      });
    }
  }, [trackBehaviorEvent, canTrack]);

  // Estadísticas agregadas
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

  // Auto-tracking de tiempo en sitio (DESHABILITADO para evitar bucles)
  /*
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
  */

  // Auto-tracking de page views (DESHABILITADO para evitar bucles)
  /*
  useEffect(() => {
    trackPageView();
    
    // Trackear cambios de ruta
    const handleRouteChange = () => {
      setTimeout(() => trackPageView(), 100);
    };

    window.addEventListener('popstate', handleRouteChange);
    return () => window.removeEventListener('popstate', handleRouteChange);
  }, [trackPageView]);
  */

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
