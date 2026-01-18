import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface QuickCreateResult {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  meta_title: string;
  meta_description: string;
  reading_time: number;
}

interface UseQuickCreateBlogReturn {
  processContent: (rawContent: string) => Promise<QuickCreateResult | null>;
  createPost: (data: QuickCreateResult) => Promise<string | null>;
  isProcessing: boolean;
  isCreating: boolean;
  error: string | null;
}

export const useQuickCreateBlog = (): UseQuickCreateBlogReturn => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const processContent = async (rawContent: string): Promise<QuickCreateResult | null> => {
    setIsProcessing(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('process-blog-quick-create', {
        body: { raw_content: rawContent }
      });

      if (fnError) {
        // Handle specific error codes
        if (fnError.message?.includes('429')) {
          throw new Error('Límite de peticiones excedido. Inténtalo en unos minutos.');
        }
        if (fnError.message?.includes('402')) {
          throw new Error('Créditos de IA agotados. Contacta con el administrador.');
        }
        throw new Error(fnError.message || 'Error procesando contenido');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      return data as QuickCreateResult;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
      toast({
        title: "Error al procesar",
        description: message,
        variant: "destructive"
      });
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  const createPost = async (data: QuickCreateResult): Promise<string | null> => {
    setIsCreating(true);
    setError(null);

    try {
      // Check if slug already exists
      const { data: existing } = await supabase
        .from('blog_posts')
        .select('id')
        .eq('slug', data.slug)
        .maybeSingle();

      // If slug exists, append timestamp
      const finalSlug = existing 
        ? `${data.slug}-${Date.now().toString(36)}`
        : data.slug;

      const { data: newPost, error: insertError } = await supabase
        .from('blog_posts')
        .insert({
          title: data.title,
          slug: finalSlug,
          excerpt: data.excerpt,
          content: data.content,
          category: data.category,
          tags: data.tags,
          meta_title: data.meta_title,
          meta_description: data.meta_description,
          reading_time: data.reading_time,
          author_name: 'Equipo Capittal',
          is_published: false,
          is_featured: false
        })
        .select('id')
        .single();

      if (insertError) {
        throw new Error(insertError.message);
      }

      toast({
        title: "Post creado",
        description: "El borrador se ha creado correctamente."
      });

      return newPost.id;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al crear el post';
      setError(message);
      toast({
        title: "Error al crear",
        description: message,
        variant: "destructive"
      });
      return null;
    } finally {
      setIsCreating(false);
    }
  };

  return {
    processContent,
    createPost,
    isProcessing,
    isCreating,
    error
  };
};
