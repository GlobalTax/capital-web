import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SFFund, SFFundFilters, SFFundWithRelations } from '@/types/searchFunds';
import { toast } from 'sonner';

const SF_FUNDS_KEY = 'sf_funds';

export const useSFFunds = (filters?: SFFundFilters) => {
  return useQuery({
    queryKey: [SF_FUNDS_KEY, filters],
    queryFn: async () => {
      let query = supabase
        .from('sf_funds')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }
      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      if (filters?.country_base) {
        query = query.eq('country_base', filters.country_base);
      }
      if (filters?.ebitda_min) {
        query = query.gte('ebitda_max', filters.ebitda_min);
      }
      if (filters?.ebitda_max) {
        query = query.lte('ebitda_min', filters.ebitda_max);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as SFFund[];
    },
  });
};

export const useSFFund = (id: string | undefined) => {
  return useQuery({
    queryKey: [SF_FUNDS_KEY, id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('sf_funds')
        .select(`
          *,
          sf_people (*),
          sf_acquisitions (*),
          sf_fund_backers (
            *,
            sf_backers (*)
          ),
          sf_matches (*),
          sf_outreach (
            *,
            sf_people (*)
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as unknown as SFFundWithRelations;
    },
    enabled: !!id,
  });
};

export const useCreateSFFund = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (fund: Partial<SFFund>) => {
      const { data, error } = await supabase
        .from('sf_funds')
        .insert([fund as any])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SF_FUNDS_KEY] });
      toast.success('Search Fund creado correctamente');
    },
    onError: (error) => {
      toast.error('Error al crear el Search Fund');
      console.error(error);
    },
  });
};

export const useUpdateSFFund = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<SFFund> & { id: string }) => {
      const { data, error } = await supabase
        .from('sf_funds')
        .update(updates as any)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [SF_FUNDS_KEY] });
      queryClient.invalidateQueries({ queryKey: [SF_FUNDS_KEY, data.id] });
      toast.success('Search Fund actualizado');
    },
    onError: (error) => {
      toast.error('Error al actualizar');
      console.error(error);
    },
  });
};

export const useDeleteSFFund = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('sf_funds')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SF_FUNDS_KEY] });
      toast.success('Search Fund eliminado');
    },
    onError: (error) => {
      toast.error('Error al eliminar');
      console.error(error);
    },
  });
};
