// ============= NEWS ARTICLES HOOK =============
// React Query hook para gestión de noticias M&A con soft delete y bulk actions

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  category: string | null;
  tags: string[] | null;
  featured_image_url: string | null;
  source_name: string | null;
  source_url: string | null;
  author_name: string | null;
  is_published: boolean | null;
  is_featured: boolean | null;
  is_processed: boolean | null;
  is_deleted: boolean | null;
  deleted_at: string | null;
  deleted_by: string | null;
  auto_published: boolean | null;
  published_at: string | null;
  fetched_at: string | null;
  processed_at: string | null;
  created_at: string;
  updated_at: string;
  meta_title: string | null;
  meta_description: string | null;
}

export interface NewsFilters {
  status: 'all' | 'pending' | 'published' | 'deleted';
  category?: string;
  search?: string;
}

export const useNewsArticles = (filters?: NewsFilters) => {
  const queryClient = useQueryClient();

  // Fetch news articles
  const { data: articles, isLoading, error, refetch } = useQuery({
    queryKey: ['news-articles', filters],
    queryFn: async () => {
      let query = supabase
        .from('news_articles')
        .select('*')
        .order('created_at', { ascending: false });

      // Filter by deleted status
      if (filters?.status === 'deleted') {
        query = query.eq('is_deleted', true);
      } else {
        // Por defecto, excluir eliminados
        query = query.eq('is_deleted', false);
        
        // Apply publication filters
        if (filters?.status === 'pending') {
          query = query.eq('is_published', false);
        } else if (filters?.status === 'published') {
          query = query.eq('is_published', true);
        }
      }

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,excerpt.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as NewsArticle[];
    },
  });

  // Stats query (excluye eliminados)
  const { data: stats } = useQuery({
    queryKey: ['news-articles-stats'],
    queryFn: async () => {
      const { data: all, error: allError } = await supabase
        .from('news_articles')
        .select('id, is_published, is_processed, is_deleted, created_at', { count: 'exact' });

      if (allError) throw allError;

      const active = all?.filter(a => !a.is_deleted) || [];
      const deleted = all?.filter(a => a.is_deleted).length || 0;
      const today = new Date().toISOString().split('T')[0];
      const pending = active.filter(a => !a.is_published).length || 0;
      const published = active.filter(a => a.is_published).length || 0;
      const processed = active.filter(a => a.is_processed).length || 0;
      const todayCount = active.filter(a => a.created_at?.startsWith(today)).length || 0;

      return { 
        total: active.length, 
        pending, 
        published, 
        processed, 
        todayCount,
        deleted 
      };
    },
  });

  // Publish mutation
  const publishMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('news_articles')
        .update({ 
          is_published: true, 
          published_at: new Date().toISOString() 
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news-articles'] });
      queryClient.invalidateQueries({ queryKey: ['news-articles-stats'] });
      toast.success('Noticia publicada');
    },
    onError: (error) => {
      toast.error('Error al publicar: ' + error.message);
    },
  });

  // Unpublish mutation
  const unpublishMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('news_articles')
        .update({ is_published: false })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news-articles'] });
      queryClient.invalidateQueries({ queryKey: ['news-articles-stats'] });
      toast.success('Noticia despublicada');
    },
    onError: (error) => {
      toast.error('Error al despublicar: ' + error.message);
    },
  });

  // Toggle featured mutation
  const toggleFeaturedMutation = useMutation({
    mutationFn: async ({ id, featured }: { id: string; featured: boolean }) => {
      const { error } = await supabase
        .from('news_articles')
        .update({ is_featured: featured })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news-articles'] });
      toast.success('Estado destacado actualizado');
    },
    onError: (error) => {
      toast.error('Error: ' + error.message);
    },
  });

  // Soft delete mutation (en lugar de hard delete)
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('news_articles')
        .update({ 
          is_deleted: true,
          deleted_at: new Date().toISOString(),
          deleted_by: user?.id || null
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news-articles'] });
      queryClient.invalidateQueries({ queryKey: ['news-articles-stats'] });
      toast.success('Noticia archivada');
    },
    onError: (error) => {
      toast.error('Error al archivar: ' + error.message);
    },
  });

  // Restore mutation (recuperar de soft delete)
  const restoreMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('news_articles')
        .update({ 
          is_deleted: false,
          deleted_at: null,
          deleted_by: null
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news-articles'] });
      queryClient.invalidateQueries({ queryKey: ['news-articles-stats'] });
      toast.success('Noticia restaurada');
    },
    onError: (error) => {
      toast.error('Error al restaurar: ' + error.message);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<NewsArticle> }) => {
      const { error } = await supabase
        .from('news_articles')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news-articles'] });
      toast.success('Noticia actualizada');
    },
    onError: (error) => {
      toast.error('Error al actualizar: ' + error.message);
    },
  });

  // ============= BULK MUTATIONS =============

  // Bulk publish
  const bulkPublishMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase
        .from('news_articles')
        .update({ 
          is_published: true, 
          published_at: new Date().toISOString() 
        })
        .in('id', ids);
      if (error) throw error;
      return { count: ids.length };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['news-articles'] });
      queryClient.invalidateQueries({ queryKey: ['news-articles-stats'] });
      toast.success(`${data.count} noticias publicadas`);
    },
    onError: (error) => {
      toast.error('Error al publicar: ' + error.message);
    },
  });

  // Bulk unpublish
  const bulkUnpublishMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase
        .from('news_articles')
        .update({ is_published: false })
        .in('id', ids);
      if (error) throw error;
      return { count: ids.length };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['news-articles'] });
      queryClient.invalidateQueries({ queryKey: ['news-articles-stats'] });
      toast.success(`${data.count} noticias despublicadas`);
    },
    onError: (error) => {
      toast.error('Error al despublicar: ' + error.message);
    },
  });

  // Bulk soft delete
  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('news_articles')
        .update({ 
          is_deleted: true,
          deleted_at: new Date().toISOString(),
          deleted_by: user?.id || null
        })
        .in('id', ids);
      if (error) throw error;
      return { count: ids.length };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['news-articles'] });
      queryClient.invalidateQueries({ queryKey: ['news-articles-stats'] });
      toast.success(`${data.count} noticias archivadas`);
    },
    onError: (error) => {
      toast.error('Error al archivar: ' + error.message);
    },
  });

  // Bulk restore
  const bulkRestoreMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase
        .from('news_articles')
        .update({ 
          is_deleted: false,
          deleted_at: null,
          deleted_by: null
        })
        .in('id', ids);
      if (error) throw error;
      return { count: ids.length };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['news-articles'] });
      queryClient.invalidateQueries({ queryKey: ['news-articles-stats'] });
      toast.success(`${data.count} noticias restauradas`);
    },
    onError: (error) => {
      toast.error('Error al restaurar: ' + error.message);
    },
  });

  return {
    articles,
    stats,
    isLoading,
    error,
    refetch,
    // Single mutations
    publish: publishMutation.mutate,
    unpublish: unpublishMutation.mutate,
    toggleFeatured: toggleFeaturedMutation.mutate,
    deleteArticle: deleteMutation.mutate,
    restoreArticle: restoreMutation.mutate,
    updateArticle: updateMutation.mutate,
    // Bulk mutations
    bulkPublish: bulkPublishMutation.mutate,
    bulkUnpublish: bulkUnpublishMutation.mutate,
    bulkDelete: bulkDeleteMutation.mutate,
    bulkRestore: bulkRestoreMutation.mutate,
    // Loading states
    isPublishing: publishMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isBulkProcessing: bulkPublishMutation.isPending || bulkUnpublishMutation.isPending || bulkDeleteMutation.isPending || bulkRestoreMutation.isPending,
  };
};
