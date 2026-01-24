/**
 * Hook for managing lead pipeline column configuration
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface LeadPipelineColumn {
  id: string;
  stage_key: string;
  label: string;
  color: string;
  icon: string;
  position: number;
  is_visible: boolean;
  is_system: boolean;
  created_at: string;
  updated_at: string;
}

export type ColumnFormData = {
  stage_key: string;
  label: string;
  color: string;
  icon: string;
};

export const useLeadPipelineColumns = () => {
  const queryClient = useQueryClient();

  // Fetch columns from database
  const { data: columns = [], isLoading, refetch } = useQuery({
    queryKey: ['lead-pipeline-columns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lead_pipeline_columns')
        .select('*')
        .order('position', { ascending: true });

      if (error) throw error;
      return data as LeadPipelineColumn[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Get only visible columns
  const visibleColumns = columns.filter(c => c.is_visible);

  // Update a single column
  const updateColumnMutation = useMutation({
    mutationFn: async ({ 
      id, 
      updates 
    }: { 
      id: string; 
      updates: Partial<LeadPipelineColumn>;
    }) => {
      const { error } = await supabase
        .from('lead_pipeline_columns')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-pipeline-columns'] });
      toast.success('Columna actualizada');
    },
    onError: (error) => {
      toast.error('Error al actualizar la columna', { description: error.message });
    },
  });

  // Add a new column
  const addColumnMutation = useMutation({
    mutationFn: async (columnData: ColumnFormData) => {
      // Get highest position
      const maxPosition = columns.length > 0 
        ? Math.max(...columns.map(c => c.position)) 
        : 0;

      const { error } = await supabase
        .from('lead_pipeline_columns')
        .insert({
          ...columnData,
          position: maxPosition + 1,
          is_visible: true,
          is_system: false,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-pipeline-columns'] });
      toast.success('Columna añadida');
    },
    onError: (error: any) => {
      if (error.message?.includes('duplicate')) {
        toast.error('Ya existe una columna con esa clave');
      } else {
        toast.error('Error al añadir la columna', { description: error.message });
      }
    },
  });

  // Delete a column
  const deleteColumnMutation = useMutation({
    mutationFn: async (id: string) => {
      // First check if it's a system column
      const column = columns.find(c => c.id === id);
      if (column?.is_system) {
        throw new Error('No se puede eliminar una columna del sistema');
      }

      const { error } = await supabase
        .from('lead_pipeline_columns')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-pipeline-columns'] });
      toast.success('Columna eliminada');
    },
    onError: (error) => {
      toast.error('Error al eliminar la columna', { description: error.message });
    },
  });

  // Reorder columns
  const reorderColumnsMutation = useMutation({
    mutationFn: async (orderedIds: string[]) => {
      // Update all positions in a batch
      const updates = orderedIds.map((id, index) => 
        supabase
          .from('lead_pipeline_columns')
          .update({ position: index + 1, updated_at: new Date().toISOString() })
          .eq('id', id)
      );

      const results = await Promise.all(updates);
      const errors = results.filter(r => r.error);
      
      if (errors.length > 0) {
        throw new Error('Error al reordenar algunas columnas');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-pipeline-columns'] });
    },
    onError: (error) => {
      toast.error('Error al reordenar columnas', { description: error.message });
    },
  });

  // Toggle visibility
  const toggleVisibilityMutation = useMutation({
    mutationFn: async ({ id, isVisible }: { id: string; isVisible: boolean }) => {
      const { error } = await supabase
        .from('lead_pipeline_columns')
        .update({ is_visible: isVisible, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-pipeline-columns'] });
    },
    onError: (error) => {
      toast.error('Error al cambiar visibilidad', { description: error.message });
    },
  });

  return {
    columns,
    visibleColumns,
    isLoading,
    refetch,
    updateColumn: updateColumnMutation.mutate,
    isUpdating: updateColumnMutation.isPending,
    addColumn: addColumnMutation.mutate,
    isAdding: addColumnMutation.isPending,
    deleteColumn: deleteColumnMutation.mutate,
    isDeleting: deleteColumnMutation.isPending,
    reorderColumns: reorderColumnsMutation.mutate,
    isReordering: reorderColumnsMutation.isPending,
    toggleVisibility: toggleVisibilityMutation.mutate,
  };
};
