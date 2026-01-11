import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { CRMatch, CRMatchFilters, CRMatchFormData, CRMatchStatus } from '@/types/capitalRiesgo';

export function useCRMatches(filters?: CRMatchFilters) {
  return useQuery({
    queryKey: ['cr-matches', filters],
    queryFn: async () => {
      let query = supabase
        .from('cr_matches')
        .select(`
          *,
          fund:cr_funds(id, name, fund_type, country_base)
        `)
        .order('match_score', { ascending: false });

      if (filters?.fund_id) {
        query = query.eq('fund_id', filters.fund_id);
      }

      if (filters?.status) {
        const statuses = Array.isArray(filters.status) ? filters.status : [filters.status];
        query = query.in('status', statuses);
      }

      if (filters?.crm_entity_type) {
        query = query.eq('crm_entity_type', filters.crm_entity_type);
      }

      if (filters?.min_score !== undefined) {
        query = query.gte('match_score', filters.min_score);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useCRMatchesByFund(fundId: string | undefined) {
  return useQuery({
    queryKey: ['cr-matches-by-fund', fundId],
    queryFn: async () => {
      if (!fundId) return [];

      const { data, error } = await supabase
        .from('cr_matches')
        .select('*')
        .eq('fund_id', fundId)
        .order('match_score', { ascending: false });

      if (error) throw error;
      return data as CRMatch[];
    },
    enabled: !!fundId,
  });
}

export function useCreateCRMatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CRMatchFormData) => {
      const { data: result, error } = await supabase
        .from('cr_matches')
        .insert(data as any)
        .select()
        .single();

      if (error) throw error;
      return result as CRMatch;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cr-matches'] });
      queryClient.invalidateQueries({ queryKey: ['cr-matches-by-fund', variables.fund_id] });
      queryClient.invalidateQueries({ queryKey: ['cr-fund', variables.fund_id] });
      toast.success('Match creado correctamente');
    },
    onError: (error) => {
      console.error('Error creating CR match:', error);
      toast.error('Error al crear el match');
    },
  });
}

export function useUpdateCRMatchStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: CRMatchStatus; notes?: string }) => {
      const updateData: Record<string, unknown> = { status };
      if (notes !== undefined) {
        updateData.notes = notes;
      }
      if (status === 'contacted') {
        updateData.contacted_at = new Date().toISOString();
      }

      const { data: result, error } = await supabase
        .from('cr_matches')
        .update(updateData as any)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result as CRMatch;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['cr-matches'] });
      queryClient.invalidateQueries({ queryKey: ['cr-matches-by-fund', result.fund_id] });
      toast.success('Estado del match actualizado');
    },
    onError: (error) => {
      console.error('Error updating CR match status:', error);
      toast.error('Error al actualizar el estado');
    },
  });
}

export function useDeleteCRMatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('cr_matches')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cr-matches'] });
      toast.success('Match eliminado correctamente');
    },
    onError: (error) => {
      console.error('Error deleting CR match:', error);
      toast.error('Error al eliminar el match');
    },
  });
}

// Bulk operations
export function useBulkUpdateCRMatchStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ids, status }: { ids: string[]; status: CRMatchStatus }) => {
      const { error } = await supabase
        .from('cr_matches')
        .update({ status })
        .in('id', ids);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cr-matches'] });
      toast.success('Estados actualizados correctamente');
    },
    onError: (error) => {
      console.error('Error bulk updating CR match status:', error);
      toast.error('Error al actualizar los estados');
    },
  });
}
