import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SFBacker, SFFundBacker } from '@/types/searchFunds';
import { toast } from 'sonner';

const SF_BACKERS_KEY = 'sf_backers';

export const useSFBackers = () => {
  return useQuery({
    queryKey: [SF_BACKERS_KEY],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sf_backers')
        .select('*')
        .order('name');

      if (error) throw error;
      return data as SFBacker[];
    },
  });
};

export const useSFBacker = (id: string | undefined) => {
  return useQuery({
    queryKey: [SF_BACKERS_KEY, id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('sf_backers')
        .select(`
          *,
          sf_fund_backers (
            *,
            sf_funds (*)
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return {
        ...data,
        fund_backers: data.sf_fund_backers?.map((fb: any) => ({
          ...fb,
          fund: fb.sf_funds
        }))
      };
    },
    enabled: !!id,
  });
};

export const useCreateSFBacker = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (backer: Partial<SFBacker>) => {
      const { data, error } = await supabase
        .from('sf_backers')
        .insert([backer as any])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SF_BACKERS_KEY] });
      toast.success('Backer creado correctamente');
    },
    onError: (error) => {
      toast.error('Error al crear el Backer');
      console.error(error);
    },
  });
};

export const useUpdateSFBacker = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<SFBacker> & { id: string }) => {
      const { data, error } = await supabase
        .from('sf_backers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [SF_BACKERS_KEY] });
      queryClient.invalidateQueries({ queryKey: [SF_BACKERS_KEY, data.id] });
      toast.success('Backer actualizado');
    },
    onError: (error) => {
      toast.error('Error al actualizar');
      console.error(error);
    },
  });
};

export const useDeleteSFBacker = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('sf_backers')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SF_BACKERS_KEY] });
      toast.success('Backer eliminado');
    },
    onError: (error) => {
      toast.error('Error al eliminar');
      console.error(error);
    },
  });
};

// Fund-Backer relationships
export const useAddFundBacker = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (relation: Partial<SFFundBacker>) => {
      const { data, error } = await supabase
        .from('sf_fund_backers')
        .insert([relation as any])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sf_funds'] });
      queryClient.invalidateQueries({ queryKey: [SF_BACKERS_KEY] });
      toast.success('Relación añadida');
    },
    onError: (error) => {
      toast.error('Error al añadir relación');
      console.error(error);
    },
  });
};

export const useRemoveFundBacker = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('sf_fund_backers')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sf_funds'] });
      queryClient.invalidateQueries({ queryKey: [SF_BACKERS_KEY] });
      toast.success('Relación eliminada');
    },
    onError: (error) => {
      toast.error('Error al eliminar relación');
      console.error(error);
    },
  });
};
