/**
 * Hook for managing empresas table column configuration
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface EmpresaTableColumn {
  id: string;
  column_key: string;
  label: string;
  icon: string | null;
  position: number;
  is_visible: boolean;
  width: string;
  is_sortable: boolean;
  created_at: string;
  updated_at: string;
}

export const useEmpresasTableColumns = () => {
  const queryClient = useQueryClient();

  // Fetch columns from database
  const { data: columns = [], isLoading, refetch } = useQuery({
    queryKey: ['empresas-table-columns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('empresas_table_columns')
        .select('*')
        .order('position', { ascending: true });

      if (error) throw error;
      return data as EmpresaTableColumn[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Get only visible columns
  const visibleColumns = columns.filter(c => c.is_visible);

  // Toggle visibility
  const toggleVisibilityMutation = useMutation({
    mutationFn: async ({ id, isVisible }: { id: string; isVisible: boolean }) => {
      const { error } = await supabase
        .from('empresas_table_columns')
        .update({ is_visible: isVisible, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['empresas-table-columns'] });
    },
    onError: (error) => {
      toast.error('Error al cambiar visibilidad', { description: error.message });
    },
  });

  // Reorder columns
  const reorderColumnsMutation = useMutation({
    mutationFn: async (orderedIds: string[]) => {
      const updates = orderedIds.map((id, index) =>
        supabase
          .from('empresas_table_columns')
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
      queryClient.invalidateQueries({ queryKey: ['empresas-table-columns'] });
    },
    onError: (error) => {
      toast.error('Error al reordenar columnas', { description: error.message });
    },
  });

  // Update a single column
  const updateColumnMutation = useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<EmpresaTableColumn>;
    }) => {
      const { error } = await supabase
        .from('empresas_table_columns')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['empresas-table-columns'] });
      toast.success('Columna actualizada');
    },
    onError: (error) => {
      toast.error('Error al actualizar la columna', { description: error.message });
    },
  });

  return {
    columns,
    visibleColumns,
    isLoading,
    refetch,
    toggleVisibility: toggleVisibilityMutation.mutate,
    isTogglingVisibility: toggleVisibilityMutation.isPending,
    reorderColumns: reorderColumnsMutation.mutate,
    isReordering: reorderColumnsMutation.isPending,
    updateColumn: updateColumnMutation.mutate,
    isUpdating: updateColumnMutation.isPending,
  };
};
