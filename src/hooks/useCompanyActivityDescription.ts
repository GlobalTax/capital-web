import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UseCompanyActivityDescriptionReturn {
  description: string;
  isGenerating: boolean;
  error: string | null;
  generateDescription: (companyName: string, cif?: string) => Promise<string | null>;
  clearDescription: () => void;
  copyToClipboard: () => void;
}

export const useCompanyActivityDescription = (): UseCompanyActivityDescriptionReturn => {
  const [description, setDescription] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const generateDescription = useCallback(async (companyName: string, cif?: string): Promise<string | null> => {
    if (!companyName.trim()) {
      setError('Se requiere el nombre de la empresa');
      toast({
        title: 'Error',
        description: 'Se requiere el nombre de la empresa',
        variant: 'destructive',
      });
      return null;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('generate-company-activity-description', {
        body: { 
          company_name: companyName.trim(),
          cif: cif?.trim() || undefined
        }
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      if (!data?.description) {
        throw new Error('No se recibió descripción del servidor');
      }

      setDescription(data.description);
      toast({
        title: 'Descripción generada',
        description: 'La descripción de actividad está lista para usar',
      });

      return data.description;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      toast({
        title: 'Error al generar descripción',
        description: errorMessage,
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [toast]);

  const clearDescription = useCallback(() => {
    setDescription('');
    setError(null);
  }, []);

  const copyToClipboard = useCallback(() => {
    if (description) {
      navigator.clipboard.writeText(description);
      toast({
        title: 'Copiado',
        description: 'Descripción copiada al portapapeles',
      });
    }
  }, [description, toast]);

  return {
    description,
    isGenerating,
    error,
    generateDescription,
    clearDescription,
    copyToClipboard,
  };
};
