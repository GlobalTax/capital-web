// ============= USE BUYER CONTACTS HOOK =============
// Hook para gestión de contactos de campaña compras

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BuyerContact, BuyerContactStatus } from '@/types/buyer-contacts';
import { toast } from 'sonner';

export const useBuyerContacts = () => {
  const queryClient = useQueryClient();

  // Obtener todos los contactos
  const { data: contacts = [], isLoading, error, refetch } = useQuery({
    queryKey: ['buyer-contacts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('buyer_contacts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as BuyerContact[];
    },
  });

  // Obtener un contacto por ID
  const getContact = async (id: string): Promise<BuyerContact | null> => {
    const { data, error } = await supabase
      .from('buyer_contacts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching contact:', error);
      return null;
    }
    return data as BuyerContact;
  };

  // Actualizar contacto
  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<BuyerContact> }) => {
      const { data, error } = await supabase
        .from('buyer_contacts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buyer-contacts'] });
      toast.success('Contacto actualizado');
    },
    onError: (error) => {
      console.error('Error updating contact:', error);
      toast.error('Error al actualizar el contacto');
    },
  });

  // Eliminar contacto
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('buyer_contacts')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buyer-contacts'] });
      toast.success('Contacto eliminado');
    },
    onError: (error) => {
      console.error('Error deleting contact:', error);
      toast.error('Error al eliminar el contacto');
    },
  });

  // Cambiar estado
  const updateStatus = async (id: string, status: BuyerContactStatus) => {
    return updateMutation.mutateAsync({ id, updates: { status } });
  };

  // Búsqueda de contactos
  const searchContacts = (searchTerm: string) => {
    if (!searchTerm.trim()) return contacts;
    
    const term = searchTerm.toLowerCase();
    return contacts.filter(c => 
      c.full_name?.toLowerCase().includes(term) ||
      c.email?.toLowerCase().includes(term) ||
      c.company?.toLowerCase().includes(term) ||
      c.phone?.includes(term)
    );
  };

  // Filtrar por estado
  const filterByStatus = (status: BuyerContactStatus | 'all') => {
    if (status === 'all') return contacts;
    return contacts.filter(c => c.status === status);
  };

  // Estadísticas
  const stats = {
    total: contacts.length,
    nuevo: contacts.filter(c => c.status === 'nuevo').length,
    contactado: contacts.filter(c => c.status === 'contactado').length,
    calificado: contacts.filter(c => c.status === 'calificado').length,
    descartado: contacts.filter(c => c.status === 'descartado').length,
  };

  return {
    contacts,
    isLoading,
    error,
    refetch,
    getContact,
    updateContact: updateMutation.mutate,
    deleteContact: deleteMutation.mutate,
    updateStatus,
    searchContacts,
    filterByStatus,
    stats,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
