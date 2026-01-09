import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useOptimisticContactUpdate } from './useOptimisticContactUpdate';
import { UnifiedContact } from './useUnifiedContacts';

interface BulkUpdateChannelParams {
  contactIds: string[];
  channelId: string;
  channelName?: string;
  channelCategory?: string;
}

interface BulkUpdateResponse {
  success: boolean;
  updated_count: number;
  failed_count: number;
  failed_ids: string[];
  errors: string[];
}

export function useBulkUpdateChannel() {
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
    onMutate: async ({ contactIds, channelId, channelName, channelCategory }: BulkUpdateChannelParams) => {
      // Cancelar queries en vuelo
      await cancelQueries();

      // Guardar snapshot para rollback
      const previousContacts = getSnapshot();

      // Actualizar cache optimísticamente
      updateContactsInCache(contactIds, {
        acquisition_channel_id: channelId,
        acquisition_channel_name: channelName,
        acquisition_channel_category: channelCategory,
      });

      return { previousContacts };
    },

    mutationFn: async ({ contactIds, channelId }: BulkUpdateChannelParams): Promise<BulkUpdateResponse> => {
      const { data, error } = await supabase.functions.invoke('bulk-update-contacts', {
        body: {
          contact_ids: contactIds,
          updates: {
            acquisition_channel_id: channelId,
          },
        },
      });

      if (error) {
        console.error('[useBulkUpdateChannel] Error:', error);
        throw new Error(error.message || 'Error al actualizar los contactos');
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
        description: err.message || 'Error al actualizar los canales',
        variant: 'destructive',
      });
    },

    // 3. REVALIDACIÓN silenciosa en éxito
    onSuccess: (data) => {
      // Solo invalida queries en background, no refetch inmediato
      queryClient.invalidateQueries({
        queryKey: ['unified-contacts'],
        refetchType: 'none',
      });

      if (data.failed_count === 0) {
        toast({
          title: 'Canal actualizado',
          description: `Se actualizó el canal de ${data.updated_count} contacto${data.updated_count !== 1 ? 's' : ''}`,
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
