import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const QUERY_KEY = 'valuation-campaigns';

export interface ValuationCampaign {
  id: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  name: string;
  sector: string;
  status: string;
  custom_multiple: number | null;
  multiple_low: number | null;
  multiple_high: number | null;
  valuation_context: string | null;
  strengths_template: string | null;
  weaknesses_template: string | null;
  comparables_text: string | null;
  include_comparables: boolean;
  ai_personalize: boolean;
  advisor_name: string | null;
  advisor_email: string | null;
  advisor_phone: string | null;
  advisor_role: string | null;
  use_custom_advisor: boolean;
  lead_source: string;
  service_type: string;
  financial_years: number[] | null;
  years_mode: string;
  total_companies: number;
  total_created: number;
  total_sent: number;
  total_errors: number;
  total_valuation: number;
}

export type CampaignInsert = Omit<ValuationCampaign, 'id' | 'created_at' | 'updated_at' | 'total_companies' | 'total_created' | 'total_sent' | 'total_errors' | 'total_valuation'>;

export function useCampaigns() {
  const queryClient = useQueryClient();

  const { data: campaigns, isLoading, error, refetch } = useQuery({
    queryKey: [QUERY_KEY],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('valuation_campaigns')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as ValuationCampaign[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (campaign: Partial<CampaignInsert>) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await (supabase as any)
        .from('valuation_campaigns')
        .insert([{ ...campaign, created_by: user?.id }])
        .select()
        .single();
      if (error) throw error;
      return data as ValuationCampaign;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Campaña creada');
    },
    onError: (e: Error) => toast.error('Error al crear campaña: ' + e.message),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data: updateData }: { id: string; data: Partial<ValuationCampaign> }) => {
      const { data, error } = await (supabase as any)
        .from('valuation_campaigns')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as ValuationCampaign;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
    onError: (e: Error) => toast.error('Error al actualizar campaña: ' + e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from('valuation_campaigns')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Campaña eliminada');
    },
    onError: (e: Error) => toast.error('Error al eliminar campaña: ' + e.message),
  });

  return {
    campaigns: campaigns || [],
    isLoading,
    error,
    refetch,
    createCampaign: createMutation.mutateAsync,
    updateCampaign: updateMutation.mutateAsync,
    deleteCampaign: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

export function useCampaign(id: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await (supabase as any)
        .from('valuation_campaigns')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as ValuationCampaign;
    },
    enabled: !!id,
  });
}
