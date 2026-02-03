import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ContactOrigin, UnifiedContact } from '@/hooks/useUnifiedContacts';
import { useOptimisticContactUpdate } from './useOptimisticContactUpdate';

export interface ContactUpdateData {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  // Valuation specific
  industry?: string;
  employee_range?: string;
  cif?: string;
  revenue?: number;
  ebitda?: number;
  // Collaborator specific
  profession?: string;
  experience?: string;
  motivation?: string;
  // Contact/Acquisition specific
  service_type?: string;
  company_size?: string;
  sectors_of_interest?: string;
  investment_budget?: string;
  target_timeline?: string;
  preferred_location?: string;
  // CRM fields
  lead_status_crm?: string;
  assigned_to?: string;
  // Channel
  acquisition_channel_id?: string;
}

// Map UI fields to table-specific fields
const mapFieldsToTable = (origin: ContactOrigin, data: ContactUpdateData) => {
  switch (origin) {
    case 'valuation':
      return {
        contact_name: data.name,
        email: data.email,
        phone: data.phone,
        company_name: data.company,
        industry: data.industry,
        employee_range: data.employee_range,
        cif: data.cif,
        revenue: data.revenue,
        ebitda: data.ebitda,
        lead_status_crm: data.lead_status_crm,
        assigned_to: data.assigned_to,
        acquisition_channel_id: data.acquisition_channel_id,
      };
    case 'collaborator':
      return {
        full_name: data.name,
        email: data.email,
        phone: data.phone,
        company: data.company,
        profession: data.profession,
        experience: data.experience,
        motivation: data.motivation,
        lead_status_crm: data.lead_status_crm,
        assigned_to: data.assigned_to,
        acquisition_channel_id: data.acquisition_channel_id,
      };
    case 'acquisition':
      return {
        full_name: data.name,
        email: data.email,
        phone: data.phone,
        company: data.company,
        cif: data.cif,
        sectors_of_interest: data.sectors_of_interest,
        investment_budget: data.investment_budget,
        target_timeline: data.target_timeline,
        acquisition_channel_id: data.acquisition_channel_id,
      };
    case 'company_acquisition':
      return {
        full_name: data.name,
        email: data.email,
        phone: data.phone,
        company: data.company,
        cif: data.cif,
        sectors_of_interest: data.sectors_of_interest,
        investment_budget: data.investment_budget,
        target_timeline: data.target_timeline,
        preferred_location: data.preferred_location,
        acquisition_channel_id: data.acquisition_channel_id,
      };
    case 'advisor':
      return {
        contact_name: data.name,
        email: data.email,
        phone: data.phone,
        company_name: data.company,
        cif: data.cif,
        acquisition_channel_id: data.acquisition_channel_id,
      };
    case 'contact':
    case 'general':
    default:
      return {
        full_name: data.name,
        email: data.email,
        phone: data.phone,
        company: data.company,
        cif: data.cif,
        service_type: data.service_type,
        company_size: data.company_size,
        lead_status_crm: data.lead_status_crm,
        assigned_to: data.assigned_to,
        acquisition_channel_id: data.acquisition_channel_id,
      };
  }
};

// Get table name from origin
const getTableName = (origin: ContactOrigin): string => {
  switch (origin) {
    case 'valuation':
      return 'company_valuations';
    case 'collaborator':
      return 'collaborator_applications';
    case 'acquisition':
      return 'acquisition_leads';
    case 'company_acquisition':
      return 'company_acquisition_inquiries';
    case 'advisor':
      return 'advisor_valuations';
    case 'contact':
    case 'general':
    default:
      return 'contact_leads';
  }
};

export const useContactUpdate = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { 
    updateContactInCache, 
    getSnapshot, 
    restoreSnapshot,
    cancelQueries 
  } = useOptimisticContactUpdate();

  const updateMutation = useMutation({
    // 1. OPTIMISTIC UPDATE (antes del request)
    onMutate: async ({
      id,
      data,
    }: {
      id: string;
      origin: ContactOrigin;
      data: ContactUpdateData;
    }) => {
      // Cancelar queries en vuelo
      await cancelQueries();

      // Guardar snapshot para rollback
      const previousContacts = getSnapshot();

      // Actualizar cache optimísticamente
      updateContactInCache(id, data as Partial<UnifiedContact>);

      return { previousContacts };
    },

    mutationFn: async ({
      id,
      origin,
      data,
    }: {
      id: string;
      origin: ContactOrigin;
      data: ContactUpdateData;
    }) => {
      const tableName = getTableName(origin);
      const mappedData = mapFieldsToTable(origin, data);

      // Filter out undefined values
      const cleanData = Object.fromEntries(
        Object.entries(mappedData).filter(([_, v]) => v !== undefined)
      );

      const { error } = await supabase
        .from(tableName as any)
        .update(cleanData)
        .eq('id', id);

      if (error) throw error;
      return { id, origin, data: cleanData };
    },

    // 2. ROLLBACK en error
    onError: (error: Error, variables, context) => {
      if (context?.previousContacts) {
        restoreSnapshot(context.previousContacts);
      }
      toast({
        title: 'Error al actualizar',
        description: error.message,
        variant: 'destructive',
      });
    },

    // 3. REVALIDACIÓN silenciosa en éxito
    onSuccess: () => {
      // Solo invalida queries en background, no refetch inmediato
      queryClient.invalidateQueries({
        queryKey: ['unified-contacts'],
        refetchType: 'none',
      });
      queryClient.invalidateQueries({
        queryKey: ['contact-leads'],
        refetchType: 'none',
      });
      queryClient.invalidateQueries({
        queryKey: ['company-valuations'],
        refetchType: 'none',
      });
      
      // Invalidar prospectos cuando cambia un estado (sincronización inmediata)
      queryClient.invalidateQueries({
        queryKey: ['prospects'],
      });

      toast({
        title: 'Contacto actualizado',
        description: 'Los cambios se han guardado correctamente.',
      });
    },
  });

  return {
    updateContact: updateMutation.mutate,
    updateContactAsync: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
};
