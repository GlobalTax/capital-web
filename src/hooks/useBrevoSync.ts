import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { ContactOrigin } from '@/hooks/useUnifiedContacts';

interface SyncResult {
  success: { id: string; email: string }[];
  failed: { id: string; error: string }[];
  total: number;
}

const originToTable: Record<ContactOrigin, string> = {
  'contact': 'contact_leads',
  'valuation': 'company_valuations',
  'collaborator': 'collaborator_applications',
  'acquisition': 'acquisition_leads',
  'company_acquisition': 'company_acquisition_inquiries',
  'general': 'contact_leads'
};

export const useBrevoSync = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const { toast } = useToast();

  const fetchContactRecord = async (table: string, contactId: string): Promise<any> => {
    // Use dynamic table selection with type assertion
    const { data, error } = await (supabase as any)
      .from(table)
      .select('*')
      .eq('id', contactId)
      .single();

    if (error) throw error;
    return data;
  };

  const syncToBrevo = async (contactIds: string[], origins: Map<string, ContactOrigin>) => {
    setIsSyncing(true);
    
    try {
      toast({
        title: '🔄 Sincronizando con Brevo...',
        description: `Enviando ${contactIds.length} contacto(s)`,
      });

      const results: SyncResult = {
        success: [],
        failed: [],
        total: contactIds.length
      };

      // Procesar cada contacto
      for (const contactId of contactIds) {
        try {
          const origin = origins.get(contactId);
          if (!origin) {
            results.failed.push({ id: contactId, error: 'Unknown origin' });
            continue;
          }

          const table = originToTable[origin];
          
          // Obtener datos completos del contacto
          const record = await fetchContactRecord(table, contactId);

          if (!record) {
            results.failed.push({ id: contactId, error: 'Contact not found' });
            continue;
          }

          // Llamar al edge function sync-to-brevo
          const { error: syncError } = await supabase.functions.invoke('sync-to-brevo', {
            body: {
              record,
              table,
              type: 'manual'
            }
          });

          if (syncError) {
            results.failed.push({ id: contactId, error: syncError.message });
          } else {
            results.success.push({ id: contactId, email: record.email || 'unknown' });
          }
        } catch (err: any) {
          results.failed.push({ id: contactId, error: err.message });
        }
      }

      if (results.success.length > 0) {
        toast({
          title: '✅ Sincronización exitosa',
          description: `${results.success.length}/${results.total} contactos enviados a Brevo`,
          variant: 'default'
        });
      }

      if (results.failed.length > 0) {
        toast({
          title: '⚠️ Algunos contactos fallaron',
          description: `${results.failed.length} contactos no pudieron sincronizarse`,
          variant: 'destructive'
        });
      }

      return results;

    } catch (error: any) {
      console.error('Brevo sync error:', error);
      toast({
        title: '❌ Error de sincronización',
        description: error.message || 'No se pudo conectar con Brevo',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setIsSyncing(false);
    }
  };

  const syncBulkContacts = async (contactIds: string[], contacts: Array<{ id: string; origin: ContactOrigin }>) => {
    const origins = new Map<string, ContactOrigin>();
    contacts.forEach(contact => {
      if (contactIds.includes(contact.id)) {
        origins.set(contact.id, contact.origin);
      }
    });
    
    return syncToBrevo(contactIds, origins);
  };

  return {
    syncBulkContacts,
    isSyncing
  };
};
