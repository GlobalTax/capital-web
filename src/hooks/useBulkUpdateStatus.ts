import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useOptimisticContactUpdate } from './useOptimisticContactUpdate';
import { UnifiedContact } from './useUnifiedContacts';

interface BulkUpdateStatusParams {
  contactIds: string[];
  statusKey: string;
  statusLabel?: string;
}

interface BulkUpdateResponse {
  success: boolean;
  updated_count: number;
  failed_count: number;
  failed_ids: string[];
  errors: string[];
}

export function useBulkUpdateStatus() {
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
    onMutate: async ({ contactIds, statusKey, statusLabel }: BulkUpdateStatusParams) => {
      // Cancelar queries en vuelo
      await cancelQueries();

      // Guardar snapshot para rollback
      const previousContacts = getSnapshot();

      // Actualizar cache optimísticamente
      updateContactsInCache(contactIds, {
        lead_status_crm: statusKey as any,
        status: statusLabel || statusKey,
      });

      return { previousContacts };
    },

    mutationFn: async ({ contactIds, statusKey }: BulkUpdateStatusParams): Promise<BulkUpdateResponse> => {
      const { data, error } = await supabase.functions.invoke('bulk-update-contacts', {
        body: {
          contact_ids: contactIds,
          updates: {
            lead_status_crm: statusKey,
          },
        },
      });

      if (error) {
        console.error('[useBulkUpdateStatus] Error:', error);
        throw new Error(error.message || 'Error al actualizar los estados');
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
        description: err.message || 'Error al actualizar los estados',
        variant: 'destructive',
      });
    },

    // 3. REVALIDACIÓN en éxito - SINCRONIZACIÓN CRUZADA LEADS ↔ PROSPECTOS
    onSuccess: (data, variables) => {
      // 🔥 Invalidar AMBAS listas con refetch inmediato para sincronización
      queryClient.invalidateQueries({
        queryKey: ['unified-contacts'],
      });
      
      queryClient.invalidateQueries({
        queryKey: ['prospects'],
      });
      
      console.log('[useBulkUpdateStatus] Invalidated both leads and prospects for cross-sync');
      
      // Invalidate status history for all affected contacts
      variables.contactIds.forEach(contactId => {
        // Extract the UUID from the prefixed ID (e.g., "valuation_uuid" -> "uuid")
        const parts = contactId.split('_');
        const uuid = parts.slice(1).join('_'); // Handle cases like "company_acquisition_uuid"
        queryClient.invalidateQueries({
          queryKey: ['status-history', uuid],
        });
      });

      if (data.failed_count === 0) {
        toast({
          title: 'Estado actualizado',
          description: `Se actualizó el estado de ${data.updated_count} contacto${data.updated_count !== 1 ? 's' : ''}`,
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
