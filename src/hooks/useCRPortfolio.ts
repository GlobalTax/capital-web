import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { CRPortfolio, CRPortfolioWithFund, CRPortfolioFilters, CRPortfolioFormData } from '@/types/capitalRiesgo';

export function useCRPortfolio(filters?: CRPortfolioFilters) {
  return useQuery({
    queryKey: ['cr-portfolio', filters],
    queryFn: async () => {
      let query = supabase
        .from('cr_portfolio')
        .select('*')
        .eq('is_deleted', false)
        .order('company_name', { ascending: true });

      if (filters?.search) {
        query = query.or(`company_name.ilike.%${filters.search}%,sector.ilike.%${filters.search}%`);
      }

      if (filters?.fund_id) {
        query = query.eq('fund_id', filters.fund_id);
      }

      if (filters?.status) {
        const statuses = Array.isArray(filters.status) ? filters.status : [filters.status];
        query = query.in('status', statuses);
      }

      if (filters?.sector) {
        query = query.eq('sector', filters.sector);
      }

      if (filters?.country) {
        query = query.eq('country', filters.country);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as CRPortfolio[];
    },
  });
}

export function useCRPortfolioWithFunds(filters?: CRPortfolioFilters) {
  return useQuery({
    queryKey: ['cr-portfolio-with-funds', filters],
    queryFn: async () => {
      let query = supabase
        .from('cr_portfolio')
        .select(`
          *,
          fund:cr_funds!inner(id, name, fund_type)
        `)
        .eq('is_deleted', false)
        .order('company_name', { ascending: true });

      if (filters?.search) {
        query = query.or(`company_name.ilike.%${filters.search}%,sector.ilike.%${filters.search}%`);
      }

      if (filters?.fund_id) {
        query = query.eq('fund_id', filters.fund_id);
      }

      if (filters?.status) {
        const statuses = Array.isArray(filters.status) ? filters.status : [filters.status];
        query = query.in('status', statuses);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      // Transform the data to match CRPortfolioWithFund interface
      return (data || []).map(item => ({
        ...item,
        fund: item.fund ? {
          id: item.fund.id,
          name: item.fund.name,
          fund_type: item.fund.fund_type,
        } as Pick<import('@/types/capitalRiesgo').CRFund, 'id' | 'name' | 'fund_type'> : undefined,
      })) as unknown as CRPortfolioWithFund[];
    },
  });
}

export function useCreateCRPortfolio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CRPortfolioFormData) => {
      const { data: result, error } = await supabase
        .from('cr_portfolio')
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return result as CRPortfolio;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cr-portfolio'] });
      queryClient.invalidateQueries({ queryKey: ['cr-portfolio-with-funds'] });
      queryClient.invalidateQueries({ queryKey: ['cr-fund', variables.fund_id] });
      toast.success('Participada creada correctamente');
    },
    onError: (error) => {
      console.error('Error creating CR portfolio:', error);
      toast.error('Error al crear la participada');
    },
  });
}

export function useUpdateCRPortfolio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CRPortfolioFormData> }) => {
      const { data: result, error } = await supabase
        .from('cr_portfolio')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result as CRPortfolio;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['cr-portfolio'] });
      queryClient.invalidateQueries({ queryKey: ['cr-portfolio-with-funds'] });
      queryClient.invalidateQueries({ queryKey: ['cr-fund', result.fund_id] });
      toast.success('Participada actualizada correctamente');
    },
    onError: (error) => {
      console.error('Error updating CR portfolio:', error);
      toast.error('Error al actualizar la participada');
    },
  });
}

export function useDeleteCRPortfolio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('cr_portfolio')
        .update({ is_deleted: true, deleted_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cr-portfolio'] });
      queryClient.invalidateQueries({ queryKey: ['cr-portfolio-with-funds'] });
      toast.success('Participada eliminada correctamente');
    },
    onError: (error) => {
      console.error('Error deleting CR portfolio:', error);
      toast.error('Error al eliminar la participada');
    },
  });
}
