// =============================================
// CORPORATE CONTACTS HOOKS
// =============================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  CorporateContact, 
  CorporateContactFormData 
} from '@/types/corporateBuyers';
import { toast } from 'sonner';

const QUERY_KEY = 'corporate-contacts';
const BUYERS_KEY = 'corporate-buyers';

// Fetch contacts for a specific buyer
export const useCorporateContacts = (buyerId?: string) => {
  return useQuery({
    queryKey: [QUERY_KEY, 'by-buyer', buyerId],
    queryFn: async () => {
      if (!buyerId) return [];

      const { data, error } = await supabase
        .from('corporate_contacts')
        .select('*')
        .eq('buyer_id', buyerId)
        .eq('is_deleted', false)
        .order('is_primary_contact', { ascending: false })
        .order('full_name', { ascending: true });

      if (error) throw error;
      return data as CorporateContact[];
    },
    enabled: !!buyerId,
  });
};

// Fetch all contacts with buyer info
export const useCorporateContactsWithBuyers = () => {
  return useQuery({
    queryKey: [QUERY_KEY, 'with-buyers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('corporate_contacts')
        .select(`
          *,
          buyer:corporate_buyers!buyer_id(id, name, buyer_type, country_base)
        `)
        .eq('is_deleted', false)
        .order('full_name', { ascending: true });

      if (error) throw error;
      return data as CorporateContact[];
    },
  });
};

// Create contact
export const useCreateCorporateContact = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CorporateContactFormData) => {
      const { data: result, error } = await supabase
        .from('corporate_contacts')
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return result as CorporateContact;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [BUYERS_KEY, variables.buyer_id] });
      toast.success('Contacto creado correctamente');
    },
    onError: (error) => {
      console.error('Error creating contact:', error);
      toast.error('Error al crear el contacto');
    },
  });
};

// Update contact
export const useUpdateCorporateContact = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CorporateContactFormData> }) => {
      const { data: result, error } = await supabase
        .from('corporate_contacts')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result as CorporateContact;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Contacto actualizado');
    },
    onError: (error) => {
      console.error('Error updating contact:', error);
      toast.error('Error al actualizar el contacto');
    },
  });
};

// Soft delete contact
export const useDeleteCorporateContact = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('corporate_contacts')
        .update({ is_deleted: true })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Contacto eliminado');
    },
    onError: (error) => {
      console.error('Error deleting contact:', error);
      toast.error('Error al eliminar el contacto');
    },
  });
};
