
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { BlogPost } from '@/types/blog';
import { useToast } from '@/hooks/use-toast';
import { QUERY_KEYS } from '@/shared/constants/query-keys';
import { useOptimizedQuery } from '@/shared/services/optimized-queries.service';

export const useBlogPosts = (publishedOnly: boolean = false) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query optimizada para obtener todos los posts
  const { data: posts = [], isLoading, error } = useOptimizedQuery<BlogPost[]>(
    [QUERY_KEYS.BLOG_POSTS, publishedOnly.toString()],
    async (): Promise<BlogPost[]> => {
      let query = supabase.from('blog_posts').select('*');
      
      if (publishedOnly) {
        query = query.eq('is_published', true);
      }
      
      const { data, error } = await query.order('published_at', { ascending: false, nullsFirst: false });

      if (error) throw error;
      
      return (data as unknown as BlogPost[]) || [];
    },
    'important',
    {
      onError: (error: Error) => {
        toast({
          title: "Error",
          description: "Error al cargar los posts del blog.",
          variant: "destructive",
        });
      }
    }
  );

  const getPostBySlug = async (slug: string): Promise<BlogPost | null> => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .single();

      if (error) throw error;
      return data as unknown as BlogPost;
    } catch (error) {
      console.error('Error fetching blog post:', error);
      return null;
    }
  };

  const createPost = async (postData: Partial<BlogPost>) => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .insert([postData as any])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Post creado correctamente.",
      });

      return data as unknown as BlogPost;
    } catch (error) {
      console.error('Error creating blog post:', error);
      toast({
        title: "Error",
        description: "Error al crear el post.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updatePost = async (id: string, postData: Partial<BlogPost>) => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .update(postData as any)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Post actualizado correctamente.",
      });

      return data as unknown as BlogPost;
    } catch (error) {
      console.error('Error updating blog post:', error);
      toast({
        title: "Error",
        description: "Error al actualizar el post.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deletePost = async (id: string) => {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Post eliminado correctamente.",
      });

      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BLOG_POSTS] });
    } catch (error) {
      console.error('Error deleting blog post:', error);
      toast({
        title: "Error",
        description: "Error al eliminar el post.",
        variant: "destructive",
      });
    }
  };

  return {
    posts,
    isLoading,
    error,
    getPostBySlug,
    createPost,
    updatePost,
    deletePost,
    fetchPosts: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BLOG_POSTS] }),
    refetch: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BLOG_POSTS] })
  };
};
