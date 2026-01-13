import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { 
  MNABoutique, 
  MNABoutiqueFilters, 
  MNABoutiqueFormData 
} from '@/types/mnaBoutique';

const QUERY_KEY = 'mna-boutiques';

// Fetch all boutiques with filters
export const useMNABoutiques = (filters: MNABoutiqueFilters = {}) => {
  return useQuery({
    queryKey: [QUERY_KEY, filters],
    queryFn: async (): Promise<MNABoutique[]> => {
      let query = supabase
        .from('mna_boutiques')
        .select('*')
        .order('name', { ascending: true });

      // Apply filters
      if (!filters.showDeleted) {
        query = query.eq('is_deleted', false);
      }

      if (filters.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.tier) {
        query = query.eq('tier', filters.tier);
      }

      if (filters.country) {
        query = query.eq('country_base', filters.country);
      }

      if (filters.specialization) {
        query = query.contains('specialization', [filters.specialization]);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching MNA boutiques:', error);
        throw error;
      }

      return (data || []) as MNABoutique[];
    },
  });
};

// Fetch single boutique with relations
export const useMNABoutique = (id: string | undefined) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: async (): Promise<MNABoutique | null> => {
      if (!id) return null;

      const { data, error } = await supabase
        .from('mna_boutiques')
        .select(`
          *,
          people:mna_boutique_people(*)
        `)
        .eq('id', id)
        .eq('is_deleted', false)
        .single();

      if (error) {
        console.error('Error fetching MNA boutique:', error);
        throw error;
      }

      // Fetch deals separately due to supabase query limitations
      const { data: deals } = await supabase
        .from('mna_boutique_deals')
        .select('*')
        .eq('boutique_id', id)
        .eq('is_deleted', false)
        .order('deal_year', { ascending: false });

      return {
        ...data,
        people: data.people?.filter((p: any) => !p.is_deleted) || [],
        deals: deals || [],
      } as MNABoutique;
    },
    enabled: !!id,
  });
};

// Create boutique
export const useCreateMNABoutique = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: MNABoutiqueFormData): Promise<MNABoutique> => {
      const { data: result, error } = await supabase
        .from('mna_boutiques')
        .insert(data)
        .select()
        .single();

      if (error) {
        console.error('Error creating MNA boutique:', error);
        throw error;
      }

      return result as MNABoutique;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Boutique creada correctamente');
    },
    onError: (error: any) => {
      if (error.code === '23505') {
        toast.error('Ya existe una boutique con ese nombre');
      } else {
        toast.error('Error al crear la boutique');
      }
    },
  });
};

// Update boutique
export const useUpdateMNABoutique = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<MNABoutiqueFormData> }): Promise<MNABoutique> => {
      const { data: result, error } = await supabase
        .from('mna_boutiques')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating MNA boutique:', error);
        throw error;
      }

      return result as MNABoutique;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.id] });
      toast.success('Boutique actualizada');
    },
    onError: () => {
      toast.error('Error al actualizar la boutique');
    },
  });
};

// Soft delete boutique
export const useDeleteMNABoutique = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase
        .from('mna_boutiques')
        .update({ 
          is_deleted: true, 
          deleted_at: new Date().toISOString() 
        })
        .eq('id', id);

      if (error) {
        console.error('Error deleting MNA boutique:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Boutique eliminada');
    },
    onError: () => {
      toast.error('Error al eliminar la boutique');
    },
  });
};

// Get unique countries for filters
export const useMNABoutiqueCountries = () => {
  return useQuery({
    queryKey: [QUERY_KEY, 'countries'],
    queryFn: async (): Promise<string[]> => {
      const { data, error } = await supabase
        .from('mna_boutiques')
        .select('country_base')
        .eq('is_deleted', false)
        .not('country_base', 'is', null);

      if (error) throw error;

      const countries = [...new Set(data?.map(d => d.country_base).filter(Boolean))] as string[];
      return countries.sort();
    },
  });
};
