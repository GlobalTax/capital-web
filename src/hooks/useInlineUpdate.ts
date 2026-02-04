import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type TableName = keyof Database['public']['Tables'];

interface UseInlineUpdateOptions {
  table: TableName;
  queryKey: string[];
  showToast?: boolean;
  successMessage?: string;
  errorMessage?: string;
}

interface UpdateResult {
  success: boolean;
  error?: Error;
}

/**
 * Generic hook for inline cell updates with optimistic UI
 * Works with any Supabase table and React Query cache
 */
export const useInlineUpdate = <T extends Record<string, any>>({
  table,
  queryKey,
  showToast = true,
  successMessage = 'Guardado',
  errorMessage = 'Error al guardar',
}: UseInlineUpdateOptions) => {
  const queryClient = useQueryClient();

  /**
   * Update a single field on a record
   */
  const update = useCallback(async (
    id: string,
    field: string,
    value: any
  ): Promise<UpdateResult> => {
    // Get current cache snapshot for potential rollback
    const previousData = queryClient.getQueryData<T[]>(queryKey);
    
    // Cancel any in-flight queries
    await queryClient.cancelQueries({ queryKey });

    // Optimistic update
    queryClient.setQueryData<T[]>(queryKey, (old = []) =>
      old.map((item) =>
        (item as any).id === id ? { ...item, [field]: value } : item
      )
    );

    try {
      const { error } = await supabase
        .from(table)
        .update({ [field]: value, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      // Silently revalidate in background
      queryClient.invalidateQueries({
        queryKey,
        refetchType: 'none',
      });

      if (showToast) {
        toast.success(successMessage, { duration: 1500 });
      }

      return { success: true };
    } catch (error) {
      console.error(`Error updating ${table}.${field}:`, error);
      
      // Rollback on error
      if (previousData) {
        queryClient.setQueryData(queryKey, previousData);
      }

      if (showToast) {
        toast.error(errorMessage);
      }

      return { success: false, error: error as Error };
    }
  }, [table, queryKey, queryClient, showToast, successMessage, errorMessage]);

  /**
   * Update multiple fields on a record at once
   */
  const updateMultiple = useCallback(async (
    id: string,
    updates: Partial<T>
  ): Promise<UpdateResult> => {
    const previousData = queryClient.getQueryData<T[]>(queryKey);
    
    await queryClient.cancelQueries({ queryKey });

    // Optimistic update
    queryClient.setQueryData<T[]>(queryKey, (old = []) =>
      old.map((item) =>
        (item as any).id === id ? { ...item, ...updates } : item
      )
    );

    try {
      const { error } = await supabase
        .from(table)
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      queryClient.invalidateQueries({
        queryKey,
        refetchType: 'none',
      });

      if (showToast) {
        toast.success(successMessage, { duration: 1500 });
      }

      return { success: true };
    } catch (error) {
      console.error(`Error updating ${table}:`, error);
      
      if (previousData) {
        queryClient.setQueryData(queryKey, previousData);
      }

      if (showToast) {
        toast.error(errorMessage);
      }

      return { success: false, error: error as Error };
    }
  }, [table, queryKey, queryClient, showToast, successMessage, errorMessage]);

  return {
    update,
    updateMultiple,
  };
};

/**
 * Table capabilities map - defines which columns each table supports
 * This prevents SQL errors from trying to update non-existent columns
 */
const tableCapabilities: Record<string, {
  hasUpdatedAt: boolean;
  hasLeadReceivedAt: boolean;
  hasLeadStatusCrm: boolean;
  hasAcquisitionChannel: boolean;
  hasLocation: boolean;
  hasLeadForm: boolean;
}> = {
  'company_valuations': {
    hasUpdatedAt: true,
    hasLeadReceivedAt: true,
    hasLeadStatusCrm: true,
    hasAcquisitionChannel: true,
    hasLocation: true,
    hasLeadForm: true,
  },
  'contact_leads': {
    hasUpdatedAt: true,
    hasLeadReceivedAt: true,
    hasLeadStatusCrm: true,
    hasAcquisitionChannel: true,
    hasLocation: true,
    hasLeadForm: true,
  },
  'collaborator_applications': {
    hasUpdatedAt: true,
    hasLeadReceivedAt: true,
    hasLeadStatusCrm: true,
    hasAcquisitionChannel: true,
    hasLocation: false,
    hasLeadForm: true,
  },
  'acquisition_leads': {
    hasUpdatedAt: true,
    hasLeadReceivedAt: true,
    hasLeadStatusCrm: true,
    hasAcquisitionChannel: true,
    hasLocation: false,
    hasLeadForm: true,
  },
  'advisor_valuations': {
    hasUpdatedAt: true,
    hasLeadReceivedAt: true,
    hasLeadStatusCrm: true,
    hasAcquisitionChannel: true,
    hasLocation: false,
    hasLeadForm: true,
  },
  'general_contact_leads': {
    hasUpdatedAt: true,
    hasLeadReceivedAt: true,
    hasLeadStatusCrm: true,
    hasAcquisitionChannel: true,
    hasLocation: false,
    hasLeadForm: true,
  },
  'company_acquisition_inquiries': {
    hasUpdatedAt: true,
    hasLeadReceivedAt: true,
    hasLeadStatusCrm: true,
    hasAcquisitionChannel: true,
    hasLocation: false,
    hasLeadForm: true,
  },
  'buyer_contacts': {
    hasUpdatedAt: true,
    hasLeadReceivedAt: true,
    hasLeadStatusCrm: false,
    hasAcquisitionChannel: false,
    hasLocation: false,
    hasLeadForm: false,
  },
  'accountex_leads': {
    hasUpdatedAt: true,
    hasLeadReceivedAt: false,
    hasLeadStatusCrm: false,
    hasAcquisitionChannel: false,
    hasLocation: false,
    hasLeadForm: false,
  },
};

/**
 * Specialized hook for updating unified contacts
 * Handles the complexity of different origin tables with capability validation
 */
export const useContactInlineUpdate = () => {
  const queryClient = useQueryClient();

  const update = useCallback(async (
    id: string,
    origin: string,
    field: string,
    value: any
  ): Promise<{ success: boolean; error?: Error }> => {
    // Map origin to table name
    const tableMap: Record<string, string> = {
      'valuation': 'company_valuations',
      'collaborator': 'collaborator_applications',
      'acquisition': 'acquisition_leads',
      'contact': 'contact_leads',
      'accountex': 'accountex_leads',
      'advisor': 'advisor_valuations',
      'general': 'general_contact_leads',
      'company_acquisition': 'company_acquisition_inquiries',
      'buyer': 'buyer_contacts',
    };

    const table = tableMap[origin];
    if (!table) {
      console.error(`[InlineUpdate] Unknown origin: ${origin}`);
      toast.error('Error: origen de lead desconocido');
      return { success: false, error: new Error(`Unknown origin: ${origin}`) };
    }

    // Get table capabilities
    const capabilities = tableCapabilities[table];
    if (!capabilities) {
      console.error(`[InlineUpdate] No capabilities defined for table: ${table}`);
      toast.error('Error: configuración de tabla no encontrada');
      return { success: false, error: new Error(`No capabilities for table: ${table}`) };
    }

    // Validate field is supported by this table
    if (field === 'lead_status_crm' && !capabilities.hasLeadStatusCrm) {
      console.warn(`[InlineUpdate] Table ${table} does not support lead_status_crm`);
      toast.error('Este tipo de lead no soporta cambio de estado');
      return { success: false, error: new Error(`${table} does not support lead_status_crm`) };
    }
    if (field === 'lead_received_at' && !capabilities.hasLeadReceivedAt) {
      console.warn(`[InlineUpdate] Table ${table} does not support lead_received_at`);
      toast.error('Este tipo de lead no soporta cambio de fecha de registro');
      return { success: false, error: new Error(`${table} does not support lead_received_at`) };
    }
    if (field === 'acquisition_channel_id' && !capabilities.hasAcquisitionChannel) {
      console.warn(`[InlineUpdate] Table ${table} does not support acquisition_channel_id`);
      toast.error('Este tipo de lead no soporta cambio de canal');
      return { success: false, error: new Error(`${table} does not support acquisition_channel_id`) };
    }
    if (field === 'location' && !capabilities.hasLocation) {
      console.warn(`[InlineUpdate] Table ${table} does not support location`);
      toast.error('Este tipo de lead no soporta cambio de ubicación');
      return { success: false, error: new Error(`${table} does not support location`) };
    }
    if (field === 'lead_form' && !capabilities.hasLeadForm) {
      console.warn(`[InlineUpdate] Table ${table} does not support lead_form`);
      toast.error('Este tipo de lead no soporta cambio de formulario');
      return { success: false, error: new Error(`${table} does not support lead_form`) };
    }

    // Map field names for specific tables
    const fieldMap: Record<string, Record<string, string>> = {
      'company_valuations': {
        'company': 'company_name',
        'name': 'contact_name',
        'industry': 'industry',
        'location': 'location',
        'lead_received_at': 'lead_received_at',
        'lead_status_crm': 'lead_status_crm',
        'lead_form': 'lead_form',
      },
      'collaborator_applications': {
        'name': 'full_name',
        'lead_received_at': 'lead_received_at',
        'lead_status_crm': 'lead_status_crm',
        'lead_form': 'lead_form',
      },
      'acquisition_leads': {
        'name': 'full_name',
        'industry': 'sectors_of_interest',
        'lead_received_at': 'lead_received_at',
        'lead_status_crm': 'lead_status_crm',
        'lead_form': 'lead_form',
      },
      'contact_leads': {
        'name': 'full_name',
        'industry': 'sector',
        'location': 'location',
        'lead_received_at': 'lead_received_at',
        'lead_status_crm': 'lead_status_crm',
        'lead_form': 'lead_form',
      },
      'accountex_leads': {
        'name': 'full_name',
        'industry': 'sectors_of_interest',
      },
      'advisor_valuations': {
        'company': 'company_name',
        'name': 'contact_name',
        'lead_received_at': 'lead_received_at',
        'lead_status_crm': 'lead_status_crm',
        'lead_form': 'lead_form',
      },
      'general_contact_leads': {
        'name': 'full_name',
        'lead_received_at': 'lead_received_at',
        'lead_status_crm': 'lead_status_crm',
        'lead_form': 'lead_form',
      },
      'company_acquisition_inquiries': {
        'name': 'full_name',
        'lead_received_at': 'lead_received_at',
        'lead_status_crm': 'lead_status_crm',
        'lead_form': 'lead_form',
      },
      'buyer_contacts': {
        'name': 'full_name',
        'lead_received_at': 'lead_received_at',
      },
    };

    const mappedField = fieldMap[table]?.[field] ?? field;

    // Dev logging for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log(`[InlineUpdate] Updating ${table}.${mappedField}`, { id, origin, field, value });
    }

    const previousData = queryClient.getQueryData(['unified-contacts']);
    
    await queryClient.cancelQueries({ queryKey: ['unified-contacts'] });

    // Optimistic update - also update mappedField to ensure UI consistency
    queryClient.setQueryData(['unified-contacts'], (old: any[] = []) =>
      old.map((item) =>
        item.id === id ? { ...item, [field]: value, [mappedField]: value } : item
      )
    );

    try {
      // VALIDATION: For status updates, verify the status_key exists and is active
      if (field === 'lead_status_crm' && value) {
        const { data: statusData, error: statusError } = await supabase
          .from('contact_statuses')
          .select('status_key, is_active')
          .eq('status_key', value)
          .maybeSingle();
        
        if (statusError) {
          throw new Error('Error al validar el estado');
        }
        
        if (!statusData) {
          throw new Error('El estado seleccionado no existe o ha sido eliminado');
        }
        
        // Allow updating to inactive status (for legacy contacts) but warn
        if (!statusData.is_active) {
          console.warn(`[InlineUpdate] Assigning inactive status: ${value}`);
        }
      }

      // Build payload dynamically based on table capabilities
      const payload: Record<string, any> = { [mappedField]: value };
      
      // Only add updated_at if the table supports it
      if (capabilities.hasUpdatedAt) {
        payload.updated_at = new Date().toISOString();
      }

      // Use any type to avoid complex TypeScript inference issues with dynamic table names
      const { error } = await (supabase as any)
        .from(table)
        .update(payload)
        .eq('id', id);

      if (error) throw error;

      // Dev logging
      if (process.env.NODE_ENV === 'development') {
        console.log(`[InlineUpdate] Success:`, { table, id, field: mappedField, value });
      }

      queryClient.invalidateQueries({
        queryKey: ['unified-contacts'],
        refetchType: 'active',
      });
      
      // Also invalidate contacts-v2 for table/pipeline sync
      queryClient.invalidateQueries({
        queryKey: ['contacts-v2'],
        refetchType: 'active',
      });

      // Cross-invalidation for Leads ↔ Prospects sync
      if (field === 'lead_status_crm') {
        queryClient.invalidateQueries({ queryKey: ['contacts-v2'] });
        queryClient.invalidateQueries({ queryKey: ['prospects'] });
        
        // Check if new status is a prospect stage for user feedback
        if (value) {
          const { data: statusData } = await supabase
            .from('contact_statuses')
            .select('is_prospect_stage, label')
            .eq('status_key', value)
            .single();
          
          if (statusData?.is_prospect_stage) {
            toast.success(`Movido a Prospectos: ${statusData.label}`, { 
              duration: 3000,
              action: {
                label: 'Ver Prospectos',
                onClick: () => window.location.href = '/admin/prospectos',
              }
            });
            return { success: true };
          }
        }
      }

      toast.success('Guardado', { duration: 1500 });
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      console.error(`[InlineUpdate] Error updating ${table}.${mappedField}:`, error);
      
      if (previousData) {
        queryClient.setQueryData(['unified-contacts'], previousData);
      }

      toast.error('Error al guardar', { description: errorMessage });
      return { success: false, error: error as Error };
    }
  }, [queryClient]);

  return { update };
};
