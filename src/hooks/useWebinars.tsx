import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { QUERY_KEYS } from '@/shared/constants/query-keys';

export interface Webinar {
  id: string;
  title: string;
  description: string;
  short_description?: string;
  speaker_name: string;
  speaker_title: string;
  speaker_company?: string;
  speaker_avatar_url?: string;
  webinar_date: string;
  duration_minutes: number;
  status: 'scheduled' | 'completed' | 'cancelled';
  category: string;
  sector?: string;
  tags: string[];
  attendee_count: number;
  max_capacity?: number;
  registration_url?: string;
  recording_url?: string;
  materials_url?: string;
  key_takeaways?: string[];
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WebinarRegistration {
  id: string;
  webinar_id: string;
  full_name: string;
  email: string;
  phone?: string;
  company?: string;
  job_title?: string;
  sector?: string;
  years_experience?: string;
  specific_interests?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  referrer?: string;
  ip_address?: string;
  user_agent?: string;
  attended: boolean;
  attended_at?: string;
  email_sent: boolean;
  email_sent_at?: string;
  reminder_sent: boolean;
  reminder_sent_at?: string;
  created_at: string;
  updated_at: string;
}

export const useWebinars = (filters?: {
  category?: string;
  status?: string;
  featured?: boolean;
}) => {
  const { data: webinars, isLoading, error } = useQuery({
    queryKey: ['webinars', filters],
    queryFn: async () => {
      let query = supabase
        .from('webinars')
        .select('*')
        .eq('is_active', true)
        .order('webinar_date', { ascending: false });

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.featured !== undefined) {
        query = query.eq('is_featured', filters.featured);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Webinar[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2
  });

  return { webinars, isLoading, error };
};

export const useWebinar = (id: string) => {
  const { data: webinar, isLoading, error } = useQuery({
    queryKey: ['webinar', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('webinars')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      return data as Webinar;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 10, // 10 minutes
    retry: 2
  });

  return { webinar, isLoading, error };
};

export const useWebinarRegistration = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { mutate: registerForWebinar, isPending } = useMutation({
    mutationFn: async (registration: Omit<WebinarRegistration, 'id' | 'created_at' | 'updated_at' | 'attended' | 'attended_at' | 'email_sent' | 'email_sent_at' | 'reminder_sent' | 'reminder_sent_at'>) => {
      const { data, error } = await supabase
        .from('webinar_registrations')
        .insert(registration)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "¡Registro exitoso!",
        description: "Te has registrado correctamente. Recibirás un email de confirmación pronto.",
      });
      queryClient.invalidateQueries({ queryKey: ['webinar-registrations'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error en el registro",
        description: error.message || "Ha ocurrido un error. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  });

  return { registerForWebinar, isPending };
};

// Admin hooks
export const useWebinarsAdmin = () => {
  const { data: webinars, isLoading, error } = useQuery({
    queryKey: ['admin-webinars'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('webinars')
        .select('*')
        .order('webinar_date', { ascending: false });

      if (error) throw error;
      return data as Webinar[];
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    retry: 2
  });

  return { webinars, isLoading, error };
};

export const useWebinarRegistrations = (webinarId?: string) => {
  const { data: registrations, isLoading, error } = useQuery({
    queryKey: ['webinar-registrations', webinarId],
    queryFn: async () => {
      let query = supabase
        .from('webinar_registrations')
        .select('*')
        .order('created_at', { ascending: false });

      if (webinarId) {
        query = query.eq('webinar_id', webinarId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as WebinarRegistration[];
    },
    staleTime: 1000 * 60 * 1, // 1 minute
    retry: 2
  });

  return { registrations, isLoading, error };
};

export const useWebinarMutations = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { mutate: createWebinar, isPending: isCreating } = useMutation({
    mutationFn: async (webinar: Omit<Webinar, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('webinars')
        .insert(webinar)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Webinar creado",
        description: "El webinar se ha creado correctamente.",
      });
      queryClient.invalidateQueries({ queryKey: ['admin-webinars'] });
      queryClient.invalidateQueries({ queryKey: ['webinars'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error al crear webinar",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const { mutate: updateWebinar, isPending: isUpdating } = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Webinar> & { id: string }) => {
      const { data, error } = await supabase
        .from('webinars')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Webinar actualizado",
        description: "El webinar se ha actualizado correctamente.",
      });
      queryClient.invalidateQueries({ queryKey: ['admin-webinars'] });
      queryClient.invalidateQueries({ queryKey: ['webinars'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error al actualizar webinar",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const { mutate: deleteWebinar, isPending: isDeleting } = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('webinars')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Webinar eliminado",
        description: "El webinar se ha eliminado correctamente.",
      });
      queryClient.invalidateQueries({ queryKey: ['admin-webinars'] });
      queryClient.invalidateQueries({ queryKey: ['webinars'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error al eliminar webinar",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  return {
    createWebinar,
    updateWebinar,
    deleteWebinar,
    isCreating,
    isUpdating,
    isDeleting
  };
};