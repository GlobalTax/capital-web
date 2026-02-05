import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useOptimisticContactUpdate } from './useOptimisticContactUpdate';

interface BulkUpdateReceivedDateParams {
  contactIds: string[];
  receivedDate: string; // ISO date string
}

interface BulkUpdateResponse {
  success: boolean;
  updated_count: number;
  failed_count: number;
  failed_ids: string[];
  errors: string[];
}

export function useBulkUpdateReceivedDate() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { 
    updateContactsInCache, 
    getSnapshot, 
    restoreSnapshot,
    cancelQueries 
  } = useOptimisticContactUpdate();

  return useMutation({
    // 1. OPTIMISTIC UPDATE (antes del request)
    onMutate: async ({ contactIds, receivedDate }: BulkUpdateReceivedDateParams) => {
      // Cancelar queries en vuelo
      await cancelQueries();

      // Guardar snapshot para rollback
      const previousContacts = getSnapshot();

      // Actualizar cache optimísticamente - extract UUIDs from "origin_uuid" format
      const uuids = contactIds.map(id => {
        const parts = id.split('_');
        return parts.slice(1).join('_'); // Handle UUIDs that might have underscores
      });

      updateContactsInCache(uuids, {
        lead_received_at: receivedDate,
      } as any);

      return { previousContacts };
    },

    mutationFn: async ({ contactIds, receivedDate }: BulkUpdateReceivedDateParams): Promise<BulkUpdateResponse> => {
      const { data, error } = await supabase.functions.invoke('bulk-update-contacts', {
        body: {
          contact_ids: contactIds,
          updates: {
            lead_received_at: receivedDate,
          },
        },
      });

      if (error) {
        console.error('[useBulkUpdateReceivedDate] Error:', error);
        throw new Error(error.message || 'Error al actualizar las fechas');
      }

      return data as BulkUpdateResponse;
    },

    // 2. ROLLBACK en error
    onError: (err, variables, context) => {
      if (context?.previousContacts) {
        restoreSnapshot(context.previousContacts);
      }
      toast({
        title: 'Error',
        description: err.message || 'Error al actualizar las fechas de registro',
        variant: 'destructive',
      });
    },

    // 3. REVALIDACIÓN en éxito
    onSuccess: (data) => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({
        queryKey: ['unified-contacts'],
        refetchType: 'active',
      });
      
      // Also invalidate contacts-v2 for table sync
      queryClient.invalidateQueries({
        queryKey: ['contacts-v2'],
        refetchType: 'active',
      });

      if (data.failed_count === 0) {
        toast({
          title: 'Fecha actualizada',
          description: `Se actualizó la fecha de registro de ${data.updated_count} contacto${data.updated_count !== 1 ? 's' : ''}`,
        });
      } else if (data.updated_count > 0) {
        toast({
          title: 'Actualización parcial',
          description: `${data.updated_count} actualizado${data.updated_count !== 1 ? 's' : ''}, ${data.failed_count} fallido${data.failed_count !== 1 ? 's' : ''}`,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error',
          description: data.errors.join('. ') || 'No se pudo actualizar ningún contacto',
          variant: 'destructive',
        });
      }
    },
  });
}
