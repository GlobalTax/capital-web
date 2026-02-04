import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useOptimisticContactUpdate } from './useOptimisticContactUpdate';

interface BulkUpdateLeadFormParams {
  contactIds: string[];
  leadFormId: string;
  leadFormName?: string;
}

interface BulkUpdateResponse {
  success: boolean;
  updated_count: number;
  failed_count: number;
  failed_ids: string[];
  errors: string[];
}

export function useBulkUpdateLeadForm() {
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
    onMutate: async ({ contactIds, leadFormId, leadFormName }: BulkUpdateLeadFormParams) => {
      // Cancelar queries en vuelo
      await cancelQueries();

      // Guardar snapshot para rollback
      const previousContacts = getSnapshot();

      // Actualizar cache optimísticamente
      updateContactsInCache(contactIds, {
        lead_form: leadFormId,
        lead_form_name: leadFormName,
      });

      return { previousContacts };
    },

    mutationFn: async ({ contactIds, leadFormId }: BulkUpdateLeadFormParams): Promise<BulkUpdateResponse> => {
      const { data, error } = await supabase.functions.invoke('bulk-update-contacts', {
        body: {
          contact_ids: contactIds,
          updates: {
            lead_form: leadFormId,
          },
        },
      });

      if (error) {
        console.error('[useBulkUpdateLeadForm] Error:', error);
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
        description: err.message || 'Error al actualizar los formularios',
        variant: 'destructive',
      });
    },

    // 3. REVALIDACIÓN activa en éxito
    onSuccess: (data) => {
      // Invalidar y refrescar queries activas
      queryClient.invalidateQueries({
        queryKey: ['unified-contacts'],
        refetchType: 'active',
      });
      
      // Sincronizar tabla y pipeline de contacts-v2
      queryClient.invalidateQueries({
        queryKey: ['contacts-v2'],
        refetchType: 'active',
      });

      if (data.failed_count === 0) {
        toast({
          title: 'Formulario actualizado',
          description: `Se actualizó el formulario de ${data.updated_count} contacto${data.updated_count !== 1 ? 's' : ''}`,
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
