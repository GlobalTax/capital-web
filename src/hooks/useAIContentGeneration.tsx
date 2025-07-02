
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/utils/logger';
import { NetworkError, ValidationError, RateLimitError } from '@/types/errorTypes';

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

      logger.debug('AI content generation successful', { type: options.type }, { 
        context: 'ai', 
        component: 'useAIContentGeneration' 
      });
      return result.content;
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error) {
        const errorCode = (error as any).code;
        if (errorCode === 'FUNCTION_RATE_LIMIT_EXCEEDED') {
          const rateLimitError = new RateLimitError('AI service rate limit exceeded');
          logger.warn('AI service rate limited', rateLimitError, { 
            context: 'ai', 
            component: 'useAIContentGeneration' 
          });
          toast({
            title: "Límite alcanzado",
            description: "Has alcanzado el límite de generación de contenido. Inténtalo en unos minutos.",
            variant: "destructive",
          });
          throw rateLimitError;
        } else if (errorCode === 'FUNCTION_NETWORK_ERROR') {
          const networkError = new NetworkError('AI service network error');
          logger.error('AI service network error', networkError, { 
            context: 'ai', 
            component: 'useAIContentGeneration' 
          });
          toast({
            title: "Error de conexión",
            description: "Error de conexión con el servicio de IA. Inténtalo de nuevo.",
            variant: "destructive",
          });
          throw networkError;
        }
      }
      
      const unknownError = error instanceof Error ? error : new Error('Unknown AI generation error');
      logger.error('AI content generation failed', unknownError, { 
        context: 'ai', 
        component: 'useAIContentGeneration',
        data: { type: options.type, promptLength: options.prompt.length }
      });
      toast({
        title: "Error",
        description: "Error al generar contenido con IA. Inténtalo de nuevo.",
        variant: "destructive",
      });
      throw unknownError;
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
    generateContent, // Exposer generateContent para uso en otros hooks
  };
};
