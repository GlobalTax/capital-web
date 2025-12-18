import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { NewsletterType } from '@/components/admin/newsletter/NewsletterTypeSelector';

interface Operation {
  id: string;
  company_name: string;
  sector: string;
  geographic_location: string | null;
  revenue_amount: number | null;
  ebitda_amount: number | null;
  short_description: string | null;
}

interface Article {
  id: string;
  title: string;
  excerpt: string | null;
  category: string;
}

interface GenerationContext {
  newsletterType: NewsletterType;
  operations?: Operation[];
  articles?: Article[];
  existingSubject?: string;
  existingIntro?: string;
}

export const useNewsletterAI = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingField, setGeneratingField] = useState<string | null>(null);
  const { toast } = useToast();

  const generateContent = useCallback(async (
    type: 'subject' | 'intro' | 'text-block' | 'improve',
    context: GenerationContext,
    existingText?: string
  ): Promise<string | null> => {
    setIsGenerating(true);
    setGeneratingField(type);

    try {
      const { data, error } = await supabase.functions.invoke('ai-content-studio', {
        body: {
          type: 'newsletter',
          template: `newsletter-${type}`,
          prompt: buildPrompt(type, context, existingText),
          context: {
            newsletterType: context.newsletterType,
            operationsSummary: context.operations?.map(op => ({
              name: op.company_name,
              sector: op.sector,
              location: op.geographic_location
            })),
            articlesSummary: context.articles?.map(art => ({
              title: art.title,
              category: art.category
            })),
          },
          options: {
            temperature: 0.7,
            maxTokens: type === 'text-block' ? 500 : 200
          }
        }
      });

      if (error) throw error;

      toast({
        title: "✨ Contenido generado",
        description: "El texto ha sido generado con IA",
      });

      return data.content;
    } catch (error) {
      console.error('Error generating newsletter content:', error);
      toast({
        title: "Error al generar",
        description: "No se pudo generar el contenido. Inténtalo de nuevo.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsGenerating(false);
      setGeneratingField(null);
    }
  }, [toast]);

  const generateSubject = useCallback(async (context: GenerationContext) => {
    return generateContent('subject', context);
  }, [generateContent]);

  const generateIntro = useCallback(async (context: GenerationContext) => {
    return generateContent('intro', context);
  }, [generateContent]);

  const generateTextBlock = useCallback(async (context: GenerationContext, topic?: string) => {
    return generateContent('text-block', context, topic);
  }, [generateContent]);

  const improveText = useCallback(async (text: string, context: GenerationContext) => {
    return generateContent('improve', context, text);
  }, [generateContent]);

  return {
    isGenerating,
    generatingField,
    generateSubject,
    generateIntro,
    generateTextBlock,
    improveText,
  };
};

function buildPrompt(
  type: 'subject' | 'intro' | 'text-block' | 'improve',
  context: GenerationContext,
  existingText?: string
): string {
  const typeLabels = {
    opportunities: 'oportunidades de inversión/compra de empresas',
    news: 'noticias y artículos de M&A',
    updates: 'novedades de la empresa Capittal',
    educational: 'contenido educativo sobre M&A y valoración de empresas'
  };

  const newsletterDesc = typeLabels[context.newsletterType];

  switch (type) {
    case 'subject':
      if (context.newsletterType === 'opportunities' && context.operations?.length) {
        const sectors = [...new Set(context.operations.map(op => op.sector))];
        return `Genera un asunto de email atractivo (máx 50 caracteres) para un newsletter de ${newsletterDesc}. Sectores incluidos: ${sectors.join(', ')}. ${context.operations.length} oportunidades disponibles.`;
      }
      if (context.newsletterType === 'news' && context.articles?.length) {
        const titles = context.articles.map(a => a.title).join(', ');
        return `Genera un asunto de email atractivo (máx 50 caracteres) para un newsletter de ${newsletterDesc}. Artículos: ${titles}`;
      }
      return `Genera un asunto de email atractivo (máx 50 caracteres) para un newsletter de ${newsletterDesc}.`;

    case 'intro':
      if (context.newsletterType === 'opportunities' && context.operations?.length) {
        const sectors = [...new Set(context.operations.map(op => op.sector))];
        return `Genera un texto introductorio breve (2-3 frases, máx 200 caracteres) para un newsletter de ${newsletterDesc}. Menciona que hay ${context.operations.length} nuevas oportunidades en sectores como ${sectors.slice(0, 3).join(', ')}.`;
      }
      if (context.newsletterType === 'news' && context.articles?.length) {
        return `Genera un texto introductorio breve (2-3 frases, máx 200 caracteres) para un newsletter de ${newsletterDesc}. Tenemos ${context.articles.length} artículos destacados.`;
      }
      return `Genera un texto introductorio breve (2-3 frases, máx 200 caracteres) para un newsletter de ${newsletterDesc}.`;

    case 'text-block':
      return `Genera un párrafo de contenido (150-250 palabras) para un newsletter de ${newsletterDesc}. ${existingText ? `Tema específico: ${existingText}` : 'Tema: información relevante para empresarios interesados en M&A.'}`;

    case 'improve':
      return `Mejora y reescribe el siguiente texto para hacerlo más profesional, atractivo y conciso. Mantén el mismo significado pero mejora el estilo. Contexto: newsletter de ${newsletterDesc}.\n\nTexto original:\n${existingText}`;

    default:
      return '';
  }
}
