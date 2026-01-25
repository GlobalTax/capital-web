// ============= CR PORTFOLIO INTERACTIONS HOOK =============
// Hook para gestionar interacciones (emails, llamadas, notas) con empresas del portfolio CR

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type InteractionType = 'email' | 'call' | 'meeting' | 'note' | 'linkedin';

export interface CRPortfolioInteraction {
  id: string;
  portfolio_id: string;
  interaction_type: InteractionType;
  subject: string | null;
  body: string | null;
  contact_email: string | null;
  contact_name: string | null;
  sent_at: string;
  created_by: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CreateInteractionData {
  portfolio_id: string;
  interaction_type: InteractionType;
  subject?: string;
  body?: string;
  contact_email?: string;
  contact_name?: string;
  sent_at?: string;
  metadata?: Record<string, any>;
}

// Obtener interacciones de una empresa
export function useCRPortfolioInteractions(portfolioId: string | undefined) {
  return useQuery({
    queryKey: ['cr-portfolio-interactions', portfolioId],
    queryFn: async (): Promise<CRPortfolioInteraction[]> => {
      if (!portfolioId) return [];
      
      const { data, error } = await supabase
        .from('cr_portfolio_interactions')
        .select('*')
        .eq('portfolio_id', portfolioId)
        .order('sent_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(item => ({
        ...item,
        interaction_type: item.interaction_type as InteractionType,
        metadata: (item.metadata || {}) as Record<string, any>,
      }));
    },
    enabled: !!portfolioId,
  });
}

// Crear nueva interacción
export function useCreateCRPortfolioInteraction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateInteractionData) => {
      const { data: result, error } = await supabase
        .from('cr_portfolio_interactions')
        .insert({
          portfolio_id: data.portfolio_id,
          interaction_type: data.interaction_type,
          subject: data.subject || null,
          body: data.body || null,
          contact_email: data.contact_email || null,
          contact_name: data.contact_name || null,
          sent_at: data.sent_at || new Date().toISOString(),
          metadata: data.metadata || {},
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cr-portfolio-interactions', variables.portfolio_id] });
      queryClient.invalidateQueries({ queryKey: ['cr-portfolio-list'] });
      toast.success('Interacción registrada');
    },
    onError: (error) => {
      console.error('Error creating interaction:', error);
      toast.error('Error al registrar la interacción');
    },
  });
}

// Eliminar interacción
export function useDeleteCRPortfolioInteraction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, portfolioId }: { id: string; portfolioId: string }) => {
      const { error } = await supabase
        .from('cr_portfolio_interactions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { id, portfolioId };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['cr-portfolio-interactions', result.portfolioId] });
      queryClient.invalidateQueries({ queryKey: ['cr-portfolio-list'] });
      toast.success('Interacción eliminada');
    },
    onError: (error) => {
      console.error('Error deleting interaction:', error);
      toast.error('Error al eliminar la interacción');
    },
  });
}

// Estadísticas de interacciones
export function useCRPortfolioInteractionStats(portfolioId: string | undefined) {
  return useQuery({
    queryKey: ['cr-portfolio-interaction-stats', portfolioId],
    queryFn: async () => {
      if (!portfolioId) return null;
      
      const { data, error } = await supabase
        .from('cr_portfolio_interactions')
        .select('interaction_type, sent_at')
        .eq('portfolio_id', portfolioId);

      if (error) throw error;

      const stats = {
        total: data?.length || 0,
        byType: {} as Record<InteractionType, number>,
        lastInteraction: null as string | null,
      };

      if (data && data.length > 0) {
        // Contar por tipo
        data.forEach((item) => {
          const type = item.interaction_type as InteractionType;
          stats.byType[type] = (stats.byType[type] || 0) + 1;
        });

        // Última interacción
        const sorted = [...data].sort((a, b) => 
          new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime()
        );
        stats.lastInteraction = sorted[0]?.sent_at || null;
      }

      return stats;
    },
    enabled: !!portfolioId,
  });
}
