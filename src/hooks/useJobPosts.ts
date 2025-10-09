import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { JobPost, JobPostFormData } from '@/types/jobs';

export const useJobPosts = (filters?: { status?: string; category_id?: string }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: jobPosts, isLoading, error } = useQuery({
    queryKey: ['job-posts', filters],
    queryFn: async (): Promise<JobPost[]> => {
      let query = supabase
        .from('job_posts')
        .select(`
          *,
          category:job_categories(*)
        `)
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.category_id) {
        query = query.eq('category_id', filters.category_id);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    },
  });

  const createJobPost = useMutation({
    mutationFn: async (jobPost: JobPostFormData) => {
      // Generate slug from title
      const slug = jobPost.title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-');

      const { data, error } = await supabase
        .from('job_posts')
        .insert({
          ...jobPost,
          slug,
          status: 'draft',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-posts'] });
      toast({
        title: "Oferta creada",
        description: "La oferta de trabajo se ha creado correctamente",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error al crear oferta",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateJobPost = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<JobPost> }) => {
      const { data, error } = await supabase
        .from('job_posts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-posts'] });
      toast({
        title: "Oferta actualizada",
        description: "La oferta de trabajo se ha actualizado correctamente",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error al actualizar oferta",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const publishJobPost = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('job_posts')
        .update({
          status: 'published',
          published_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-posts'] });
      toast({
        title: "Oferta publicada",
        description: "La oferta de trabajo se ha publicado correctamente",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error al publicar oferta",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteJobPost = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('job_posts')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-posts'] });
      toast({
        title: "Oferta eliminada",
        description: "La oferta de trabajo se ha eliminado correctamente",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error al eliminar oferta",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    jobPosts,
    isLoading,
    error,
    createJobPost: createJobPost.mutate,
    updateJobPost: updateJobPost.mutate,
    publishJobPost: publishJobPost.mutate,
    deleteJobPost: deleteJobPost.mutate,
    isCreating: createJobPost.isPending,
    isUpdating: updateJobPost.isPending,
    isPublishing: publishJobPost.isPending,
    isDeleting: deleteJobPost.isPending,
  };
};

export const useJobPost = (slug: string) => {
  return useQuery({
    queryKey: ['job-post', slug],
    queryFn: async (): Promise<JobPost | null> => {
      const { data, error } = await supabase
        .from('job_posts')
        .select(`
          *,
          category:job_categories(*)
        `)
        .eq('slug', slug)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });
};
