import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ContactOrigin } from '@/hooks/useUnifiedContacts';

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
      };
    case 'advisor':
      return {
        contact_name: data.name,
        email: data.email,
        phone: data.phone,
        company_name: data.company,
        cif: data.cif,
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

  const updateMutation = useMutation({
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
    onSuccess: () => {
      // Invalidate all contact-related queries
      queryClient.invalidateQueries({ queryKey: ['unified-contacts'] });
      queryClient.invalidateQueries({ queryKey: ['contact-leads'] });
      queryClient.invalidateQueries({ queryKey: ['company-valuations'] });
      queryClient.invalidateQueries({ queryKey: ['collaborator-applications'] });
      
      toast({
        title: 'Contacto actualizado',
        description: 'Los cambios se han guardado correctamente.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error al actualizar',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    updateContact: updateMutation.mutate,
    updateContactAsync: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
};
