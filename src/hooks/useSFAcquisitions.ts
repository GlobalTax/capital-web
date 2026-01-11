import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SFAcquisition } from '@/types/searchFunds';
import { toast } from 'sonner';

const SF_ACQUISITIONS_KEY = 'sf_acquisitions';

export const useSFAcquisitions = (fundId?: string) => {
  return useQuery({
    queryKey: [SF_ACQUISITIONS_KEY, fundId],
    queryFn: async () => {
      let query = supabase
        .from('sf_acquisitions')
        .select('*')
        .order('deal_year', { ascending: false });

      if (fundId) {
        query = query.eq('fund_id', fundId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as SFAcquisition[];
    },
  });
};

export const useCreateSFAcquisition = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (acquisition: Partial<SFAcquisition>) => {
      const { data, error } = await supabase
        .from('sf_acquisitions')
        .insert([acquisition as any])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SF_ACQUISITIONS_KEY] });
      queryClient.invalidateQueries({ queryKey: ['sf_funds'] });
      toast.success('Adquisición añadida');
    },
    onError: (error) => {
      toast.error('Error al añadir adquisición');
      console.error(error);
    },
  });
};

export const useUpdateSFAcquisition = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<SFAcquisition> & { id: string }) => {
      const { data, error } = await supabase
        .from('sf_acquisitions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SF_ACQUISITIONS_KEY] });
      queryClient.invalidateQueries({ queryKey: ['sf_funds'] });
      toast.success('Adquisición actualizada');
    },
    onError: (error) => {
      toast.error('Error al actualizar');
      console.error(error);
    },
  });
};

export const useDeleteSFAcquisition = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('sf_acquisitions')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SF_ACQUISITIONS_KEY] });
      queryClient.invalidateQueries({ queryKey: ['sf_funds'] });
      toast.success('Adquisición eliminada');
    },
    onError: (error) => {
      toast.error('Error al eliminar');
      console.error(error);
    },
  });
};
