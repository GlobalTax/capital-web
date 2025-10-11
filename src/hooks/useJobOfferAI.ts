import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface GenerationContext {
  title?: string;
  level?: string;
  sector?: string;
  keywords?: string;
}

interface GenerationResult {
  content?: string;
  items?: string[];
  title?: string;
  short_description?: string;
  description?: string;
  requirements?: string[];
  responsibilities?: string[];
  benefits?: string[];
}

export const useJobOfferAI = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateField = async (
    field: 'title' | 'short_description' | 'description',
    context: GenerationContext
  ): Promise<string> => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-job-offer-ai', {
        body: { type: field, context }
      });

      if (error) throw error;

      toast({
        title: '¡Contenido generado!',
        description: 'El contenido se ha generado correctamente con IA',
      });

      return data.content || '';
    } catch (error) {
      console.error('Error generating field:', error);
      toast({
        title: 'Error',
        description: 'No se pudo generar el contenido con IA',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  const generateList = async (
    type: 'requirements' | 'responsibilities' | 'benefits',
    context: GenerationContext
  ): Promise<string[]> => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-job-offer-ai', {
        body: { type, context }
      });

      if (error) throw error;

      toast({
        title: '¡Lista generada!',
        description: `Se han generado ${data.items?.length || 0} elementos`,
      });

      return data.items || [];
    } catch (error) {
      console.error('Error generating list:', error);
      toast({
        title: 'Error',
        description: 'No se pudo generar la lista con IA',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  const generateFullOffer = async (context: GenerationContext): Promise<GenerationResult> => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-job-offer-ai', {
        body: { type: 'full', context }
      });

      if (error) throw error;

      toast({
        title: '¡Oferta completa generada!',
        description: 'La oferta se ha generado correctamente con IA',
      });

      return data;
    } catch (error) {
      console.error('Error generating full offer:', error);
      toast({
        title: 'Error',
        description: 'No se pudo generar la oferta completa con IA',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateField,
    generateList,
    generateFullOffer,
    isGenerating,
  };
};
