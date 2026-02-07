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
  empresaId?: string;
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

// Tables that support AI classification columns
const TABLES_WITH_AI_CLASSIFICATION = new Set([
  'contact_leads',
  'company_valuations', 
  'general_contact_leads',
  'acquisition_leads',
  'collaborator_applications',
  'advisor_valuations',
  'company_acquisition_inquiries',
]);

export const useSaveContactClassification = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveClassification = useCallback(async ({ 
    contactId, 
    origin, 
    data,
    empresaId,
  }: SaveClassificationParams): Promise<boolean> => {
    const table = TABLE_MAP[origin];
    
    if (!table) {
      const errorMsg = `Tipo de contacto no soportado: ${origin}`;
      toast.error(errorMsg);
      setError(errorMsg);
      return false;
    }

    // Check if table supports AI classification
    if (!TABLES_WITH_AI_CLASSIFICATION.has(table)) {
      const errorMsg = `Este tipo de lead (${origin}) no soporta clasificación AI`;
      toast.error(errorMsg);
      setError(errorMsg);
      return false;
    }

    // Validate contactId
    if (!contactId) {
      const errorMsg = 'ID de contacto no válido';
      toast.error(errorMsg);
      setError(errorMsg);
      return false;
    }

    setIsSaving(true);
    setError(null);

    try {
      // Build update object atomically
      const updateData: Record<string, any> = {};
      const now = new Date().toISOString();

      // Add description if provided
      if (data.description !== undefined) {
        // Validate description length
        if (data.description && data.description.length > 10000) {
          throw new Error('La descripción es demasiado larga (máximo 10.000 caracteres)');
        }
        updateData.ai_company_summary = data.description || null;
        updateData.ai_company_summary_at = now;
      }

      // Add sector tags if provided
      if (data.sectorTags !== undefined) {
        if (data.sectorTags) {
          // Validate tags arrays
          const validateArray = (arr: any[], name: string, maxLength: number) => {
            if (!Array.isArray(arr)) {
              throw new Error(`${name} debe ser un array`);
            }
            if (arr.length > maxLength) {
              throw new Error(`${name} tiene demasiados elementos (máximo ${maxLength})`);
            }
          };

          validateArray(data.sectorTags.tags || [], 'Tags', 50);
          validateArray(data.sectorTags.business_model_tags || [], 'Tags de modelo de negocio', 20);
          validateArray(data.sectorTags.negative_tags || [], 'Tags negativos', 20);

          updateData.ai_sector_pe = data.sectorTags.sector_pe || null;
          updateData.ai_sector_name = data.sectorTags.sector_name_es || null;
          updateData.ai_tags = data.sectorTags.tags || [];
          updateData.ai_business_model_tags = data.sectorTags.business_model_tags || [];
          updateData.ai_negative_tags = data.sectorTags.negative_tags || [];
          updateData.ai_classification_confidence = data.sectorTags.confidence || 0;
          updateData.ai_classification_at = now;
        } else {
          // Explicitly clearing tags
          updateData.ai_sector_pe = null;
          updateData.ai_sector_name = null;
          updateData.ai_tags = [];
          updateData.ai_business_model_tags = [];
          updateData.ai_negative_tags = [];
          updateData.ai_classification_confidence = null;
          updateData.ai_classification_at = null;
        }
      }

      // Nothing to save
      if (Object.keys(updateData).length === 0) {
        toast.info('No hay cambios que guardar');
        return false;
      }

      // Add updated_at timestamp
      updateData.updated_at = now;

      // Perform atomic update
      const { error: updateError, data: result } = await supabase
        .from(table as any)
        .update(updateData)
        .eq('id', contactId)
        .select('id')
        .single();

      if (updateError) {
        // Provide specific error messages
        if (updateError.code === 'PGRST116') {
          throw new Error('Contacto no encontrado o sin permisos');
        }
        if (updateError.code === '23505') {
          throw new Error('Error de duplicado en la base de datos');
        }
        if (updateError.code === '23503') {
          throw new Error('Error de referencia en la base de datos');
        }
        throw new Error(updateError.message || 'Error desconocido al guardar');
      }

      if (!result) {
        throw new Error('No se pudo confirmar el guardado');
      }

      // Double persist: also save to empresas if empresaId is provided
      if (empresaId) {
        try {
          const empresaUpdateData: Record<string, any> = { ...updateData };
          delete empresaUpdateData.updated_at; // empresas may use different timestamp field
          
          const { error: empresaError } = await supabase
            .from('empresas')
            .update(empresaUpdateData)
            .eq('id', empresaId);

          if (empresaError) {
            console.warn('[aiProfileSave] Warning: failed to save to empresas:', empresaError.message);
            // Don't block - lead save succeeded
          } else {
            console.log('[aiProfileSave] Successfully saved to empresas:', empresaId);
          }
        } catch (empresaErr) {
          console.warn('[aiProfileSave] Warning: empresas update failed:', empresaErr);
        }
      }

      // Success - don't show toast here, let the component handle it
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al guardar clasificación';
      setError(errorMessage);
      toast.error(`Error: ${errorMessage}`);
      console.error('Save classification error:', err);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    saveClassification,
    isSaving,
    error,
    clearError,
  };
};
