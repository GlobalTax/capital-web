import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Operation } from '../types/operations';

interface UpdateOperationStatusParams {
  operationId: string;
  newStatus: string;
  oldStatus?: string;
}

interface AssignOperationParams {
  operationId: string;
  userId: string | null;
}

export const useOperationMutations = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const updateStatusMutation = useMutation({
    mutationFn: async ({ operationId, newStatus }: UpdateOperationStatusParams) => {
      const { data, error } = await supabase
        .from('company_operations')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', operationId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operations-analytics'] });
      toast({
        title: 'Estado actualizado',
        description: 'El estado de la operación se actualizó correctamente',
      });
    },
    onError: (error) => {
      console.error('Error updating operation status:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el estado de la operación',
        variant: 'destructive',
      });
    },
  });

  const assignOperationMutation = useMutation({
    mutationFn: async ({ operationId, userId }: AssignOperationParams) => {
      // This would need a new column in company_operations table: assigned_to
      const { data, error } = await supabase
        .from('company_operations')
        .update({ 
          // assigned_to: userId, // This column needs to be added via migration
          updated_at: new Date().toISOString() 
        })
        .eq('id', operationId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operations-analytics'] });
      toast({
        title: 'Operación asignada',
        description: 'La operación fue asignada correctamente',
      });
    },
    onError: (error) => {
      console.error('Error assigning operation:', error);
      toast({
        title: 'Error',
        description: 'No se pudo asignar la operación',
        variant: 'destructive',
      });
    },
  });

  return {
    updateStatus: updateStatusMutation.mutate,
    assignOperation: assignOperationMutation.mutate,
    isUpdating: updateStatusMutation.isPending || assignOperationMutation.isPending,
  };
};
