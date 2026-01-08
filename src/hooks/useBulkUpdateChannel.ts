import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BulkUpdateChannelParams {
  contactIds: string[]; // Format: "origin_uuid"
  channelId: string;
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

  return useMutation({
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
    onSuccess: (data) => {
      // Invalidate contacts query to refresh the table
      queryClient.invalidateQueries({ queryKey: ['unified-contacts'] });

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
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Error al actualizar los canales',
        variant: 'destructive',
      });
    },
  });
}
