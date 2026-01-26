import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { LeadPotentialBuyer, LeadPotentialBuyerFormData } from '@/types/leadPotentialBuyers';
import { toast } from 'sonner';

export const useLeadPotentialBuyers = (leadId: string, leadOrigin: string) => {
  const queryClient = useQueryClient();
  const queryKey = ['lead-potential-buyers', leadId, leadOrigin];

  const { data: buyers = [], isLoading, refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lead_potential_buyers')
        .select('*')
        .eq('lead_id', leadId)
        .eq('lead_origin', leadOrigin)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as LeadPotentialBuyer[];
    },
    enabled: !!leadId && !!leadOrigin,
  });

  const createMutation = useMutation({
    mutationFn: async (formData: LeadPotentialBuyerFormData) => {
      const { data: user } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('lead_potential_buyers')
        .insert({
          lead_id: leadId,
          lead_origin: leadOrigin,
          name: formData.name,
          logo_url: formData.logo_url || null,
          website: formData.website || null,
          description: formData.description || null,
          sector_focus: formData.sector_focus || null,
          revenue_range: formData.revenue_range || null,
          contact_name: formData.contact_name || null,
          contact_email: formData.contact_email || null,
          contact_phone: formData.contact_phone || null,
          priority: formData.priority || 0,
          status: formData.status || 'identificado',
          notes: formData.notes || null,
          added_by: user?.user?.id || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success('Comprador añadido correctamente');
    },
    onError: (error) => {
      console.error('Error creating potential buyer:', error);
      toast.error('Error al añadir comprador');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data: formData }: { id: string; data: Partial<LeadPotentialBuyerFormData> }) => {
      const { data, error } = await supabase
        .from('lead_potential_buyers')
        .update({
          ...formData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success('Comprador actualizado');
    },
    onError: (error) => {
      console.error('Error updating potential buyer:', error);
      toast.error('Error al actualizar comprador');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('lead_potential_buyers')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success('Comprador eliminado');
    },
    onError: (error) => {
      console.error('Error deleting potential buyer:', error);
      toast.error('Error al eliminar comprador');
    },
  });

  return {
    buyers,
    isLoading,
    refetch,
    createBuyer: createMutation.mutateAsync,
    updateBuyer: updateMutation.mutateAsync,
    deleteBuyer: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
