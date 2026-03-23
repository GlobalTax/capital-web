import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface OutboundPipelineStage {
  id: string;
  stage_key: string;
  label: string;
  color: string;
  icon: string;
  position: number;
  is_active: boolean;
  is_system: boolean;
  created_at: string;
  updated_at: string;
}

const QUERY_KEY = ['outbound-pipeline-stages'];

export function useOutboundPipelineStages() {
  const queryClient = useQueryClient();

  const { data: stages = [], isLoading } = useQuery<OutboundPipelineStage[]>({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('outbound_pipeline_stages')
        .select('*')
        .order('position', { ascending: true });
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60_000,
  });

  const activeStages = stages.filter(s => s.is_active);

  const createStage = useMutation({
    mutationFn: async (stage: { stage_key: string; label: string; color: string; icon: string }) => {
      const maxPos = stages.length > 0 ? Math.max(...stages.map(s => s.position)) + 1 : 0;
      const { error } = await (supabase as any)
        .from('outbound_pipeline_stages')
        .insert({ ...stage, position: maxPos });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success('Etapa creada');
    },
    onError: () => toast.error('Error al crear etapa'),
  });

  const updateStage = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<OutboundPipelineStage> & { id: string }) => {
      const { error } = await (supabase as any)
        .from('outbound_pipeline_stages')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
    onError: () => toast.error('Error al actualizar etapa'),
  });

  const deleteStage = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from('outbound_pipeline_stages')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success('Etapa eliminada');
    },
    onError: () => toast.error('Error al eliminar etapa'),
  });

  const reorderStages = useMutation({
    mutationFn: async (orderedIds: string[]) => {
      const updates = orderedIds.map((id, i) =>
        (supabase as any)
          .from('outbound_pipeline_stages')
          .update({ position: i })
          .eq('id', id)
      );
      await Promise.all(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });

  return {
    stages,
    activeStages,
    isLoading,
    createStage,
    updateStage,
    deleteStage,
    reorderStages,
  };
}
