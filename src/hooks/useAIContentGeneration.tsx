
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface GenerationOptions {
  type: 'title' | 'content' | 'excerpt' | 'seo' | 'tags';
  prompt: string;
  context?: {
    title?: string;
    category?: string;
  };
}

interface GenerationResult {
  content: string;
  type: string;
}

export const useAIContentGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateContent = async (options: GenerationOptions): Promise<string> => {
    setIsGenerating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-blog-content', {
        body: options,
      });

      if (error) {
        throw error;
      }

      const result = data as GenerationResult;
      
      toast({
        title: "¡Contenido generado!",
        description: "El contenido ha sido generado exitosamente con IA.",
      });

      return result.content;
    } catch (error) {
      console.error('Error generating content:', error);
      toast({
        title: "Error",
        description: "Error al generar contenido con IA. Inténtalo de nuevo.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  const generateTitle = async (topic: string, category?: string) => {
    return generateContent({
      type: 'title',
      prompt: topic,
      context: { category }
    });
  };

  const generateFullContent = async (title: string, category?: string) => {
    return generateContent({
      type: 'content',
      prompt: title,
      context: { title, category }
    });
  };

  const generateExcerpt = async (title: string, contentSummary: string) => {
    return generateContent({
      type: 'excerpt',
      prompt: contentSummary,
      context: { title }
    });
  };

  const generateSEO = async (title: string) => {
    return generateContent({
      type: 'seo',
      prompt: '',
      context: { title }
    });
  };

  const generateTags = async (title: string, content: string) => {
    return generateContent({
      type: 'tags',
      prompt: content.substring(0, 500), // Enviar solo los primeros 500 caracteres
      context: { title }
    });
  };

  return {
    isGenerating,
    generateTitle,
    generateFullContent,
    generateExcerpt,
    generateSEO,
    generateTags,
  };
};
