import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PausedReason {
  id: string;
  name: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export function usePausedReasons() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const queryKey = ['paused_reasons'];

  const { data: reasons = [], isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('paused_reasons')
        .select('*')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return data as PausedReason[];
    },
  });

  const createReason = useMutation({
    mutationFn: async (name: string) => {
      const maxOrder = reasons.length > 0 ? Math.max(...reasons.map(r => r.sort_order ?? 0)) : 0;
      const { error } = await supabase
        .from('paused_reasons')
        .insert({ name, sort_order: maxOrder + 1, is_active: true });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
    onError: () => toast({ title: 'Error', description: 'No se pudo crear el motivo', variant: 'destructive' }),
  });

  const updateReason = useMutation({
    mutationFn: async ({ id, ...fields }: { id: string; name?: string; is_active?: boolean; sort_order?: number }) => {
      const { error } = await supabase
        .from('paused_reasons')
        .update(fields)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
    onError: () => toast({ title: 'Error', description: 'No se pudo actualizar el motivo', variant: 'destructive' }),
  });

  const swapOrder = useMutation({
    mutationFn: async ({ id1, order1, id2, order2 }: { id1: string; order1: number; id2: string; order2: number }) => {
      const { error: e1 } = await supabase.from('paused_reasons').update({ sort_order: order2 }).eq('id', id1);
      if (e1) throw e1;
      const { error: e2 } = await supabase.from('paused_reasons').update({ sort_order: order1 }).eq('id', id2);
      if (e2) throw e2;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
    onError: () => toast({ title: 'Error', description: 'No se pudo reordenar', variant: 'destructive' }),
  });

  return { reasons, isLoading, createReason, updateReason, swapOrder };
}
