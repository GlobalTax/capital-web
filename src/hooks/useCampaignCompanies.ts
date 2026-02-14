import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const QUERY_KEY = 'valuation-campaign-companies';

export interface FinancialYearData {
  year: number;
  revenue: number;
  ebitda: number;
}

export interface CampaignCompany {
  id: string;
  campaign_id: string;
  created_at: string;
  client_company: string;
  client_name: string | null;
  client_email: string | null;
  client_phone: string | null;
  client_cif: string | null;
  revenue: number | null;
  ebitda: number;
  financial_year: number;
  financial_years_data: FinancialYearData[] | null;
  ai_strengths: string | null;
  ai_weaknesses: string | null;
  ai_context: string | null;
  ai_enriched: boolean;
  custom_multiple: number | null;
  valuation_low: number | null;
  valuation_central: number | null;
  valuation_high: number | null;
  normalized_ebitda: number | null;
  multiple_used: number | null;
  status: string;
  error_message: string | null;
  professional_valuation_id: string | null;
  pdf_url: string | null;
  source: string;
  excel_row_number: number | null;
}

export type CampaignCompanyInsert = Omit<CampaignCompany, 'id' | 'created_at'>;

export function useCampaignCompanies(campaignId: string | undefined) {
  const queryClient = useQueryClient();
  const queryKey = [QUERY_KEY, campaignId];

  const { data: companies, isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!campaignId) return [];
      const { data, error } = await (supabase as any)
        .from('valuation_campaign_companies')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data as CampaignCompany[];
    },
    enabled: !!campaignId,
  });

  const addMutation = useMutation({
    mutationFn: async (company: Partial<CampaignCompanyInsert>) => {
      const { data, error } = await (supabase as any)
        .from('valuation_campaign_companies')
        .insert([{ ...company, campaign_id: campaignId }])
        .select()
        .single();
      if (error) throw error;
      return data as CampaignCompany;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
    onError: (e: Error) => toast.error('Error al añadir empresa: ' + e.message),
  });

  const bulkAddMutation = useMutation({
    mutationFn: async (rows: Partial<CampaignCompanyInsert>[]) => {
      const withCampaign = rows.map(r => ({ ...r, campaign_id: campaignId }));
      const { data, error } = await (supabase as any)
        .from('valuation_campaign_companies')
        .insert(withCampaign)
        .select();
      if (error) throw error;
      return data as CampaignCompany[];
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey });
      toast.success(`${data.length} empresas importadas`);
    },
    onError: (e: Error) => toast.error('Error en importación: ' + e.message),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data: updateData }: { id: string; data: Partial<CampaignCompany> }) => {
      const { data, error } = await (supabase as any)
        .from('valuation_campaign_companies')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as CampaignCompany;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
    onError: (e: Error) => toast.error('Error al actualizar: ' + e.message),
  });

  const bulkUpdateMutation = useMutation({
    mutationFn: async (updates: { id: string; data: Partial<CampaignCompany> }[]) => {
      // Procesar en lotes de 20 en paralelo para evitar saturar Supabase
      const BATCH_SIZE = 20;
      for (let i = 0; i < updates.length; i += BATCH_SIZE) {
        const batch = updates.slice(i, i + BATCH_SIZE);
        const results = await Promise.all(
          batch.map(u =>
            (supabase as any)
              .from('valuation_campaign_companies')
              .update(u.data)
              .eq('id', u.id)
          )
        );
        const failed = results.find(r => r.error);
        if (failed?.error) throw failed.error;
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
    onError: (e: Error) => toast.error('Error en actualización masiva: ' + e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from('valuation_campaign_companies')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
    onError: (e: Error) => toast.error('Error al eliminar: ' + e.message),
  });

  const stats = {
    total: companies?.length || 0,
    withEmail: companies?.filter(c => c.client_email).length || 0,
    withoutEbitda: companies?.filter(c => !c.ebitda).length || 0,
    calculated: companies?.filter(c => c.status === 'calculated').length || 0,
    created: companies?.filter(c => c.status === 'created').length || 0,
    sent: companies?.filter(c => c.status === 'sent').length || 0,
    failed: companies?.filter(c => c.status === 'failed').length || 0,
    totalValuation: companies?.reduce((sum, c) => sum + (c.valuation_central || 0), 0) || 0,
  };

  return {
    companies: companies || [],
    isLoading,
    error,
    refetch,
    stats,
    addCompany: addMutation.mutateAsync,
    bulkAddCompanies: bulkAddMutation.mutateAsync,
    updateCompany: updateMutation.mutateAsync,
    bulkUpdateCompanies: bulkUpdateMutation.mutateAsync,
    deleteCompany: deleteMutation.mutateAsync,
    isAdding: addMutation.isPending,
    isBulkAdding: bulkAddMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
