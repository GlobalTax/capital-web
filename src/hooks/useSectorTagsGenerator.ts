import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface SectorTagsResult {
  sector_pe: string;
  sector_name_es: string;
  sector_name_en: string;
  confidence: number;
  tags: string[];
  negative_tags: string[];
  business_model_tags: string[];
  reasoning: string;
}

export interface UseSectorTagsGeneratorReturn {
  result: SectorTagsResult | null;
  isGenerating: boolean;
  error: string | null;
  generateTags: (description: string, companyName?: string) => Promise<SectorTagsResult | null>;
  copyTags: () => void;
  copyAllTags: () => void;
  clearResult: () => void;
}

export const useSectorTagsGenerator = (): UseSectorTagsGeneratorReturn => {
  const [result, setResult] = useState<SectorTagsResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateTags = useCallback(async (
    description: string,
    companyName?: string
  ): Promise<SectorTagsResult | null> => {
    if (!description || description.trim().length < 20) {
      toast.error('Se requiere una descripción de al menos 20 caracteres');
      return null;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('generate-sector-tags', {
        body: { 
          description: description.trim(),
          company_name: companyName?.trim()
        }
      });

      if (fnError) {
        throw new Error(fnError.message || 'Error al generar etiquetas');
      }

      if (data.error) {
        throw new Error(data.error);
      }

      const tagResult: SectorTagsResult = {
        sector_pe: data.sector_pe || 'other',
        sector_name_es: data.sector_name_es || 'Otros',
        sector_name_en: data.sector_name_en || 'Other',
        confidence: data.confidence || 0,
        tags: data.tags || [],
        negative_tags: data.negative_tags || [],
        business_model_tags: data.business_model_tags || [],
        reasoning: data.reasoning || '',
      };

      setResult(tagResult);
      toast.success(`Sector: ${tagResult.sector_name_es} (${tagResult.confidence}% confianza)`);
      return tagResult;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const copyTags = useCallback(() => {
    if (!result?.tags?.length) {
      toast.error('No hay etiquetas para copiar');
      return;
    }

    const tagsText = result.tags.map(t => `#${t}`).join(' ');
    navigator.clipboard.writeText(tagsText);
    toast.success('Etiquetas copiadas al portapapeles');
  }, [result]);

  const copyAllTags = useCallback(() => {
    if (!result) {
      toast.error('No hay resultado para copiar');
      return;
    }

    const lines = [
      `Sector: ${result.sector_name_es} (${result.confidence}%)`,
      '',
      'Tags:',
      result.tags.map(t => `#${t}`).join(' '),
    ];

    if (result.business_model_tags.length > 0) {
      lines.push('', 'Modelo de negocio:', result.business_model_tags.map(t => `#${t}`).join(' '));
    }

    if (result.negative_tags.length > 0) {
      lines.push('', 'Excluir:', result.negative_tags.map(t => `#${t}`).join(' '));
    }

    if (result.reasoning) {
      lines.push('', 'Notas:', result.reasoning);
    }

    navigator.clipboard.writeText(lines.join('\n'));
    toast.success('Resultado completo copiado');
  }, [result]);

  const clearResult = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return {
    result,
    isGenerating,
    error,
    generateTags,
    copyTags,
    copyAllTags,
    clearResult,
  };
};
