import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SFOutreach, SFOutreachFormData } from '@/types/searchFunds';
import { toast } from 'sonner';

const SF_OUTREACH_KEY = 'sf_outreach';

export const useSFOutreach = (fundId?: string) => {
  return useQuery({
    queryKey: [SF_OUTREACH_KEY, fundId],
    queryFn: async () => {
      let query = supabase
        .from('sf_outreach')
        .select(`
          *,
          sf_people (full_name, email),
          sf_funds (name)
        `)
        .order('created_at', { ascending: false });

      if (fundId) {
        query = query.eq('fund_id', fundId);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      return data.map((o: any) => ({
        ...o,
        person: o.sf_people,
        fund: o.sf_funds
      })) as SFOutreach[];
    },
  });
};

export const useCreateSFOutreach = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (outreach: Partial<SFOutreach>) => {
      const { data, error } = await supabase
        .from('sf_outreach')
        .insert([outreach as any])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SF_OUTREACH_KEY] });
      queryClient.invalidateQueries({ queryKey: ['sf_funds'] });
      toast.success('Actividad registrada');
    },
    onError: (error) => {
      toast.error('Error al registrar actividad');
      console.error(error);
    },
  });
};

export const useUpdateSFOutreach = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<SFOutreach> & { id: string }) => {
      const { data, error } = await supabase
        .from('sf_outreach')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SF_OUTREACH_KEY] });
      queryClient.invalidateQueries({ queryKey: ['sf_funds'] });
      toast.success('Actividad actualizada');
    },
    onError: (error) => {
      toast.error('Error al actualizar');
      console.error(error);
    },
  });
};

export const useDeleteSFOutreach = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('sf_outreach')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SF_OUTREACH_KEY] });
      queryClient.invalidateQueries({ queryKey: ['sf_funds'] });
      toast.success('Actividad eliminada');
    },
    onError: (error) => {
      toast.error('Error al eliminar');
      console.error(error);
    },
  });
};
