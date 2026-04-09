import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CollaboratorTestimonial {
  id: string;
  name: string;
  position: string;
  company: string;
  sector: string;
  rating: number;
  testimonial_text: string;
  joined_year: string;
  avatar_initials: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

const QUERY_KEY = 'collaborator-testimonials';

export const useCollaboratorTestimonials = (activeOnly = true) => {
  return useQuery({
    queryKey: [QUERY_KEY, activeOnly],
    queryFn: async () => {
      let query = supabase
        .from('collaborator_testimonials')
        .select('*')
        .order('display_order', { ascending: true });

      if (activeOnly) {
        query = query.eq('is_active', true);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as CollaboratorTestimonial[];
    },
    staleTime: 1000 * 60 * 10,
  });
};

export const useCollaboratorTestimonialsMutations = () => {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
  };

  const upsert = useMutation({
    mutationFn: async (testimonial: Partial<CollaboratorTestimonial> & { id?: string }) => {
      const { id, created_at, updated_at, ...data } = testimonial as any;
      if (id) {
        const { error } = await supabase
          .from('collaborator_testimonials')
          .update({ ...data, updated_at: new Date().toISOString() })
          .eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('collaborator_testimonials')
          .insert(data);
        if (error) throw error;
      }
    },
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('collaborator_testimonials')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('collaborator_testimonials')
        .update({ is_active, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  return { upsert, remove, toggleActive };
};
