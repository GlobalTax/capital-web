import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { 
  MNABoutiqueDeal, 
  MNABoutiqueDealFilters, 
  MNABoutiqueDealFormData 
} from '@/types/mnaBoutique';

const QUERY_KEY = 'mna-boutique-deals';
const BOUTIQUES_KEY = 'mna-boutiques';

// Fetch deals with filters
export const useMNABoutiqueDeals = (filters: MNABoutiqueDealFilters = {}) => {
  return useQuery({
    queryKey: [QUERY_KEY, filters],
    queryFn: async (): Promise<MNABoutiqueDeal[]> => {
      let query = supabase
        .from('mna_boutique_deals')
        .select(`
          *,
          boutique:mna_boutiques(id, name)
        `)
        .order('deal_year', { ascending: false });

      if (!filters.showDeleted) {
        query = query.eq('is_deleted', false);
      }

      if (filters.boutique_id) {
        query = query.eq('boutique_id', filters.boutique_id);
      }

      if (filters.search) {
        query = query.ilike('company_name', `%${filters.search}%`);
      }

      if (filters.deal_type) {
        query = query.eq('deal_type', filters.deal_type);
      }

      if (filters.year) {
        query = query.eq('deal_year', filters.year);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching MNA boutique deals:', error);
        throw error;
      }

      return (data || []) as MNABoutiqueDeal[];
    },
  });
};

// Create deal
export const useCreateMNABoutiqueDeal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: MNABoutiqueDealFormData): Promise<MNABoutiqueDeal> => {
      const { data: result, error } = await supabase
        .from('mna_boutique_deals')
        .insert(data)
        .select()
        .single();

      if (error) {
        console.error('Error creating MNA boutique deal:', error);
        throw error;
      }

      return result as MNABoutiqueDeal;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [BOUTIQUES_KEY, variables.boutique_id] });
      toast.success('Deal añadido');
    },
    onError: () => {
      toast.error('Error al añadir el deal');
    },
  });
};

// Update deal
export const useUpdateMNABoutiqueDeal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<MNABoutiqueDealFormData> }): Promise<MNABoutiqueDeal> => {
      const { data: result, error } = await supabase
        .from('mna_boutique_deals')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating MNA boutique deal:', error);
        throw error;
      }

      return result as MNABoutiqueDeal;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [BOUTIQUES_KEY] });
      toast.success('Deal actualizado');
    },
    onError: () => {
      toast.error('Error al actualizar el deal');
    },
  });
};

// Delete deal (soft)
export const useDeleteMNABoutiqueDeal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase
        .from('mna_boutique_deals')
        .update({ 
          is_deleted: true, 
          deleted_at: new Date().toISOString() 
        })
        .eq('id', id);

      if (error) {
        console.error('Error deleting MNA boutique deal:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [BOUTIQUES_KEY] });
      toast.success('Deal eliminado');
    },
    onError: () => {
      toast.error('Error al eliminar el deal');
    },
  });
};

// Get unique years for filters
export const useMNABoutiqueDealYears = () => {
  return useQuery({
    queryKey: [QUERY_KEY, 'years'],
    queryFn: async (): Promise<number[]> => {
      const { data, error } = await supabase
        .from('mna_boutique_deals')
        .select('deal_year')
        .eq('is_deleted', false)
        .not('deal_year', 'is', null);

      if (error) throw error;

      const years = [...new Set(data?.map(d => d.deal_year).filter(Boolean))] as number[];
      return years.sort((a, b) => b - a);
    },
  });
};
