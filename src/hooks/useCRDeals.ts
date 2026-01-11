import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { CRDeal, CRDealWithRelations, CRDealFilters, CRDealFormData } from '@/types/capitalRiesgo';

export function useCRDeals(filters?: CRDealFilters) {
  return useQuery({
    queryKey: ['cr-deals', filters],
    queryFn: async () => {
      let query = supabase
        .from('cr_deals')
        .select('*')
        .eq('is_deleted', false)
        .order('deal_year', { ascending: false });

      if (filters?.search) {
        query = query.or(`company_name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      if (filters?.fund_id) {
        query = query.eq('fund_id', filters.fund_id);
      }

      if (filters?.deal_type) {
        const types = Array.isArray(filters.deal_type) ? filters.deal_type : [filters.deal_type];
        query = query.in('deal_type', types);
      }

      if (filters?.year_from !== undefined) {
        query = query.gte('deal_year', filters.year_from);
      }

      if (filters?.year_to !== undefined) {
        query = query.lte('deal_year', filters.year_to);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as CRDeal[];
    },
  });
}

export function useCRDealsWithRelations(filters?: CRDealFilters) {
  return useQuery({
    queryKey: ['cr-deals-with-relations', filters],
    queryFn: async () => {
      let query = supabase
        .from('cr_deals')
        .select(`
          *,
          fund:cr_funds(id, name, fund_type),
          portfolio:cr_portfolio(id, company_name)
        `)
        .eq('is_deleted', false)
        .order('deal_year', { ascending: false });

      if (filters?.search) {
        query = query.or(`company_name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      if (filters?.fund_id) {
        query = query.eq('fund_id', filters.fund_id);
      }

      if (filters?.deal_type) {
        const types = Array.isArray(filters.deal_type) ? filters.deal_type : [filters.deal_type];
        query = query.in('deal_type', types);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as CRDealWithRelations[];
    },
  });
}

export function useCreateCRDeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CRDealFormData) => {
      const { data: result, error } = await supabase
        .from('cr_deals')
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return result as CRDeal;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cr-deals'] });
      queryClient.invalidateQueries({ queryKey: ['cr-deals-with-relations'] });
      queryClient.invalidateQueries({ queryKey: ['cr-fund', variables.fund_id] });
      toast.success('Deal creado correctamente');
    },
    onError: (error) => {
      console.error('Error creating CR deal:', error);
      toast.error('Error al crear el deal');
    },
  });
}

export function useUpdateCRDeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CRDealFormData> }) => {
      const { data: result, error } = await supabase
        .from('cr_deals')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result as CRDeal;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['cr-deals'] });
      queryClient.invalidateQueries({ queryKey: ['cr-deals-with-relations'] });
      queryClient.invalidateQueries({ queryKey: ['cr-fund', result.fund_id] });
      toast.success('Deal actualizado correctamente');
    },
    onError: (error) => {
      console.error('Error updating CR deal:', error);
      toast.error('Error al actualizar el deal');
    },
  });
}

export function useDeleteCRDeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('cr_deals')
        .update({ is_deleted: true, deleted_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cr-deals'] });
      queryClient.invalidateQueries({ queryKey: ['cr-deals-with-relations'] });
      toast.success('Deal eliminado correctamente');
    },
    onError: (error) => {
      console.error('Error deleting CR deal:', error);
      toast.error('Error al eliminar el deal');
    },
  });
}
