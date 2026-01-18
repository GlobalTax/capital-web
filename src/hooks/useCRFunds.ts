import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { CRFund, CRFundWithRelations, CRFundFilters, CRFundFormData } from '@/types/capitalRiesgo';

export function useCRFunds(filters?: CRFundFilters) {
  return useQuery({
    queryKey: ['cr-funds', filters],
    queryFn: async () => {
      let query = supabase
        .from('cr_funds')
        .select(`
          *,
          people_count:cr_people(count)
        `)
        .eq('is_deleted', false)
        .order('name', { ascending: true });

      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      if (filters?.status) {
        const statuses = Array.isArray(filters.status) ? filters.status : [filters.status];
        query = query.in('status', statuses);
      }

      if (filters?.fund_type) {
        const types = Array.isArray(filters.fund_type) ? filters.fund_type : [filters.fund_type];
        query = query.in('fund_type', types);
      }

      if (filters?.country) {
        query = query.eq('country_base', filters.country);
      }

      if (filters?.ebitda_min !== undefined) {
        query = query.gte('ebitda_max', filters.ebitda_min);
      }

      if (filters?.ebitda_max !== undefined) {
        query = query.lte('ebitda_min', filters.ebitda_max);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      // Process people count from aggregation
      return (data || []).map(fund => ({
        ...fund,
        people_count: (fund.people_count as any)?.[0]?.count || 0
      })) as (CRFund & { people_count: number })[];
    },
  });
}

export function useCRFund(id: string | undefined) {
  return useQuery({
    queryKey: ['cr-fund', id],
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from('cr_funds')
        .select(`
          *,
          people:cr_people(*),
          portfolio:cr_portfolio(*),
          deals:cr_deals(*),
          matches:cr_matches(*),
          fund_lps:cr_fund_lps(*, lp:cr_lps(*))
        `)
        .eq('id', id)
        .eq('is_deleted', false)
        .single();

      if (error) throw error;
      return data as CRFundWithRelations;
    },
    enabled: !!id,
  });
}

export function useCreateCRFund() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CRFundFormData) => {
      const { data: result, error } = await supabase
        .from('cr_funds')
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return result as CRFund;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cr-funds'] });
      toast.success('Fondo creado correctamente');
    },
    onError: (error) => {
      console.error('Error creating CR fund:', error);
      toast.error('Error al crear el fondo');
    },
  });
}

export function useUpdateCRFund() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CRFundFormData> }) => {
      const { data: result, error } = await supabase
        .from('cr_funds')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result as CRFund;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['cr-funds'] });
      queryClient.invalidateQueries({ queryKey: ['cr-fund', id] });
      toast.success('Fondo actualizado correctamente');
    },
    onError: (error) => {
      console.error('Error updating CR fund:', error);
      toast.error('Error al actualizar el fondo');
    },
  });
}

export function useDeleteCRFund() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // Soft delete
      const { error } = await supabase
        .from('cr_funds')
        .update({ is_deleted: true, deleted_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cr-funds'] });
      toast.success('Fondo eliminado correctamente');
    },
    onError: (error) => {
      console.error('Error deleting CR fund:', error);
      toast.error('Error al eliminar el fondo');
    },
  });
}
