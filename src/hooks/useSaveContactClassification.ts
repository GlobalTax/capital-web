import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ContactOrigin } from './useUnifiedContacts';
import { SectorTagsResult } from './useSectorTagsGenerator';

export interface ClassificationData {
  description?: string;
  sectorTags?: SectorTagsResult | null;
}

interface SaveClassificationParams {
  contactId: string;
  origin: ContactOrigin;
  data: ClassificationData;
}

// Map origin to database table
const TABLE_MAP: Record<ContactOrigin, string> = {
  contact: 'contact_leads',
  valuation: 'company_valuations',
  general: 'general_contact_leads',
  collaborator: 'collaborator_applications',
  acquisition: 'acquisition_leads',
  advisor: 'advisor_valuations',
  company_acquisition: 'company_acquisition_inquiries',
};

export const useSaveContactClassification = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveClassification = useCallback(async ({ 
    contactId, 
    origin, 
    data 
  }: SaveClassificationParams): Promise<boolean> => {
    const table = TABLE_MAP[origin];
    
    if (!table) {
      toast.error('Tipo de contacto no soportado');
      return false;
    }

    setIsSaving(true);
    setError(null);

    try {
      // Build update object
      const updateData: Record<string, any> = {};
      const now = new Date().toISOString();

      // Add description if provided
      if (data.description !== undefined) {
        updateData.ai_company_summary = data.description;
        updateData.ai_company_summary_at = now;
      }

      // Add sector tags if provided
      if (data.sectorTags) {
        updateData.ai_sector_pe = data.sectorTags.sector_pe;
        updateData.ai_sector_name = data.sectorTags.sector_name_es;
        updateData.ai_tags = data.sectorTags.tags || [];
        updateData.ai_business_model_tags = data.sectorTags.business_model_tags || [];
        updateData.ai_negative_tags = data.sectorTags.negative_tags || [];
        updateData.ai_classification_confidence = data.sectorTags.confidence;
        updateData.ai_classification_at = now;
      }

      // Nothing to save
      if (Object.keys(updateData).length === 0) {
        toast.info('No hay cambios que guardar');
        return false;
      }

      // Perform update
      const { error: updateError } = await supabase
        .from(table as any)
        .update(updateData)
        .eq('id', contactId);

      if (updateError) {
        throw updateError;
      }

      toast.success('Guardado');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al guardar';
      setError(errorMessage);
      toast.error('No se pudo guardar');
      console.error('Save classification error:', err);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, []);

  return {
    saveClassification,
    isSaving,
    error,
  };
};
