
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface LeadScore {
  id: string;
  visitor_id: string;
  company_domain?: string;
  company_name?: string;
  industry?: string;
  total_score: number;
  is_hot_lead: boolean;
  last_activity: string;
  visit_count: number;
  email?: string;
  phone?: string;
  contact_name?: string;
  lead_status: string;
}

interface LeadAlert {
  id: string;
  lead_score_id: string;
  alert_type: string;
  message: string;
  is_read: boolean;
  priority: string;
  created_at: string;
  lead_score?: LeadScore;
}

export const useLeadScoringCore = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
        .limit(20);

      if (error) {
        if (error.code === 'PGRST301' || error.message?.includes('row-level security')) {
          console.warn('No admin access to hot leads');
          return [];
        }
        throw error;
      }
      return data as LeadScore[];
    },
    staleTime: 60000, // 1 minuto
    refetchOnWindowFocus: false,
  });

  // Obtener todos los leads
  const { data: allLeads, isLoading: isLoadingAllLeads } = useQuery({
    queryKey: ['allLeads'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lead_scores')
        .select('*')
        .order('total_score', { ascending: false })
        .limit(100);

      if (error) {
        if (error.code === 'PGRST301' || error.message?.includes('row-level security')) {
          console.warn('No admin access to all leads');
          return [];
        }
        throw error;
      }
      return data as LeadScore[];
    },
    staleTime: 120000, // 2 minutos
    refetchOnWindowFocus: false,
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
        .limit(10);

      if (error) {
        if (error.code === 'PGRST301' || error.message?.includes('row-level security')) {
          console.warn('No admin access to alerts');
          return [];
        }
        throw error;
      }
      return data as LeadAlert[];
    },
    staleTime: 30000, // 30 segundos
    refetchOnWindowFocus: false,
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
      toast({
        title: "Alerta marcada como leída",
        description: "La alerta ha sido procesada correctamente.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo marcar la alerta como leída.",
        variant: "destructive",
      });
    },
  });

  // Estadísticas calculadas
  const getLeadStats = () => {
    if (!allLeads || allLeads.length === 0) {
      return {
        totalLeads: 0,
        hotLeadsCount: 0,
        averageScore: 0,
        leadsByStatus: {},
      };
    }

    const totalLeads = allLeads.length;
    const hotLeadsCount = allLeads.filter(lead => lead.is_hot_lead).length;
    const averageScore = Math.round(
      allLeads.reduce((sum, lead) => sum + lead.total_score, 0) / totalLeads
    );
    
    const leadsByStatus = allLeads.reduce((acc, lead) => {
      acc[lead.lead_status] = (acc[lead.lead_status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalLeads,
      hotLeadsCount,
      averageScore,
      leadsByStatus,
    };
  };

  return {
    hotLeads,
    allLeads,
    unreadAlerts,
    isLoadingHotLeads,
    isLoadingAllLeads,
    markAlertAsRead,
    getLeadStats,
  };
};
