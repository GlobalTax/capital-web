
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { BlogPost } from '@/types/blog';
import { useToast } from '@/hooks/use-toast';
import { QUERY_KEYS } from '@/shared/constants/query-keys';

export const useBlogPosts = (publishedOnly: boolean = false) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query estándar para obtener todos los posts
  const { data: posts = [], isLoading, error } = useQuery<BlogPost[]>({
    queryKey: [QUERY_KEYS.BLOG_POSTS, publishedOnly.toString()],
    queryFn: async (): Promise<BlogPost[]> => {
      let query = supabase.from('blog_posts').select(`
        id,
        title,
        slug,
        excerpt,
        content,
        featured_image_url,
        author_name,
        author_avatar_url,
        category,
        tags,
        reading_time,
        is_published,
        is_featured,
        meta_title,
        meta_description,
        published_at,
        created_at,
        updated_at
      `);
      
      if (publishedOnly) {
        query = query.eq('is_published', true);
      }
      
      const { data, error } = await query.order('published_at', { ascending: false, nullsFirst: false });

      if (error) {
        console.error('Error fetching blog posts:', error);
        throw error;
      }
      
      return data || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
    retry: 2
  });

  // Handle errors with useEffect instead of onError
  React.useEffect(() => {
    if (error) {
      console.error('Blog posts query error:', error);
      toast({
        title: "Error",
        description: "Error al cargar los posts del blog.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const getPostBySlug = async (slug: string): Promise<BlogPost | null> => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select(`
          id,
          title,
          slug,
          excerpt,
          content,
          featured_image_url,
          author_name,
          author_avatar_url,
          category,
          tags,
          reading_time,
          is_published,
          is_featured,
          meta_title,
          meta_description,
          published_at,
          created_at,
          updated_at
        `)
        .eq('slug', slug)
        .eq('is_published', true)
        .maybeSingle();

      if (error) {
        console.error('Error fetching blog post by slug:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error in getPostBySlug:', error);
      return null;
    }
  };

  const createPost = async (postData: Partial<BlogPost>) => {
    try {
      // Validar datos requeridos
      if (!postData.title || !postData.content || !postData.category || !postData.slug) {
        throw new Error('Faltan campos requeridos: título, contenido, categoría y slug');
      }

      const { data, error } = await supabase
        .from('blog_posts')
        .insert([{
          title: postData.title,
          slug: postData.slug,
          content: postData.content,
          category: postData.category,
          excerpt: postData.excerpt || '',
          author_name: postData.author_name || 'Equipo Capittal',
          author_avatar_url: postData.author_avatar_url || '',
          featured_image_url: postData.featured_image_url || '',
          tags: postData.tags || [],
          reading_time: postData.reading_time || 5,
          is_published: postData.is_published || false,
          is_featured: postData.is_featured || false,
          meta_title: postData.meta_title || '',
          meta_description: postData.meta_description || '',
          published_at: postData.is_published ? new Date().toISOString() : null
        }])
        .select()
        .single();

      if (error) {
        console.error('Supabase error creating post:', error);
        throw error;
      }

      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BLOG_POSTS] });

      toast({
        title: "Éxito",
        description: "Post creado correctamente.",
      });

      return data;
    } catch (error) {
      console.error('Error creating blog post:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al crear el post.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updatePost = async (id: string, postData: Partial<BlogPost>) => {
    try {
      const updateData: any = {};
      
      // Solo actualizar campos que están presentes
      if (postData.title !== undefined) updateData.title = postData.title;
      if (postData.slug !== undefined) updateData.slug = postData.slug;
      if (postData.content !== undefined) updateData.content = postData.content;
      if (postData.category !== undefined) updateData.category = postData.category;
      if (postData.excerpt !== undefined) updateData.excerpt = postData.excerpt;
      if (postData.author_name !== undefined) updateData.author_name = postData.author_name;
      if (postData.author_avatar_url !== undefined) updateData.author_avatar_url = postData.author_avatar_url;
      if (postData.featured_image_url !== undefined) updateData.featured_image_url = postData.featured_image_url;
      if (postData.tags !== undefined) updateData.tags = postData.tags;
      if (postData.reading_time !== undefined) updateData.reading_time = postData.reading_time;
      if (postData.is_published !== undefined) {
        updateData.is_published = postData.is_published;
        updateData.published_at = postData.is_published ? new Date().toISOString() : null;
      }
      if (postData.is_featured !== undefined) updateData.is_featured = postData.is_featured;
      if (postData.meta_title !== undefined) updateData.meta_title = postData.meta_title;
      if (postData.meta_description !== undefined) updateData.meta_description = postData.meta_description;

      const { data, error } = await supabase
        .from('blog_posts')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Supabase error updating post:', error);
        throw error;
      }

      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.BLOG_POSTS] });

      toast({
        title: "Éxito",
        description: "Post actualizado correctamente.",
      });

      return data;
    } catch (error) {
      console.error('Error updating blog post:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al actualizar el post.",
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
    posts: posts as BlogPost[],
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
