// ============= BULK UPDATE BUYER DATE HOOK =============
// Hook para actualización masiva de fecha de registro en buyer_contacts

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { BuyerContact } from '@/types/buyer-contacts';

interface BulkUpdateBuyerDateParams {
  contactIds: string[]; // Just UUIDs, not prefixed
  receivedDate: string; // ISO date string
}

interface BulkUpdateResponse {
  success: boolean;
  updated_count: number;
  failed_count: number;
  failed_ids: string[];
  errors: string[];
}

export function useBulkUpdateBuyerDate() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    // 1. OPTIMISTIC UPDATE (before request)
    onMutate: async ({ contactIds, receivedDate }: BulkUpdateBuyerDateParams) => {
      // Cancel in-flight queries
      await queryClient.cancelQueries({ queryKey: ['buyer-contacts'] });

      // Save snapshot for rollback
      const previousContacts = queryClient.getQueryData<BuyerContact[]>(['buyer-contacts']);

      // Update cache optimistically
      queryClient.setQueryData<BuyerContact[]>(['buyer-contacts'], (old) => {
        if (!old) return old;
        return old.map((contact) =>
          contactIds.includes(contact.id)
            ? { ...contact, lead_received_at: receivedDate }
            : contact
        );
      });

      return { previousContacts };
    },

    mutationFn: async ({ contactIds, receivedDate }: BulkUpdateBuyerDateParams): Promise<BulkUpdateResponse> => {
      // Add 'buyer_' prefix to each ID for the edge function
      const prefixedIds = contactIds.map((id) => `buyer_${id}`);

      const { data, error } = await supabase.functions.invoke('bulk-update-contacts', {
        body: {
          contact_ids: prefixedIds,
          updates: {
            lead_received_at: receivedDate,
          },
        },
      });

      if (error) {
        console.error('[useBulkUpdateBuyerDate] Error:', error);
        throw new Error(error.message || 'Error al actualizar las fechas');
      }

      return data as BulkUpdateResponse;
    },

    // 2. ROLLBACK on error
    onError: (err, variables, context) => {
      if (context?.previousContacts) {
        queryClient.setQueryData(['buyer-contacts'], context.previousContacts);
      }
      toast({
        title: 'Error',
        description: err.message || 'Error al actualizar las fechas de registro',
        variant: 'destructive',
      });
    },

    // 3. REVALIDATION on success
    onSuccess: (data) => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({
        queryKey: ['buyer-contacts'],
        refetchType: 'none',
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
