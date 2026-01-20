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

interface SlideIssue {
  slide_index: number;
  issue_type: 'constraint_violation' | 'risky_claim' | 'terminology' | 'text_density' | 'invented_data';
  severity: 'low' | 'medium' | 'high';
  description: string;
  field: string;
  current_value?: string;
}

interface ValidationReport {
  overall_quality_score: number;
  issues_per_slide: Record<number, SlideIssue[]>;
  suggested_fixes: Array<{
    slide_index: number;
    field: string;
    original: string;
    suggested: string;
  }>;
  risk_flags: Array<{
    slide_index: number;
    risk_type: string;
    description: string;
    recommendation: string;
  }>;
  summary: {
    total_issues: number;
    high_severity: number;
    medium_severity: number;
    low_severity: number;
  };
}

interface ValidateResult {
  success: boolean;
  report: ValidationReport;
}

interface TranslateResult {
  success: boolean;
  slides: GeneratedSlide[];
  target_language: string;
  target_language_name: string;
}

export type SupportedLanguage = 'es' | 'en' | 'ca' | 'fr' | 'de' | 'pt' | 'it';

export const SUPPORTED_LANGUAGES: Record<SupportedLanguage, string> = {
  es: 'Español',
  en: 'English',
  ca: 'Català',
  fr: 'Français',
  de: 'Deutsch',
  pt: 'Português',
  it: 'Italiano'
};

export type { GeneratedSlide, ValidationReport, SlideIssue };

export function useAIContentGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
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

  /**
   * Validate slides for M&A compliance:
   * - Copy constraints (word limits, bullet counts)
   * - Risky claims (forward-looking statements, guarantees)
   * - Terminology consistency
   * - Text density issues
   * - Invented/implied data not in inputs
   */
  const validateContent = useCallback(async (
    slides: GeneratedSlide[],
    inputs?: SlideOutlineInputs
  ): Promise<ValidationReport | null> => {
    setIsValidating(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke(
        'validate-presentation-content',
        {
          body: { slides, inputs }
        }
      );

      if (fnError) {
        throw new Error(fnError.message);
      }

      const result = data as ValidateResult;

      if (!result.success) {
        throw new Error((data as { error?: string }).error || 'Validation failed');
      }

      const report = result.report;
      const score = report.overall_quality_score;

      if (score >= 8) {
        toast.success(`Validación completada: ${score}/10 - Excelente calidad`);
      } else if (score >= 6) {
        toast.warning(`Validación completada: ${score}/10 - Requiere revisión`);
      } else {
        toast.error(`Validación completada: ${score}/10 - Necesita correcciones`);
      }

      return report;

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error validating content';
      setError(message);
      
      if (message.includes('Rate limit')) {
        toast.error('Límite de solicitudes alcanzado. Intenta de nuevo en unos minutos.');
      } else {
        toast.error('Error validando contenido: ' + message);
      }
      
      return null;
    } finally {
      setIsValidating(false);
    }
  }, []);

  /**
   * Translate slides to a target language
   * Preserves meaning, numbers, and professional tone
   */
  const translateContent = useCallback(async (
    slides: GeneratedSlide[],
    language: SupportedLanguage
  ): Promise<GeneratedSlide[] | null> => {
    setIsTranslating(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke(
        'translate-presentation-content',
        {
          body: { slides, language }
        }
      );

      if (fnError) {
        throw new Error(fnError.message);
      }

      const result = data as TranslateResult;

      if (!result.success) {
        throw new Error((data as { error?: string }).error || 'Translation failed');
      }

      toast.success(`Traducido a ${result.target_language_name}`);
      return result.slides;

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error translating content';
      setError(message);
      
      if (message.includes('Rate limit')) {
        toast.error('Límite de solicitudes alcanzado. Intenta de nuevo en unos minutos.');
      } else if (message.includes('Unsupported language')) {
        toast.error('Idioma no soportado');
      } else {
        toast.error('Error traduciendo contenido: ' + message);
      }
      
      return null;
    } finally {
      setIsTranslating(false);
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
    isValidating,
    isTranslating,
    error,
    generateOutline,
    generateContent,
    refineContent,
    validateContent,
    translateContent,
    convertToSlides,
    clearError: () => setError(null)
  };
}

export default useAIContentGeneration;
