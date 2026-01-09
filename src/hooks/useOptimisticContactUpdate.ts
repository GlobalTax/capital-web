import { useQueryClient } from '@tanstack/react-query';
import { UnifiedContact } from '@/hooks/useUnifiedContacts';

/**
 * Hook helper para actualizaciones optimistas de contactos
 * Permite actualizar la UI inmediatamente sin esperar al servidor
 */
export const useOptimisticContactUpdate = () => {
  const queryClient = useQueryClient();

  /**
   * Actualizar un contacto en cache
   */
  const updateContactInCache = (
    contactId: string,
    updates: Partial<UnifiedContact>
  ) => {
    queryClient.setQueryData<UnifiedContact[]>(
      ['unified-contacts'],
      (old = []) => old.map(c =>
        c.id === contactId ? { ...c, ...updates } : c
      )
    );
  };

  /**
   * Actualizar múltiples contactos (bulk)
   */
  const updateContactsInCache = (
    contactIds: string[],
    updates: Partial<UnifiedContact>
  ) => {
    queryClient.setQueryData<UnifiedContact[]>(
      ['unified-contacts'],
      (old = []) => old.map(c =>
        contactIds.includes(c.id) ? { ...c, ...updates } : c
      )
    );
  };

  /**
   * Eliminar contacto de cache (para archivar)
   */
  const removeContactFromCache = (contactId: string) => {
    queryClient.setQueryData<UnifiedContact[]>(
      ['unified-contacts'],
      (old = []) => old.filter(c => c.id !== contactId)
    );
  };

  /**
   * Eliminar múltiples contactos de cache
   */
  const removeContactsFromCache = (contactIds: string[]) => {
    queryClient.setQueryData<UnifiedContact[]>(
      ['unified-contacts'],
      (old = []) => old.filter(c => !contactIds.includes(c.id))
    );
  };

  /**
   * Obtener snapshot actual para rollback
   */
  const getSnapshot = (): UnifiedContact[] | undefined => {
    return queryClient.getQueryData(['unified-contacts']);
  };

  /**
   * Restaurar snapshot (rollback)
   */
  const restoreSnapshot = (snapshot: UnifiedContact[] | undefined) => {
    if (snapshot) {
      queryClient.setQueryData(['unified-contacts'], snapshot);
    }
  };

  /**
   * Revalidación silenciosa en background
   * Solo marca como stale, no refetch inmediato
   */
  const revalidateInBackground = () => {
    queryClient.invalidateQueries({
      queryKey: ['unified-contacts'],
      refetchType: 'none', // No refetch inmediato
    });
  };

  /**
   * Cancelar queries en vuelo antes de optimistic update
   */
  const cancelQueries = async () => {
    await queryClient.cancelQueries({ queryKey: ['unified-contacts'] });
  };

  return {
    updateContactInCache,
    updateContactsInCache,
    removeContactFromCache,
    removeContactsFromCache,
    getSnapshot,
    restoreSnapshot,
    revalidateInBackground,
    cancelQueries,
  };
};
