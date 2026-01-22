import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type TeaserLanguage = 'es' | 'en';

interface UploadTeaserParams {
  mandateId: string;
  language: TeaserLanguage;
  file: File;
}

interface TeaserData {
  url: string | null;
  filename: string | null;
  uploadedAt: string | null;
}

export interface MandateTeasers {
  es: TeaserData;
  en: TeaserData;
}

// Error messages mapping
const ERROR_MESSAGES: Record<string, string> = {
  '42501': 'No tienes permisos para subir documentos',
  '23505': 'Ya existe un documento con ese nombre',
  'storage/payload-too-large': 'El archivo es demasiado grande (máx. 50MB)',
  'storage/object-not-found': 'Error al acceder al almacenamiento',
  'default': 'Error al subir el teaser',
};

const getErrorMessage = (error: unknown): string => {
  if (error && typeof error === 'object') {
    const err = error as { code?: string; message?: string; statusCode?: string };
    if (err.code && ERROR_MESSAGES[err.code]) {
      return ERROR_MESSAGES[err.code];
    }
    if (err.message?.includes('Payload too large')) {
      return ERROR_MESSAGES['storage/payload-too-large'];
    }
    if (err.message?.includes('permission') || err.message?.includes('denied')) {
      return ERROR_MESSAGES['42501'];
    }
  }
  return ERROR_MESSAGES['default'];
};

export const useMandateTeasers = (mandateId: string) => {
  const queryClient = useQueryClient();

  const uploadTeaser = useMutation({
    mutationFn: async ({ mandateId, language, file }: UploadTeaserParams) => {
      // 1. Validate file format
      if (file.type !== 'application/pdf') {
        throw new Error('Solo se permiten archivos PDF');
      }

      // 2. Validate file size (max 50MB)
      const MAX_SIZE = 50 * 1024 * 1024;
      if (file.size > MAX_SIZE) {
        throw new Error('El archivo no puede superar 50MB');
      }

      // 3. Generate storage path (ROD pattern with upsert)
      const filePath = `mandates/${mandateId}/teasers/${language}.pdf`;

      console.log(`📤 Uploading teaser ${language.toUpperCase()} to: ${filePath}`);

      // 4. Upload to storage with upsert (replaces existing)
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file, {
          contentType: 'application/pdf',
          upsert: true, // Replace if exists
          cacheControl: '3600',
        });

      if (uploadError) {
        console.error('❌ Storage upload error:', uploadError);
        throw uploadError;
      }

      // 5. Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      console.log(`✅ Uploaded successfully. URL: ${publicUrl}`);

      // 6. Update mandate record with teaser info
      const updateData = language === 'es' 
        ? {
            teaser_es_url: publicUrl,
            teaser_es_filename: file.name,
            teaser_es_uploaded_at: new Date().toISOString(),
          }
        : {
            teaser_en_url: publicUrl,
            teaser_en_filename: file.name,
            teaser_en_uploaded_at: new Date().toISOString(),
          };

      const { data, error: dbError } = await supabase
        .from('buy_side_mandates')
        .update(updateData)
        .eq('id', mandateId)
        .select()
        .single();

      if (dbError) {
        console.error('❌ Database update error:', dbError);
        // Cleanup: remove uploaded file if DB update fails
        await supabase.storage
          .from('documents')
          .remove([filePath]);
        throw dbError;
      }

      console.log(`✅ Database updated for teaser ${language.toUpperCase()}`);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['buy-side-mandates'] });
      queryClient.invalidateQueries({ queryKey: ['mandate-teasers', mandateId] });
      toast.success(`Teaser ${variables.language.toUpperCase()} subido correctamente`);
    },
    onError: (error: Error) => {
      console.error('Upload teaser error:', error);
      toast.error(getErrorMessage(error));
    },
  });

  const deleteTeaser = useMutation({
    mutationFn: async ({ language }: { language: TeaserLanguage }) => {
      const filePath = `mandates/${mandateId}/teasers/${language}.pdf`;

      // 1. Remove from storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([filePath]);

      if (storageError) {
        console.warn('Storage delete warning:', storageError);
        // Continue even if file doesn't exist in storage
      }

      // 2. Clear database fields
      const updateData = language === 'es'
        ? {
            teaser_es_url: null,
            teaser_es_filename: null,
            teaser_es_uploaded_at: null,
          }
        : {
            teaser_en_url: null,
            teaser_en_filename: null,
            teaser_en_uploaded_at: null,
          };

      const { error: dbError } = await supabase
        .from('buy_side_mandates')
        .update(updateData)
        .eq('id', mandateId);

      if (dbError) throw dbError;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['buy-side-mandates'] });
      queryClient.invalidateQueries({ queryKey: ['mandate-teasers', mandateId] });
      toast.success(`Teaser ${variables.language.toUpperCase()} eliminado`);
    },
    onError: (error: Error) => {
      console.error('Delete teaser error:', error);
      toast.error('Error al eliminar el teaser');
    },
  });

  return {
    uploadTeaser,
    deleteTeaser,
    isUploading: uploadTeaser.isPending,
    isDeleting: deleteTeaser.isPending,
  };
};
