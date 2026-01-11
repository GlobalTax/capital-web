import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SFPerson } from '@/types/searchFunds';
import { toast } from 'sonner';

const SF_PEOPLE_KEY = 'sf_people';

export const useSFPeople = (fundId?: string) => {
  return useQuery({
    queryKey: [SF_PEOPLE_KEY, fundId],
    queryFn: async () => {
      let query = supabase
        .from('sf_people')
        .select('*')
        .order('is_primary_contact', { ascending: false })
        .order('full_name');

      if (fundId) {
        query = query.eq('fund_id', fundId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as SFPerson[];
    },
  });
};

export const useCreateSFPerson = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (person: Partial<SFPerson>) => {
      const { data, error } = await supabase
        .from('sf_people')
        .insert([person as any])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SF_PEOPLE_KEY] });
      queryClient.invalidateQueries({ queryKey: ['sf_funds'] });
      toast.success('Contacto añadido');
    },
    onError: (error) => {
      toast.error('Error al añadir contacto');
      console.error(error);
    },
  });
};

export const useUpdateSFPerson = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<SFPerson> & { id: string }) => {
      const { data, error } = await supabase
        .from('sf_people')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SF_PEOPLE_KEY] });
      queryClient.invalidateQueries({ queryKey: ['sf_funds'] });
      toast.success('Contacto actualizado');
    },
    onError: (error) => {
      toast.error('Error al actualizar');
      console.error(error);
    },
  });
};

export const useDeleteSFPerson = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('sf_people')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SF_PEOPLE_KEY] });
      queryClient.invalidateQueries({ queryKey: ['sf_funds'] });
      toast.success('Contacto eliminado');
    },
    onError: (error) => {
      toast.error('Error al eliminar');
      console.error(error);
    },
  });
};
