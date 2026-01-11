import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SFMatch, SFMatchFilters, SFMatchStatus } from '@/types/searchFunds';
import { toast } from 'sonner';

const SF_MATCHES_KEY = 'sf_matches';

export const useSFMatches = (filters?: SFMatchFilters) => {
  return useQuery({
    queryKey: [SF_MATCHES_KEY, filters],
    queryFn: async () => {
      let query = supabase
        .from('sf_matches')
        .select(`
          *,
          sf_funds (*)
        `)
        .order('match_score', { ascending: false });

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      if (filters?.min_score) {
        query = query.gte('match_score', filters.min_score);
      }
      if (filters?.crm_entity_type) {
        query = query.eq('crm_entity_type', filters.crm_entity_type);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      return data.map((m: any) => ({
        ...m,
        fund: m.sf_funds
      })) as unknown as SFMatch[];
    },
  });
};

export const useSFMatchesForEntity = (entityType: string, entityId: string | undefined) => {
  return useQuery({
    queryKey: [SF_MATCHES_KEY, 'entity', entityType, entityId],
    queryFn: async () => {
      if (!entityId) return [];
      
      const { data, error } = await supabase
        .from('sf_matches')
        .select(`
          *,
          sf_funds (*)
        `)
        .eq('crm_entity_type', entityType)
        .eq('crm_entity_id', entityId)
        .order('match_score', { ascending: false })
        .limit(10);

      if (error) throw error;
      
      return data.map((m: any) => ({
        ...m,
        fund: m.sf_funds
      })) as unknown as SFMatch[];
    },
    enabled: !!entityId,
  });
};

export const useUpdateSFMatchStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: SFMatchStatus }) => {
      const { data, error } = await supabase
        .from('sf_matches')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SF_MATCHES_KEY] });
      toast.success('Estado actualizado');
    },
    onError: (error) => {
      toast.error('Error al actualizar estado');
      console.error(error);
    },
  });
};

export const useRecalculateMatches = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { entityType: string; entityId: string }) => {
      const { data, error } = await supabase.functions.invoke('sf-calculate-matches', {
        body: params,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SF_MATCHES_KEY] });
      toast.success('Matches recalculados');
    },
    onError: (error) => {
      toast.error('Error al recalcular matches');
      console.error(error);
    },
  });
};

export const useRecalculateAllMatches = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('sf-calculate-matches', {
        body: { recalculateAll: true },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SF_MATCHES_KEY] });
      toast.success('Todos los matches recalculados');
    },
    onError: (error) => {
      toast.error('Error al recalcular matches');
      console.error(error);
    },
  });
};
