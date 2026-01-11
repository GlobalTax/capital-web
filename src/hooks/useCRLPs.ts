import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { CRLP, CRLPFilters, CRLPFormData, CRFundLP, CRFundLPFormData, CRFundLPWithRelations } from '@/types/capitalRiesgo';

export function useCRLPs(filters?: CRLPFilters) {
  return useQuery({
    queryKey: ['cr-lps', filters],
    queryFn: async () => {
      let query = supabase
        .from('cr_lps')
        .select('*')
        .eq('is_deleted', false)
        .order('name', { ascending: true });

      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,contact_name.ilike.%${filters.search}%`);
      }

      if (filters?.type) {
        const types = Array.isArray(filters.type) ? filters.type : [filters.type];
        query = query.in('type', types);
      }

      if (filters?.country) {
        query = query.eq('country', filters.country);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as CRLP[];
    },
  });
}

export function useCRLP(id: string | undefined) {
  return useQuery({
    queryKey: ['cr-lp', id],
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from('cr_lps')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as CRLP;
    },
    enabled: !!id,
  });
}

export function useCreateCRLP() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CRLPFormData) => {
      const { data: result, error } = await supabase
        .from('cr_lps')
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return result as CRLP;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cr-lps'] });
      toast.success('LP creado correctamente');
    },
    onError: (error) => {
      console.error('Error creating CR LP:', error);
      toast.error('Error al crear el LP');
    },
  });
}

export function useUpdateCRLP() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CRLPFormData> }) => {
      const { data: result, error } = await supabase
        .from('cr_lps')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result as CRLP;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['cr-lps'] });
      queryClient.invalidateQueries({ queryKey: ['cr-lp', result.id] });
      toast.success('LP actualizado correctamente');
    },
    onError: (error) => {
      console.error('Error updating CR LP:', error);
      toast.error('Error al actualizar el LP');
    },
  });
}

export function useDeleteCRLP() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('cr_lps')
        .update({ is_deleted: true, deleted_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cr-lps'] });
      toast.success('LP eliminado correctamente');
    },
    onError: (error) => {
      console.error('Error deleting CR LP:', error);
      toast.error('Error al eliminar el LP');
    },
  });
}

// Fund-LP relationship hooks
export function useCRFundLPs(fundId: string | undefined) {
  return useQuery({
    queryKey: ['cr-fund-lps', fundId],
    queryFn: async () => {
      if (!fundId) return [];

      const { data, error } = await supabase
        .from('cr_fund_lps')
        .select(`
          *,
          lp:cr_lps(*)
        `)
        .eq('fund_id', fundId);

      if (error) throw error;
      return data as CRFundLPWithRelations[];
    },
    enabled: !!fundId,
  });
}

export function useCreateCRFundLP() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CRFundLPFormData) => {
      const { data: result, error } = await supabase
        .from('cr_fund_lps')
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return result as CRFundLP;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cr-fund-lps', variables.fund_id] });
      queryClient.invalidateQueries({ queryKey: ['cr-fund', variables.fund_id] });
      toast.success('LP asociado correctamente');
    },
    onError: (error) => {
      console.error('Error creating CR fund-LP relation:', error);
      toast.error('Error al asociar el LP');
    },
  });
}

export function useDeleteCRFundLP() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, fundId }: { id: string; fundId: string }) => {
      const { error } = await supabase
        .from('cr_fund_lps')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return fundId;
    },
    onSuccess: (fundId) => {
      queryClient.invalidateQueries({ queryKey: ['cr-fund-lps', fundId] });
      queryClient.invalidateQueries({ queryKey: ['cr-fund', fundId] });
      toast.success('LP desasociado correctamente');
    },
    onError: (error) => {
      console.error('Error deleting CR fund-LP relation:', error);
      toast.error('Error al desasociar el LP');
    },
  });
}
