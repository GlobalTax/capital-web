import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useOperationMutations = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateStatus = useMutation({
    mutationFn: async ({ operationId, status }: { operationId: string; status: string }) => {
      const { data, error } = await supabase
        .from('company_operations')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', operationId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operations'] });
      queryClient.invalidateQueries({ queryKey: ['operations-analytics'] });
      toast({
        title: 'Estado actualizado',
        description: 'El estado de la operación se ha actualizado correctamente',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error al actualizar estado',
        description: error.message || 'No se pudo actualizar el estado de la operación',
        variant: 'destructive',
      });
    },
  });

  const assignOperation = useMutation({
    mutationFn: async ({ operationId, userId }: { operationId: string; userId: string | null }) => {
      const { data: authUser } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('company_operations')
        .update({
          assigned_to: userId,
          assigned_at: userId ? new Date().toISOString() : null,
          assigned_by: userId ? authUser.user?.id : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', operationId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['operations'] });
      queryClient.invalidateQueries({ queryKey: ['team-workload'] });
      queryClient.invalidateQueries({ queryKey: ['operation-history', variables.operationId] });
      
      toast({
        title: variables.userId ? 'Operación asignada' : 'Asignación eliminada',
        description: variables.userId 
          ? 'La operación se ha asignado correctamente'
          : 'Se ha eliminado la asignación de la operación',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error al asignar operación',
        description: error.message || 'No se pudo asignar la operación',
        variant: 'destructive',
      });
    },
  });

  return {
    updateStatus: updateStatus.mutate,
    assignOperation: assignOperation.mutate,
    isUpdatingStatus: updateStatus.isPending,
    isAssigning: assignOperation.isPending,
  };
};
