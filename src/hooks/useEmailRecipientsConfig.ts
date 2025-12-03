import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface EmailRecipient {
  id: string;
  email: string;
  name: string;
  role: string;
  phone?: string;
  is_default_copy: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useEmailRecipientsConfig = () => {
  const queryClient = useQueryClient();

  const { data: recipients, isLoading } = useQuery({
    queryKey: ['email-recipients-config'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_recipients_config')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as EmailRecipient[];
    }
  });

  const createRecipient = useMutation({
    mutationFn: async (recipient: Omit<EmailRecipient, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('email_recipients_config')
        .insert(recipient)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-recipients-config'] });
      toast.success('Destinatario añadido');
    },
    onError: (error: any) => {
      if (error.code === '23505') {
        toast.error('Este email ya existe');
      } else {
        toast.error('Error al añadir destinatario');
      }
    }
  });

  const updateRecipient = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<EmailRecipient> & { id: string }) => {
      const { data, error } = await supabase
        .from('email_recipients_config')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-recipients-config'] });
      toast.success('Destinatario actualizado');
    },
    onError: () => {
      toast.error('Error al actualizar destinatario');
    }
  });

  const deleteRecipient = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('email_recipients_config')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-recipients-config'] });
      toast.success('Destinatario eliminado');
    },
    onError: () => {
      toast.error('Error al eliminar destinatario');
    }
  });

  const toggleDefaultCopy = useMutation({
    mutationFn: async ({ id, is_default_copy }: { id: string; is_default_copy: boolean }) => {
      const { error } = await supabase
        .from('email_recipients_config')
        .update({ is_default_copy })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-recipients-config'] });
    }
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('email_recipients_config')
        .update({ is_active })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-recipients-config'] });
    }
  });

  return {
    recipients,
    isLoading,
    createRecipient,
    updateRecipient,
    deleteRecipient,
    toggleDefaultCopy,
    toggleActive
  };
};

// Hook para obtener solo destinatarios activos y default (para usar en formularios)
export const useActiveEmailRecipients = () => {
  return useQuery({
    queryKey: ['email-recipients-active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_recipients_config')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data as EmailRecipient[];
    }
  });
};
