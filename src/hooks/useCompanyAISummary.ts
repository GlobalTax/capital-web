import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ContactData {
  company_name: string;
  website?: string;
  email: string;
  phone?: string;
  cif?: string;
  country?: string;
}

interface UseCompanyAISummaryProps {
  leadId: string;
  origin: 'contact' | 'valuation' | 'general' | string;
  contactData: ContactData;
  existingSummary?: string | null;
  existingSummaryAt?: string | null;
}

export const useCompanyAISummary = ({
  leadId,
  origin,
  contactData,
  existingSummary,
  existingSummaryAt,
}: UseCompanyAISummaryProps) => {
  const [summary, setSummary] = useState<string | null>(existingSummary || null);
  const [generatedAt, setGeneratedAt] = useState<string | null>(existingSummaryAt || null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedSummary, setEditedSummary] = useState<string>('');
  const { toast } = useToast();

  // Map origin to table name
  const getTableName = useCallback((): string | null => {
    switch (origin) {
      case 'contact':
        return 'contact_leads';
      case 'valuation':
        return 'company_valuations';
      case 'general':
        return 'general_contact_leads';
      default:
        return null;
    }
  }, [origin]);

  const generateSummary = useCallback(async () => {
    if (!contactData.company_name && !contactData.email) {
      toast({
        title: 'Datos insuficientes',
        description: 'Se requiere al menos el nombre de empresa o email',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke('generate-company-summary', {
        body: {
          company_name: contactData.company_name,
          website: contactData.website,
          email: contactData.email,
          phone: contactData.phone,
          cif: contactData.cif,
          country: contactData.country || 'España',
        },
      });

      if (error) throw error;

      if (data?.summary) {
        // Save to database
        const tableName = getTableName();
        if (tableName) {
          const { error: updateError } = await supabase
            .from(tableName as any)
            .update({
              ai_company_summary: data.summary,
              ai_company_summary_at: data.generated_at,
            })
            .eq('id', leadId);

          if (updateError) {
            console.error('Error saving summary:', updateError);
            toast({
              title: 'Resumen generado',
              description: 'Pero no se pudo guardar en la base de datos',
              variant: 'destructive',
            });
          } else {
            toast({
              title: '✅ Resumen generado',
              description: 'El resumen se ha guardado correctamente',
            });
          }
        }

        setSummary(data.summary);
        setGeneratedAt(data.generated_at);
      }
    } catch (error) {
      console.error('Error generating summary:', error);
      toast({
        title: 'Error al generar resumen',
        description: error instanceof Error ? error.message : 'Error desconocido',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  }, [contactData, leadId, getTableName, toast]);

  const saveSummary = useCallback(async (newSummary: string) => {
    const tableName = getTableName();
    if (!tableName) {
      toast({
        title: 'Error',
        description: 'Este tipo de contacto no soporta resúmenes',
        variant: 'destructive',
      });
      return;
    }

    try {
      const now = new Date().toISOString();
      const { error } = await supabase
        .from(tableName as any)
        .update({
          ai_company_summary: newSummary,
          ai_company_summary_at: now,
        })
        .eq('id', leadId);

      if (error) throw error;

      setSummary(newSummary);
      setGeneratedAt(now);
      setIsEditing(false);
      toast({
        title: '✅ Resumen guardado',
        description: 'Los cambios se han guardado correctamente',
      });
    } catch (error) {
      console.error('Error saving summary:', error);
      toast({
        title: 'Error al guardar',
        description: error instanceof Error ? error.message : 'Error desconocido',
        variant: 'destructive',
      });
    }
  }, [leadId, getTableName, toast]);

  const startEditing = useCallback(() => {
    setEditedSummary(summary || '');
    setIsEditing(true);
  }, [summary]);

  const cancelEditing = useCallback(() => {
    setIsEditing(false);
    setEditedSummary('');
  }, []);

  const copyToClipboard = useCallback(async () => {
    if (!summary) return;
    
    try {
      await navigator.clipboard.writeText(summary);
      toast({
        title: '📋 Copiado',
        description: 'Resumen copiado al portapapeles',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo copiar al portapapeles',
        variant: 'destructive',
      });
    }
  }, [summary, toast]);

  return {
    summary,
    generatedAt,
    isGenerating,
    isEditing,
    editedSummary,
    setEditedSummary,
    generateSummary,
    saveSummary,
    startEditing,
    cancelEditing,
    copyToClipboard,
  };
};
