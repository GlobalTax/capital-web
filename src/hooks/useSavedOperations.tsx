import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface SavedOperation {
  id: string;
  user_id: string;
  operation_id: string;
  notes?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
  operation?: any;
}

export const useSavedOperations = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: savedOperations, isLoading } = useQuery({
    queryKey: ['saved-operations', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('saved_operations')
        .select(`
          *,
          operation:company_operations(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as SavedOperation[];
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });

  const isOperationSaved = (operationId: string) => {
    return savedOperations?.some(saved => saved.operation_id === operationId) || false;
  };

  const saveOperation = useMutation({
    mutationFn: async ({ operationId, notes, tags }: { 
      operationId: string; 
      notes?: string; 
      tags?: string[] 
    }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('saved_operations')
        .insert({
          user_id: user.id,
          operation_id: operationId,
          notes,
          tags
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-operations'] });
      toast.success('Operación guardada en favoritos');
    },
    onError: (error: any) => {
      console.error('Error saving operation:', error);
      toast.error('Error al guardar la operación');
    }
  });

  const removeSavedOperation = useMutation({
    mutationFn: async (operationId: string) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('saved_operations')
        .delete()
        .eq('user_id', user.id)
        .eq('operation_id', operationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-operations'] });
      toast.success('Operación eliminada de favoritos');
    },
    onError: (error: any) => {
      console.error('Error removing saved operation:', error);
      toast.error('Error al eliminar la operación');
    }
  });

  const updateSavedOperation = useMutation({
    mutationFn: async ({ 
      operationId, 
      notes, 
      tags 
    }: { 
      operationId: string; 
      notes?: string; 
      tags?: string[] 
    }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('saved_operations')
        .update({ notes, tags })
        .eq('user_id', user.id)
        .eq('operation_id', operationId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-operations'] });
      toast.success('Notas actualizadas');
    }
  });

  return {
    savedOperations,
    isLoading,
    isOperationSaved,
    saveOperation: saveOperation.mutate,
    removeSavedOperation: removeSavedOperation.mutate,
    updateSavedOperation: updateSavedOperation.mutate,
    isSaving: saveOperation.isPending,
    isRemoving: removeSavedOperation.isPending
  };
};
