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
  valuation_type: 'ebitda_multiple' | 'revenue_multiple';
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

  const duplicateMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data: original, error: fetchError } = await (supabase as any)
        .from('valuation_campaigns')
        .select('*')
        .eq('id', id)
        .single();
      if (fetchError) throw fetchError;

      const { data: { user } } = await supabase.auth.getUser();

      const { id: _id, created_at, updated_at, total_companies, total_created, total_sent, total_errors, total_valuation, ...config } = original;

      const { data: newCampaign, error } = await (supabase as any)
        .from('valuation_campaigns')
        .insert([{
          ...config,
          name: `${original.name} (copia)`,
          status: 'draft',
          created_by: user?.id,
          total_companies: 0,
          total_created: 0,
          total_sent: 0,
          total_errors: 0,
          total_valuation: 0,
        }])
        .select()
        .single();
      if (error) throw error;

      // Copy companies with reset states
      const { data: companies, error: companiesError } = await (supabase as any)
        .from('valuation_campaign_companies')
        .select('*')
        .eq('campaign_id', id);
      if (companiesError) throw companiesError;

      if (companies && companies.length > 0) {
        const clonedCompanies = companies.map((c: any) => ({
          campaign_id: newCampaign.id,
          client_company: c.client_company,
          client_name: c.client_name,
          client_email: c.client_email,
          client_phone: c.client_phone,
          client_cif: c.client_cif,
          ebitda: c.ebitda,
          revenue: c.revenue,
          financial_year: c.financial_year,
          financial_years_data: c.financial_years_data,
          excel_row_number: c.excel_row_number,
          source: c.source,
          custom_multiple: c.custom_multiple,
          normalized_ebitda: c.normalized_ebitda,
          status: 'pending',
          pdf_url: null,
          error_message: null,
          ai_strengths: null,
          ai_weaknesses: null,
          ai_context: null,
          ai_enriched: false,
          valuation_low: null,
          valuation_central: null,
          valuation_high: null,
          multiple_used: null,
          range_label: null,
          follow_up_status: null,
          follow_up_count: 0,
          professional_valuation_id: null,
          is_auto_assigned: false,
          last_interaction_at: null,
        }));

        const { error: insertError } = await (supabase as any)
          .from('valuation_campaign_companies')
          .insert(clonedCompanies);
        if (insertError) throw insertError;

        // Update total_companies counter
        await (supabase as any)
          .from('valuation_campaigns')
          .update({ total_companies: companies.length })
          .eq('id', newCampaign.id);
      }

      return newCampaign as ValuationCampaign;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Campaña duplicada');
    },
    onError: (e: Error) => toast.error('Error al duplicar campaña: ' + e.message),
  });

  return {
    campaigns: campaigns || [],
    isLoading,
    error,
    refetch,
    createCampaign: createMutation.mutateAsync,
    updateCampaign: updateMutation.mutateAsync,
    deleteCampaign: deleteMutation.mutateAsync,
    duplicateCampaign: duplicateMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isDuplicating: duplicateMutation.isPending,
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
