import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Highlight {
  id: string;
  title: string;
  url: string;
  icon: string;
  description: string | null;
  color: string;
  position: number;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateHighlightData {
  title: string;
  url: string;
  icon?: string;
  description?: string;
  color?: string;
}

export interface UpdateHighlightData extends Partial<CreateHighlightData> {
  is_active?: boolean;
  position?: number;
}

const QUERY_KEY = ['dashboard-highlights'];

export const useHighlights = () => {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dashboard_highlights')
        .select('*')
        .eq('is_active', true)
        .order('position', { ascending: true });

      if (error) throw error;
      return data as Highlight[];
    },
  });
};

export const useAllHighlights = () => {
  return useQuery({
    queryKey: [...QUERY_KEY, 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dashboard_highlights')
        .select('*')
        .order('position', { ascending: true });

      if (error) throw error;
      return data as Highlight[];
    },
  });
};

export const useCreateHighlight = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateHighlightData) => {
      // Get max position
      const { data: existing } = await supabase
        .from('dashboard_highlights')
        .select('position')
        .order('position', { ascending: false })
        .limit(1);

      const nextPosition = existing?.[0]?.position ?? -1;

      const { data: highlight, error } = await supabase
        .from('dashboard_highlights')
        .insert({
          ...data,
          position: nextPosition + 1,
        })
        .select()
        .single();

      if (error) throw error;
      return highlight;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success('Destacado creado');
    },
    onError: (error) => {
      console.error('Error creating highlight:', error);
      toast.error('Error al crear el destacado');
    },
  });
};

export const useUpdateHighlight = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateHighlightData }) => {
      const { data: highlight, error } = await supabase
        .from('dashboard_highlights')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return highlight;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success('Destacado actualizado');
    },
    onError: (error) => {
      console.error('Error updating highlight:', error);
      toast.error('Error al actualizar el destacado');
    },
  });
};

export const useDeleteHighlight = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('dashboard_highlights')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success('Destacado eliminado');
    },
    onError: (error) => {
      console.error('Error deleting highlight:', error);
      toast.error('Error al eliminar el destacado');
    },
  });
};

export const useReorderHighlights = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (highlights: { id: string; position: number }[]) => {
      const updates = highlights.map(({ id, position }) =>
        supabase
          .from('dashboard_highlights')
          .update({ position })
          .eq('id', id)
      );

      const results = await Promise.all(updates);
      const errors = results.filter((r) => r.error);
      
      if (errors.length > 0) {
        throw new Error('Error reordering highlights');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
    onError: (error) => {
      console.error('Error reordering highlights:', error);
      toast.error('Error al reordenar los destacados');
    },
  });
};
