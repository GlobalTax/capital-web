import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  generateSlideOutline, 
  type SlideOutlineItem, 
  type SlideOutlineInputs 
} from '../utils/slideOutlineGenerator';
import type { PresentationType, Slide, SlideContent } from '../types/presentation.types';

interface GeneratedSlide {
  slide_index: number;
  slide_type: string;
  layout: string;
  headline: string;
  subline?: string;
  bullets?: string[];
  stats?: { label: string; value: string }[];
}

interface AIGenerationResult {
  success: boolean;
  slides: GeneratedSlide[];
  presentation_type: string;
  generated_at: string;
}

interface RefineResult {
  success: boolean;
  slides: GeneratedSlide[];
}

export function useAIContentGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateOutline = useCallback((
    presentationType: PresentationType,
    inputs: SlideOutlineInputs
  ): SlideOutlineItem[] => {
    return generateSlideOutline(presentationType, inputs);
  }, []);

  const generateContent = useCallback(async (
    presentationType: PresentationType,
    inputs: SlideOutlineInputs,
    outline?: SlideOutlineItem[]
  ): Promise<GeneratedSlide[] | null> => {
    setIsGenerating(true);
    setError(null);

    try {
      // Generate outline if not provided
      const slideOutline = outline || generateSlideOutline(presentationType, inputs);

      const { data, error: fnError } = await supabase.functions.invoke(
        'generate-presentation-content',
        {
          body: {
            inputs,
            outline: slideOutline,
            presentation_type: presentationType
          }
        }
      );

      if (fnError) {
        throw new Error(fnError.message);
      }

      const result = data as AIGenerationResult;

      if (!result.success) {
        throw new Error((data as { error?: string }).error || 'Generation failed');
      }

      toast.success('Contenido generado correctamente');
      return result.slides;

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error generating content';
      setError(message);
      
      if (message.includes('Rate limit')) {
        toast.error('Límite de solicitudes alcanzado. Intenta de nuevo en unos minutos.');
      } else if (message.includes('Payment required')) {
        toast.error('Créditos insuficientes. Añade fondos a tu workspace.');
      } else {
        toast.error('Error generando contenido: ' + message);
      }
      
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  /**
   * Refine existing slides with senior IB editor guidelines:
   * - Remove marketing language
   * - Increase clarity and precision
   * - Reduce text density
   * - Improve terminology consistency
   * - Maintain calm, confident tone
   */
  const refineContent = useCallback(async (
    slides: GeneratedSlide[]
  ): Promise<GeneratedSlide[] | null> => {
    setIsRefining(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke(
        'refine-presentation-content',
        {
          body: { slides }
        }
      );

      if (fnError) {
        throw new Error(fnError.message);
      }

      const result = data as RefineResult;

      if (!result.success) {
        throw new Error((data as { error?: string }).error || 'Refinement failed');
      }

      toast.success('Contenido refinado correctamente');
      return result.slides;

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error refining content';
      setError(message);
      
      if (message.includes('Rate limit')) {
        toast.error('Límite de solicitudes alcanzado. Intenta de nuevo en unos minutos.');
      } else {
        toast.error('Error refinando contenido: ' + message);
      }
      
      return null;
    } finally {
      setIsRefining(false);
    }
  }, []);

  // Convert generated slides to Slide format for saving
  const convertToSlides = useCallback((
    generatedSlides: GeneratedSlide[],
    projectId: string
  ): Partial<Slide>[] => {
    return generatedSlides.map((gs) => ({
      project_id: projectId,
      order_index: gs.slide_index,
      layout: gs.slide_type as Slide['layout'],
      headline: gs.headline,
      subline: gs.subline,
      content: {
        bullets: gs.bullets,
        stats: gs.stats
      } as SlideContent,
      is_hidden: false
    }));
  }, []);

  return {
    isGenerating,
    isRefining,
    error,
    generateOutline,
    generateContent,
    refineContent,
    convertToSlides,
    clearError: () => setError(null)
  };
}

export default useAIContentGeneration;
