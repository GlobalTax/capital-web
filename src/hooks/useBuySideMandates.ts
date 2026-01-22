import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface BuySideMandate {
  id: string;
  title: string;
  description: string | null;
  sector: string;
  subsector: string | null;
  geographic_scope: string;
  revenue_min: number | null;
  revenue_max: number | null;
  ebitda_min: number | null;
  ebitda_max: number | null;
  requirements: string[] | null;
  is_active: boolean;
  is_new: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  // Teaser fields
  teaser_es_url: string | null;
  teaser_es_filename: string | null;
  teaser_es_uploaded_at: string | null;
  teaser_en_url: string | null;
  teaser_en_filename: string | null;
  teaser_en_uploaded_at: string | null;
}

export type BuySideMandateInput = Omit<BuySideMandate, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'teaser_es_url' | 'teaser_es_filename' | 'teaser_es_uploaded_at' | 'teaser_en_url' | 'teaser_en_filename' | 'teaser_en_uploaded_at'>;

export const useBuySideMandates = () => {
  const queryClient = useQueryClient();

  const { data: mandates, isLoading, error } = useQuery({
    queryKey: ['buy-side-mandates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('buy_side_mandates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as BuySideMandate[];
    },
  });

  const createMandate = useMutation({
    mutationFn: async (mandate: BuySideMandateInput) => {
      const { data, error } = await supabase
        .from('buy_side_mandates')
        .insert([mandate])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buy-side-mandates'] });
      toast.success('Mandato creado correctamente');
    },
    onError: (error) => {
      console.error('Error creating mandate:', error);
      toast.error('Error al crear el mandato');
    },
  });

  const updateMandate = useMutation({
    mutationFn: async ({ id, ...mandate }: Partial<BuySideMandate> & { id: string }) => {
      const { data, error } = await supabase
        .from('buy_side_mandates')
        .update(mandate)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buy-side-mandates'] });
      toast.success('Mandato actualizado correctamente');
    },
    onError: (error) => {
      console.error('Error updating mandate:', error);
      toast.error('Error al actualizar el mandato');
    },
  });

  const deleteMandate = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('buy_side_mandates')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buy-side-mandates'] });
      toast.success('Mandato eliminado correctamente');
    },
    onError: (error) => {
      console.error('Error deleting mandate:', error);
      toast.error('Error al eliminar el mandato');
    },
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { data, error } = await supabase
        .from('buy_side_mandates')
        .update({ is_active })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['buy-side-mandates'] });
      toast.success(data.is_active ? 'Mandato activado' : 'Mandato desactivado');
    },
    onError: (error) => {
      console.error('Error toggling mandate:', error);
      toast.error('Error al cambiar el estado del mandato');
    },
  });

  return {
    mandates,
    isLoading,
    error,
    createMandate,
    updateMandate,
    deleteMandate,
    toggleActive,
  };
};
