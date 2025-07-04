import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface LeadActivityEvent {
  id: string;
  event_type: string;
  page_path: string;
  event_data: any;
  points_awarded: number;
  created_at: string;
  visitor_id: string;
  session_id: string;
  company_domain?: string;
  utm_source?: string;
  utm_campaign?: string;
}

export interface LeadScoreData {
  id: string;
  visitor_id: string;
  company_name?: string;
  company_domain?: string;
  total_score: number;
  last_activity: string;
  first_visit: string;
  visit_count: number;
  email?: string;
  contact_name?: string;
  lead_status: string;
  is_hot_lead: boolean;
  industry?: string;
  location?: string;
  notes?: string;
}

export const useLeadActivity = (visitorId?: string) => {
  const [activities, setActivities] = useState<LeadActivityEvent[]>([]);
  const [leadScore, setLeadScore] = useState<LeadScoreData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [totalActivity, setTotalActivity] = useState(0);
  const { toast } = useToast();

  // Obtener actividades de un lead específico
  const fetchLeadActivity = async (targetVisitorId: string) => {
    try {
      console.log('🔍 Fetching activity for visitor:', targetVisitorId);
      setIsLoading(true);

      // Obtener eventos de comportamiento
      const { data: events, error: eventsError } = await supabase
        .from('lead_behavior_events')
        .select('*')
        .eq('visitor_id', targetVisitorId)
        .order('created_at', { ascending: false });

      if (eventsError) {
        console.error('❌ Error fetching events:', eventsError);
        throw eventsError;
      }

      // Obtener datos del lead score
      const { data: scoreData, error: scoreError } = await supabase
        .from('lead_scores')
        .select('*')
        .eq('visitor_id', targetVisitorId)
        .single();

      if (scoreError && scoreError.code !== 'PGRST116') {
        console.error('❌ Error fetching lead score:', scoreError);
        throw scoreError;
      }

      setActivities(events || []);
      setLeadScore(scoreData || null);
      setTotalActivity(events?.length || 0);
      
      console.log('✅ Activity loaded:', {
        events: events?.length || 0,
        score: scoreData?.total_score || 0
      });

    } catch (error) {
      console.error('❌ Error in fetchLeadActivity:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar la actividad del lead",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Obtener resumen de actividades recientes de todos los leads
  const fetchRecentActivity = async (limit: number = 20) => {
    try {
      setIsLoading(true);

      const { data: events, error } = await supabase
        .from('lead_behavior_events')
        .select(`
          *,
          lead_scores!inner(
            company_name,
            contact_name,
            total_score,
            is_hot_lead
          )
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      setActivities(events || []);
      setTotalActivity(events?.length || 0);

    } catch (error) {
      console.error('❌ Error fetching recent activity:', error);
      toast({
        title: "Error", 
        description: "No se pudo cargar la actividad reciente",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Obtener métricas de actividad
  const getActivityMetrics = (events: LeadActivityEvent[]) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const todayEvents = events.filter(e => 
      new Date(e.created_at).toDateString() === today.toDateString()
    );
    
    const yesterdayEvents = events.filter(e => 
      new Date(e.created_at).toDateString() === yesterday.toDateString()
    );

    const eventTypes = events.reduce((acc, event) => {
      acc[event.event_type] = (acc[event.event_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalPoints = events.reduce((sum, event) => sum + (event.points_awarded || 0), 0);

    return {
      todayCount: todayEvents.length,
      yesterdayCount: yesterdayEvents.length,
      eventTypes,
      totalPoints,
      avgPointsPerEvent: events.length > 0 ? Math.round(totalPoints / events.length) : 0
    };
  };

  // Auto-fetch si se proporciona visitorId
  useEffect(() => {
    if (visitorId) {
      fetchLeadActivity(visitorId);
    }
  }, [visitorId]);

  return {
    activities,
    leadScore,
    isLoading,
    totalActivity,
    fetchLeadActivity,
    fetchRecentActivity,
    getActivityMetrics: () => getActivityMetrics(activities),
    refreshActivity: () => visitorId ? fetchLeadActivity(visitorId) : fetchRecentActivity()
  };
};