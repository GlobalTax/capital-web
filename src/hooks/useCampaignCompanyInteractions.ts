import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const QUERY_KEY = 'campaign-company-interactions';

export interface CampaignCompanyInteraction {
  id: string;
  campaign_company_id: string;
  tipo: 'email_followup' | 'llamada' | 'whatsapp' | 'reunion' | 'respuesta_cliente' | 'nota';
  titulo: string;
  descripcion: string | null;
  resultado: 'positivo' | 'neutral' | 'negativo' | 'sin_respuesta' | null;
  fecha: string;
  created_by: string | null;
  created_at: string;
}

export const INTERACTION_TYPES = [
  { value: 'email_followup', label: 'Email de seguimiento', icon: '📧' },
  { value: 'llamada', label: 'Llamada', icon: '📞' },
  { value: 'whatsapp', label: 'WhatsApp', icon: '💬' },
  { value: 'reunion', label: 'Reunión', icon: '🤝' },
  { value: 'respuesta_cliente', label: 'Respuesta del cliente', icon: '💌' },
  { value: 'nota', label: 'Nota interna', icon: '📝' },
] as const;

export const INTERACTION_RESULTS = [
  { value: 'positivo', label: 'Positivo', color: 'text-green-600' },
  { value: 'neutral', label: 'Neutral', color: 'text-yellow-600' },
  { value: 'negativo', label: 'Negativo', color: 'text-red-600' },
  { value: 'sin_respuesta', label: 'Sin respuesta', color: 'text-muted-foreground' },
] as const;

export const FOLLOW_UP_STATUSES = [
  { value: 'none', label: 'Sin seguimiento', variant: 'secondary' as const },
  { value: 'followup_1', label: 'Follow-up 1', variant: 'outline' as const },
  { value: 'followup_2', label: 'Follow-up 2', variant: 'outline' as const },
  { value: 'contacted', label: 'Contactado', variant: 'default' as const },
  { value: 'interested', label: 'Interesado', variant: 'default' as const },
  { value: 'not_interested', label: 'No interesado', variant: 'destructive' as const },
  { value: 'meeting_scheduled', label: 'Reunión', variant: 'default' as const },
  { value: 'closed', label: 'Cerrado', variant: 'default' as const },
] as const;

export function useCampaignCompanyInteractions(campaignCompanyId: string | undefined) {
  const queryClient = useQueryClient();
  const queryKey = [QUERY_KEY, campaignCompanyId];

  const { data: interactions, isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!campaignCompanyId) return [];
      const { data, error } = await (supabase as any)
        .from('campaign_company_interactions')
        .select('*')
        .eq('campaign_company_id', campaignCompanyId)
        .order('fecha', { ascending: false });
      if (error) throw error;
      return data as CampaignCompanyInteraction[];
    },
    enabled: !!campaignCompanyId,
  });

  const addInteraction = useMutation({
    mutationFn: async (input: {
      campaign_company_id: string;
      tipo: string;
      titulo: string;
      descripcion?: string;
      resultado?: string;
      fecha?: string;
      follow_up_status?: string;
    }) => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;

      // 1. Insert interaction
      const { error: insertError } = await (supabase as any)
        .from('campaign_company_interactions')
        .insert({
          campaign_company_id: input.campaign_company_id,
          tipo: input.tipo,
          titulo: input.titulo,
          descripcion: input.descripcion || null,
          resultado: input.resultado || null,
          fecha: input.fecha || new Date().toISOString(),
          created_by: userId,
        });
      if (insertError) throw insertError;

      // 2. Get current count
      const { data: countData } = await (supabase as any)
        .from('campaign_company_interactions')
        .select('id', { count: 'exact', head: true })
        .eq('campaign_company_id', input.campaign_company_id);

      const newCount = countData?.length ?? 1;

      // 3. Update parent record
      const updateData: Record<string, any> = {
        follow_up_count: newCount,
        last_interaction_at: input.fecha || new Date().toISOString(),
      };
      if (input.follow_up_status) {
        updateData.follow_up_status = input.follow_up_status;
      }
      await (supabase as any)
        .from('valuation_campaign_companies')
        .update(updateData)
        .eq('id', input.campaign_company_id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: ['valuation-campaign-companies'] });
      toast.success('Interacción registrada');
    },
    onError: (e: Error) => toast.error('Error: ' + e.message),
  });

  const deleteInteraction = useMutation({
    mutationFn: async ({ id, campaignCompanyId }: { id: string; campaignCompanyId: string }) => {
      const { error } = await (supabase as any)
        .from('campaign_company_interactions')
        .delete()
        .eq('id', id);
      if (error) throw error;

      // Update count
      const { count } = await (supabase as any)
        .from('campaign_company_interactions')
        .select('id', { count: 'exact', head: true })
        .eq('campaign_company_id', campaignCompanyId);

      await (supabase as any)
        .from('valuation_campaign_companies')
        .update({ follow_up_count: count || 0 })
        .eq('id', campaignCompanyId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: ['valuation-campaign-companies'] });
      toast.success('Interacción eliminada');
    },
    onError: (e: Error) => toast.error('Error: ' + e.message),
  });

  return {
    interactions: interactions || [],
    isLoading,
    addInteraction: addInteraction.mutateAsync,
    deleteInteraction: deleteInteraction.mutateAsync,
    isAdding: addInteraction.isPending,
    isDeleting: deleteInteraction.isPending,
  };
}
