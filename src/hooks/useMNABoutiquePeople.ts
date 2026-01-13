import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { 
  MNABoutiquePerson, 
  MNABoutiquePeopleFilters, 
  MNABoutiquePersonFormData 
} from '@/types/mnaBoutique';

const QUERY_KEY = 'mna-boutique-people';
const BOUTIQUES_KEY = 'mna-boutiques';

// Fetch people with filters
export const useMNABoutiquePeople = (filters: MNABoutiquePeopleFilters = {}) => {
  return useQuery({
    queryKey: [QUERY_KEY, filters],
    queryFn: async (): Promise<MNABoutiquePerson[]> => {
      let query = supabase
        .from('mna_boutique_people')
        .select(`
          *,
          boutique:mna_boutiques(id, name)
        `)
        .order('full_name', { ascending: true });

      if (!filters.showDeleted) {
        query = query.eq('is_deleted', false);
      }

      if (filters.boutique_id) {
        query = query.eq('boutique_id', filters.boutique_id);
      }

      if (filters.search) {
        query = query.ilike('full_name', `%${filters.search}%`);
      }

      if (filters.role) {
        query = query.eq('role', filters.role);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching MNA boutique people:', error);
        throw error;
      }

      return (data || []) as MNABoutiquePerson[];
    },
  });
};

// Create person
export const useCreateMNABoutiquePerson = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: MNABoutiquePersonFormData): Promise<MNABoutiquePerson> => {
      const { data: result, error } = await supabase
        .from('mna_boutique_people')
        .insert(data)
        .select()
        .single();

      if (error) {
        console.error('Error creating MNA boutique person:', error);
        throw error;
      }

      return result as MNABoutiquePerson;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [BOUTIQUES_KEY, variables.boutique_id] });
      toast.success('Persona añadida');
    },
    onError: () => {
      toast.error('Error al añadir la persona');
    },
  });
};

// Update person
export const useUpdateMNABoutiquePerson = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<MNABoutiquePersonFormData> }): Promise<MNABoutiquePerson> => {
      const { data: result, error } = await supabase
        .from('mna_boutique_people')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating MNA boutique person:', error);
        throw error;
      }

      return result as MNABoutiquePerson;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [BOUTIQUES_KEY] });
      toast.success('Persona actualizada');
    },
    onError: () => {
      toast.error('Error al actualizar la persona');
    },
  });
};

// Delete person (soft)
export const useDeleteMNABoutiquePerson = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase
        .from('mna_boutique_people')
        .update({ 
          is_deleted: true, 
          deleted_at: new Date().toISOString() 
        })
        .eq('id', id);

      if (error) {
        console.error('Error deleting MNA boutique person:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [BOUTIQUES_KEY] });
      toast.success('Persona eliminada');
    },
    onError: () => {
      toast.error('Error al eliminar la persona');
    },
  });
};
