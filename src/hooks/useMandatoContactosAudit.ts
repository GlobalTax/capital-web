/**
 * Hook para auditoría y restauración de contactos eliminados en mandato_contactos
 *
 * Causa raíz del bug: La FK contacto_id → contactos(id) tenía ON DELETE CASCADE,
 * por lo que al eliminar un contacto de la tabla 'contactos', se eliminaba
 * silenciosamente su vinculación como comprador en mandato_contactos.
 *
 * Fix: FK cambiada a ON DELETE RESTRICT + este sistema de auditoría.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface MandatoContactoAuditEntry {
  id: string;
  mandato_contactos_id: string | null;
  mandato_id: string;
  contacto_id: string;
  rol: string | null;
  action: 'INSERT' | 'DELETE' | 'RESTORE';
  performed_by: string | null;
  performed_at: string;
  deletion_reason: string | null;
  contacto_snapshot: {
    id?: string;
    nombre?: string;
    apellidos?: string;
    email?: string;
    cargo?: string;
    telefono?: string;
    empresa_principal_id?: string;
  } | null;
}

export function useMandatoContactosAudit(mandatoId: string | undefined) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: auditLog = [], isLoading } = useQuery({
    queryKey: ['mandato-contactos-audit', mandatoId],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('mandato_contactos_audit_log')
        .select('*')
        .eq('mandato_id', mandatoId!)
        .order('performed_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return (data || []) as MandatoContactoAuditEntry[];
    },
    enabled: !!mandatoId,
    staleTime: 1000 * 30, // 30s
  });

  /**
   * Contactos que fueron eliminados y no han sido restaurados después.
   * Filtra entradas DELETE sin RESTORE posterior para el mismo contacto.
   */
  const deletedContacts = auditLog.filter((entry) => {
    if (entry.action !== 'DELETE') return false;

    // Verificar que no hay un RESTORE o INSERT posterior para este contacto
    const hasSubsequentRestore = auditLog.some(
      (e) =>
        (e.action === 'RESTORE' || e.action === 'INSERT') &&
        e.contacto_id === entry.contacto_id &&
        e.performed_at > entry.performed_at
    );

    return !hasSubsequentRestore;
  });

  const restoreMutation = useMutation({
    mutationFn: async (entry: MandatoContactoAuditEntry) => {
      let contactoId = entry.contacto_id;

      // 1. Verificar si el contacto aún existe con su ID original
      const { data: existing } = await supabase
        .from('contactos' as any)
        .select('id')
        .eq('id', contactoId)
        .maybeSingle();

      if (!existing) {
        // El contacto fue eliminado — buscar por email en el snapshot
        const email = entry.contacto_snapshot?.email;
        if (!email) {
          throw new Error(
            'No se puede restaurar: el contacto fue eliminado y no hay email en el historial.'
          );
        }

        const { data: byEmail } = await supabase
          .from('contactos' as any)
          .select('id')
          .eq('email', email)
          .maybeSingle();

        if (!byEmail) {
          throw new Error(
            `No se puede restaurar: el contacto con email "${email}" ya no existe. Créalo primero en el CRM.`
          );
        }

        contactoId = (byEmail as any).id;
      }

      // 2. Verificar que no está ya vinculado (evitar duplicado)
      const { data: alreadyLinked } = await supabase
        .from('mandato_contactos' as any)
        .select('id')
        .eq('mandato_id', mandatoId!)
        .eq('contacto_id', contactoId)
        .maybeSingle();

      if (alreadyLinked) {
        throw new Error('Este contacto ya está asignado a este mandato.');
      }

      // 3. Re-insertar en mandato_contactos
      const { error: insertError } = await supabase
        .from('mandato_contactos' as any)
        .insert({
          mandato_id: mandatoId!,
          contacto_id: contactoId,
          rol: entry.rol || 'comprador',
        });

      if (insertError) throw insertError;

      // 4. Registrar la restauración en el audit log
      await (supabase as any)
        .from('mandato_contactos_audit_log')
        .insert({
          mandato_id: mandatoId!,
          contacto_id: contactoId,
          rol: entry.rol || 'comprador',
          action: 'RESTORE',
          contacto_snapshot: entry.contacto_snapshot,
        });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mandato-contactos-audit', mandatoId] });
      // Invalidar la query principal de compradores del mandato
      queryClient.invalidateQueries({ queryKey: ['mandato-contactos', mandatoId] });
      queryClient.invalidateQueries({ queryKey: ['mandato', mandatoId] });
      toast({ title: '✅ Contacto restaurado correctamente' });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error al restaurar',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    auditLog,
    deletedContacts,
    isLoading,
    restoreContacto: (entry: MandatoContactoAuditEntry) => restoreMutation.mutate(entry),
    isRestoring: restoreMutation.isPending,
  };
}
