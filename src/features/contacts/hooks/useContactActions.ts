import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useOptimisticContactUpdate } from '@/hooks/useOptimisticContactUpdate';
import { logBulkArchiveContacts, logBulkDeleteContacts } from '@/services/auditService';
import type { ContactOrigin } from '@/hooks/useUnifiedContacts';

interface Contact {
  id: string;
  name: string;
  origin: ContactOrigin;
}

export interface BulkActionResult {
  success: boolean;
  successCount: number;
  failedCount: number;
  failed: Array<{ id: string; name: string; reason: string }>;
}

const tableMap: Record<ContactOrigin, string> = {
  contact: 'contact_leads',
  valuation: 'company_valuations',
  collaborator: 'collaborator_applications',
  acquisition: 'acquisition_leads',
  company_acquisition: 'company_acquisition_inquiries',
  general: 'general_contact_leads',
  advisor: 'advisor_valuations',
};

export const useContactActions = () => {
  const { toast } = useToast();
  const { 
    removeContactFromCache, 
    removeContactsFromCache,
    getSnapshot, 
    restoreSnapshot 
  } = useOptimisticContactUpdate();

  const softDelete = async (contact: Contact) => {
    const confirmed = window.confirm(
      `¿Archivar "${contact.name}"?\n\nSe puede restaurar después desde la sección de archivados.`
    );
    if (!confirmed) return;

    // 1. OPTIMISTIC: Guardar snapshot y eliminar de UI
    const snapshot = getSnapshot();
    removeContactFromCache(contact.id);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const updates = {
        is_deleted: true,
        deleted_at: new Date().toISOString(),
        deleted_by: user?.id,
        deletion_reason: 'Archivado desde gestión de contactos'
      };

      const table = tableMap[contact.origin];
      const { error } = await (supabase as any).from(table).update(updates).eq('id', contact.id);

      if (error) throw error;

      toast({
        title: "Contacto archivado",
        description: "Se puede restaurar desde la sección 'Archivados'",
      });
    } catch (error) {
      // 2. ROLLBACK: Restaurar estado previo
      restoreSnapshot(snapshot);
      console.error('Error archivando contacto:', error);
      toast({
        title: "Error",
        description: "No se pudo archivar el contacto",
        variant: "destructive",
      });
    }
  };

  const hardDelete = async (contact: Contact) => {
    const confirmed1 = window.confirm(
      `⚠️ ELIMINAR DEFINITIVAMENTE "${contact.name}"?\n\nEsta acción NO se puede deshacer.`
    );
    if (!confirmed1) return;

    const confirmed2 = window.confirm(
      '⚠️ CONFIRMACIÓN FINAL\n\n¿Estás 100% seguro? Esta acción es IRREVERSIBLE.'
    );
    if (!confirmed2) return;

    // 1. OPTIMISTIC: Guardar snapshot y eliminar de UI
    const snapshot = getSnapshot();
    removeContactFromCache(contact.id);

    try {
      const table = tableMap[contact.origin];
      const { error } = await (supabase as any).from(table).delete().eq('id', contact.id);

      if (error) throw error;

      toast({
        title: "Contacto eliminado",
        description: "Eliminación permanente completada",
      });
    } catch (error: any) {
      // 2. ROLLBACK: Restaurar estado previo
      restoreSnapshot(snapshot);
      console.error('Error eliminando contacto:', error);

      // Detectar error de FK RESTRICT (23503): contacto asignado como comprador en mandato
      const isFKError =
        error?.code === '23503' ||
        (error?.message && error.message.includes('mandato_contactos'));

      toast({
        title: isFKError ? "No se puede eliminar" : "Error",
        description: isFKError
          ? "Este contacto está asignado como comprador en uno o más mandatos. Ve a la pestaña 'Compradores' del mandato y desvincula el contacto antes de eliminarlo."
          : "No se pudo eliminar el contacto",
        variant: "destructive",
      });
    }
  };

  const bulkSoftDelete = async (contacts: Contact[], selectedIds: string[]): Promise<BulkActionResult> => {
    const result: BulkActionResult = {
      success: true,
      successCount: 0,
      failedCount: 0,
      failed: [],
    };

    // 1. OPTIMISTIC: Guardar snapshot y eliminar de UI
    const snapshot = getSnapshot();
    removeContactsFromCache(selectedIds);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const updates = {
        is_deleted: true,
        deleted_at: new Date().toISOString(),
        deleted_by: user?.id,
        deletion_reason: 'Archivado masivamente desde gestión de contactos'
      };

      // Group contacts by origin
      const byOrigin: Record<string, { ids: string[]; contacts: Contact[] }> = {};
      selectedIds.forEach(id => {
        const contact = contacts.find(c => c.id === id);
        if (contact) {
          if (!byOrigin[contact.origin]) {
            byOrigin[contact.origin] = { ids: [], contacts: [] };
          }
          byOrigin[contact.origin].ids.push(id);
          byOrigin[contact.origin].contacts.push(contact);
        }
      });

      // Process each origin
      for (const [origin, group] of Object.entries(byOrigin)) {
        const table = tableMap[origin as ContactOrigin];
        const { data, error } = await (supabase as any)
          .from(table)
          .update(updates)
          .in('id', group.ids)
          .select('id');

        if (error) {
          // Mark all in this origin as failed
          for (const contact of group.contacts) {
            result.failed.push({
              id: contact.id,
              name: contact.name,
              reason: error.message,
            });
          }
          result.failedCount += group.ids.length;
        } else {
          result.successCount += data?.length || group.ids.length;
        }
      }

      // Log audit event
      await logBulkArchiveContacts(
        user?.id || 'unknown',
        selectedIds,
        result.successCount,
        result.failedCount
      );

      result.success = result.failedCount === 0;

      // Show toast based on result
      if (result.success) {
        toast({
          title: `${result.successCount} contacto${result.successCount > 1 ? 's' : ''} archivado${result.successCount > 1 ? 's' : ''}`,
        });
      } else if (result.successCount > 0) {
        toast({
          title: `Archivados: ${result.successCount} / Fallidos: ${result.failedCount}`,
          description: "Algunos contactos no se pudieron archivar",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "No se pudieron archivar los contactos",
          variant: "destructive",
        });
      }

      return result;
    } catch (error) {
      // 2. ROLLBACK: Restaurar estado previo
      restoreSnapshot(snapshot);
      console.error('Error archivando contactos:', error);
      toast({
        title: "Error",
        description: "No se pudieron archivar los contactos",
        variant: "destructive",
      });
      return {
        success: false,
        successCount: 0,
        failedCount: selectedIds.length,
        failed: selectedIds.map(id => ({
          id,
          name: contacts.find(c => c.id === id)?.name || id,
          reason: (error as Error).message,
        })),
      };
    }
  };

  const bulkHardDelete = async (contacts: Contact[], selectedIds: string[]): Promise<BulkActionResult> => {
    const result: BulkActionResult = {
      success: true,
      successCount: 0,
      failedCount: 0,
      failed: [],
    };

    // 1. OPTIMISTIC: Guardar snapshot y eliminar de UI
    const snapshot = getSnapshot();
    removeContactsFromCache(selectedIds);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      // Group contacts by origin
      const byOrigin: Record<string, { ids: string[]; contacts: Contact[] }> = {};
      selectedIds.forEach(id => {
        const contact = contacts.find(c => c.id === id);
        if (contact) {
          if (!byOrigin[contact.origin]) {
            byOrigin[contact.origin] = { ids: [], contacts: [] };
          }
          byOrigin[contact.origin].ids.push(id);
          byOrigin[contact.origin].contacts.push(contact);
        }
      });

    // Process each origin
    for (const [origin, group] of Object.entries(byOrigin)) {
      const table = tableMap[origin as ContactOrigin];
      
      // Para valoraciones, primero desvincular referencias FK para evitar error 409
      if (origin === 'valuation') {
        // Desvincular empresas que referencian estas valoraciones
        await (supabase as any)
          .from('empresas')
          .update({ source_valuation_id: null })
          .in('source_valuation_id', group.ids);
        
        // También contactos CRM que referencian estas valoraciones
        await (supabase as any)
          .from('contactos')
          .update({ valuation_id: null })
          .in('valuation_id', group.ids);
      }
      
      const { error } = await (supabase as any)
        .from(table)
        .delete()
        .in('id', group.ids);

        if (error) {
          // Mark all in this origin as failed
          for (const contact of group.contacts) {
            result.failed.push({
              id: contact.id,
              name: contact.name,
              reason: error.message,
            });
          }
          result.failedCount += group.ids.length;
        } else {
          result.successCount += group.ids.length;
        }
      }

      // Log audit event
      await logBulkDeleteContacts(
        user?.id || 'unknown',
        selectedIds,
        result.successCount,
        result.failedCount
      );

      result.success = result.failedCount === 0;

      // Show toast based on result
      if (result.success) {
        toast({
          title: `${result.successCount} contacto${result.successCount > 1 ? 's' : ''} eliminado${result.successCount > 1 ? 's' : ''} permanentemente`,
        });
      } else if (result.successCount > 0) {
        toast({
          title: `Eliminados: ${result.successCount} / Fallidos: ${result.failedCount}`,
          description: "Algunos contactos no se pudieron eliminar",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "No se pudieron eliminar los contactos",
          variant: "destructive",
        });
      }

      return result;
    } catch (error) {
      // 2. ROLLBACK: Restaurar estado previo
      restoreSnapshot(snapshot);
      console.error('Error eliminando contactos:', error);
      toast({
        title: "Error",
        description: "No se pudieron eliminar los contactos",
        variant: "destructive",
      });
      return {
        success: false,
        successCount: 0,
        failedCount: selectedIds.length,
        failed: selectedIds.map(id => ({
          id,
          name: contacts.find(c => c.id === id)?.name || id,
          reason: (error as Error).message,
        })),
      };
    }
  };

  return {
    softDelete,
    hardDelete,
    bulkSoftDelete,
    bulkHardDelete,
  };
};
