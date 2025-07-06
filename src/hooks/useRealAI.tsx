import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface UseRealAIProps {
  onContentGenerated?: (content: string, type: 'title' | 'content' | 'seo') => void;
}

interface GenerateContentOptions {
  prompt: string;
  category?: string;
  length?: 'corto' | 'medio' | 'largo';
  tone?: 'profesional' | 'técnico' | 'divulgativo';
  type?: 'content' | 'title' | 'seo';
}

export const useRealAI = ({ onContentGenerated }: UseRealAIProps = {}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateWithAI = async (options: GenerateContentOptions) => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-blog-ai-content', {
        body: options
      });

      if (error) throw error;

      const { content, type } = data;
      onContentGenerated?.(content, type || 'content');
      
      toast({
        title: "Contenido generado",
        description: "Contenido creado exitosamente con IA",
      });

      return content;
    } catch (error) {
      console.error('Error generating content:', error);
      toast({
        title: "Error",
        description: "No se pudo generar el contenido",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  const generateTitle = async (category?: string, customPrompt?: string) => {
    const prompt = customPrompt || `Genera un título atractivo y profesional para un artículo sobre ${category || 'M&A'}. Debe ser específico, llamativo y optimizado para SEO.`;
    
    try {
      await generateWithAI({
        prompt,
        category,
        type: 'title',
        tone: 'profesional'
      });
    } catch (error) {
      // Error already handled in generateWithAI
    }
  };

  const generateContent = async (prompt: string, options?: {
    category?: string;
    length?: 'corto' | 'medio' | 'largo';
    tone?: 'profesional' | 'técnico' | 'divulgativo';
  }) => {
    try {
      await generateWithAI({
        prompt,
        category: options?.category,
        length: options?.length || 'medio',
        tone: options?.tone || 'profesional',
        type: 'content'
      });
    } catch (error) {
      // Error already handled in generateWithAI
    }
  };

  const optimizeForSEO = async (title: string, content: string) => {
    const prompt = `Basándote en este título: "${title}" y el siguiente contenido, genera metadatos SEO optimizados:

${content.substring(0, 500)}...

Necesito:
1. Meta título optimizado (máximo 60 caracteres)
2. Meta descripción atractiva (máximo 160 caracteres)
3. Keywords principales

Formato: 
Meta título: [título]
Meta descripción: [descripción]
Keywords: [keywords separadas por comas]`;

    try {
      await generateWithAI({
        prompt,
        type: 'seo',
        tone: 'profesional'
      });
    } catch (error) {
      // Error already handled in generateWithAI
    }
  };

  return {
    isGenerating,
    generateTitle,
    generateContent,
    optimizeForSEO,
    generateWithAI,
  };
};