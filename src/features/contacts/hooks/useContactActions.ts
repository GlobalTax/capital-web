import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { ContactOrigin } from '@/hooks/useUnifiedContacts';

interface Contact {
  id: string;
  name: string;
  origin: ContactOrigin;
}

export const useContactActions = (onRefetch: () => void) => {
  const { toast } = useToast();

  const softDelete = async (contact: Contact) => {
    const confirmed = window.confirm(
      `¿Archivar "${contact.name}"?\n\nSe puede restaurar después desde la sección de archivados.`
    );
    if (!confirmed) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const updates = {
        is_deleted: true,
        deleted_at: new Date().toISOString(),
        deleted_by: user?.id,
        deletion_reason: 'Archivado desde gestión de contactos'
      };

      const tableMap: Record<ContactOrigin, string> = {
        contact: 'contact_leads',
        valuation: 'company_valuations',
        collaborator: 'collaborator_applications',
        acquisition: 'acquisition_leads',
        company_acquisition: 'company_acquisition_inquiries',
        general: 'general_contact_leads',
      };

      const table = tableMap[contact.origin];
      const { error } = await (supabase as any).from(table).update(updates).eq('id', contact.id);

      if (error) throw error;

      toast({
        title: "Contacto archivado",
        description: "Se puede restaurar desde la sección 'Archivados'",
      });
      
      onRefetch();
    } catch (error) {
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

    try {
      const tableMap: Record<ContactOrigin, string> = {
        contact: 'contact_leads',
        valuation: 'company_valuations',
        collaborator: 'collaborator_applications',
        acquisition: 'acquisition_leads',
        company_acquisition: 'company_acquisition_inquiries',
        general: 'general_contact_leads',
      };

      const table = tableMap[contact.origin];
      const { error } = await (supabase as any).from(table).delete().eq('id', contact.id);

      if (error) throw error;

      toast({
        title: "Contacto eliminado",
        description: "Eliminación permanente completada",
      });
      
      onRefetch();
    } catch (error) {
      console.error('Error eliminando contacto:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el contacto",
        variant: "destructive",
      });
    }
  };

  const bulkSoftDelete = async (contacts: Contact[], selectedIds: string[]) => {
    const count = selectedIds.length;
    const confirmed = window.confirm(
      `¿Archivar ${count} contacto${count > 1 ? 's' : ''}?\n\nSe pueden restaurar después.`
    );
    if (!confirmed) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const updates = {
        is_deleted: true,
        deleted_at: new Date().toISOString(),
        deleted_by: user?.id,
        deletion_reason: 'Archivado masivamente desde gestión de contactos'
      };

      const byOrigin: Record<string, string[]> = {};
      selectedIds.forEach(id => {
        const contact = contacts.find(c => c.id === id);
        if (contact) {
          if (!byOrigin[contact.origin]) byOrigin[contact.origin] = [];
          byOrigin[contact.origin].push(id);
        }
      });

      const tableMap: Record<string, string> = {
        contact: 'contact_leads',
        valuation: 'company_valuations',
        collaborator: 'collaborator_applications',
        acquisition: 'acquisition_leads',
        company_acquisition: 'company_acquisition_inquiries',
        general: 'general_contact_leads',
      };

      const promises = Object.entries(byOrigin).map(([origin, ids]) => {
        const table = tableMap[origin];
        return (supabase as any).from(table).update(updates).in('id', ids);
      });

      await Promise.all(promises);

      toast({
        title: `${count} contacto${count > 1 ? 's' : ''} archivado${count > 1 ? 's' : ''}`,
      });
      
      onRefetch();
      return true;
    } catch (error) {
      console.error('Error archivando contactos:', error);
      toast({
        title: "Error",
        description: "No se pudieron archivar los contactos",
        variant: "destructive",
      });
      return false;
    }
  };

  const bulkHardDelete = async (contacts: Contact[], selectedIds: string[]) => {
    const count = selectedIds.length;
    
    const confirmed1 = window.confirm(
      `⚠️ ELIMINAR ${count} CONTACTO${count > 1 ? 'S' : ''} DEFINITIVAMENTE?\n\nEsta acción NO se puede deshacer.`
    );
    if (!confirmed1) return;

    const confirmed2 = window.confirm(
      '⚠️ CONFIRMACIÓN FINAL\n\n¿Eliminar permanentemente? IRREVERSIBLE.'
    );
    if (!confirmed2) return;

    try {
      const byOrigin: Record<string, string[]> = {};
      selectedIds.forEach(id => {
        const contact = contacts.find(c => c.id === id);
        if (contact) {
          if (!byOrigin[contact.origin]) byOrigin[contact.origin] = [];
          byOrigin[contact.origin].push(id);
        }
      });

      const tableMap: Record<string, string> = {
        contact: 'contact_leads',
        valuation: 'company_valuations',
        collaborator: 'collaborator_applications',
        acquisition: 'acquisition_leads',
        company_acquisition: 'company_acquisition_inquiries',
        general: 'general_contact_leads',
      };

      const promises = Object.entries(byOrigin).map(([origin, ids]) => {
        const table = tableMap[origin];
        return (supabase as any).from(table).delete().in('id', ids);
      });

      await Promise.all(promises);

      toast({
        title: `${count} contacto${count > 1 ? 's' : ''} eliminado${count > 1 ? 's' : ''} permanentemente`,
      });
      
      onRefetch();
      return true;
    } catch (error) {
      console.error('Error eliminando contactos:', error);
      toast({
        title: "Error",
        description: "No se pudieron eliminar los contactos",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    softDelete,
    hardDelete,
    bulkSoftDelete,
    bulkHardDelete,
  };
};
