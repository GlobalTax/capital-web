import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Slide } from '../types/presentation.types';

export type TranslationLanguage = 'es' | 'en' | 'ca' | 'fr' | 'de' | 'pt' | 'it';

export const TRANSLATION_LANGUAGES: Record<TranslationLanguage, string> = {
  es: 'Castellano',
  en: 'English',
  ca: 'Català',
  fr: 'Français',
  de: 'Deutsch',
  pt: 'Português',
  it: 'Italiano',
};

interface TranslateParams {
  projectId: string;
  slides: Slide[];
  targetLanguage: TranslationLanguage;
}

interface TranslatedSlide {
  slide_index: number;
  slide_type: string;
  layout: string;
  headline: string;
  subline?: string;
  bullets?: string[];
  stats?: Array<{ label: string; value: string }>;
}

interface TranslationResponse {
  success: boolean;
  slides?: TranslatedSlide[];
  error?: string;
  target_language: string;
  target_language_name: string;
}

export function usePresentationTranslation() {
  const queryClient = useQueryClient();

  const translateMutation = useMutation({
    mutationFn: async ({ projectId, slides, targetLanguage }: TranslateParams) => {
      // Prepare slides data for translation (matching edge function expected format)
      const slidesForTranslation = slides.map((slide, index) => ({
        slide_index: index,
        slide_type: slide.layout || 'content',
        layout: slide.layout || 'bullets',
        headline: slide.headline || '',
        subline: slide.subline || undefined,
        bullets: slide.content?.bullets || undefined,
        stats: slide.content?.stats || undefined,
      }));

      const { data, error } = await supabase.functions.invoke<TranslationResponse>(
        'translate-presentation-content',
        {
          body: { slides: slidesForTranslation, language: targetLanguage },
        }
      );

      if (error) throw error;
      if (!data?.success || !data?.slides) {
        throw new Error(data?.error || 'No translation returned');
      }

      // Update each slide with translated content
      for (let i = 0; i < slides.length; i++) {
        const translated = data.slides[i];
        const original = slides[i];

        if (!translated) continue;

        // Reconstruct content object with translated values
        const updatedContent = {
          ...original.content,
          ...(translated.bullets && { bullets: translated.bullets }),
          ...(translated.stats && { stats: translated.stats }),
        };

        const { error: updateError } = await supabase
          .from('presentation_slides')
          .update({
            headline: translated.headline || original.headline,
            subline: translated.subline ?? original.subline,
            content: updatedContent,
          })
          .eq('id', original.id);

        if (updateError) {
          console.error(`Failed to update slide ${original.id}:`, updateError);
          throw updateError;
        }
      }

      return { 
        projectId, 
        translatedCount: data.slides.length,
        languageName: data.target_language_name 
      };
    },
    onSuccess: ({ projectId, translatedCount, languageName }) => {
      queryClient.invalidateQueries({ queryKey: ['presentation', projectId] });
      toast.success(`${translatedCount} diapositivas traducidas a ${languageName}`);
    },
    onError: (error: Error) => {
      console.error('Translation error:', error);
      toast.error(`Error de traducción: ${error.message}`);
    },
  });

  return {
    translate: translateMutation.mutate,
    translateAsync: translateMutation.mutateAsync,
    isTranslating: translateMutation.isPending,
  };
}
