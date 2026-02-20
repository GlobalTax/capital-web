import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  OperationDocument, 
  DocumentDownload,
  CreateDocumentInput,
  UpdateDocumentInput,
  DocumentCategory,
  DocumentStatus,
  createDocumentSchema 
} from '../types/documents';

const DOCUMENTS_QUERY_KEY = 'operation-documents';
const DOWNLOADS_QUERY_KEY = 'operation-document-downloads';

/**
 * Helper: triggers a browser download from a Blob
 */
function triggerDownload(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

/**
 * Hook para gestionar documentos de operaciones
 */
export const useOperationDocuments = (operationId: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch documents
  const { 
    data: documents, 
    isLoading,
    error 
  } = useQuery({
    queryKey: [DOCUMENTS_QUERY_KEY, operationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('operation_documents')
        .select('*')
        .eq('operation_id', operationId)
        .eq('is_deleted', false)
        .eq('is_latest_version', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as OperationDocument[];
    },
    enabled: !!operationId,
  });

  // Upload document mutation
  const uploadMutation = useMutation({
    mutationFn: async ({ 
      file, 
      metadata 
    }: { 
      file: File; 
      metadata: Omit<CreateDocumentInput, 'file_name' | 'file_path' | 'file_size' | 'file_type'> 
    }) => {
      // Validate file size
      if (file.size > 52428800) {
        throw new Error('El archivo no puede superar 50MB');
      }

      // Generate unique file path
      const timestamp = Date.now();
      const fileExt = file.name.split('.').pop();
      const filePath = `${operationId}/${timestamp}_${file.name}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('operation-documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Create document record
      const documentData: CreateDocumentInput = {
        ...metadata,
        file_name: file.name,
        file_path: uploadData.path,
        file_size: file.size,
        file_type: file.type,
      };

      // Validate with Zod
      const validated = createDocumentSchema.parse(documentData);

      const user = await supabase.auth.getUser();
      
      const { data: document, error: dbError } = await supabase
        .from('operation_documents')
        .insert([{
          operation_id: validated.operation_id,
          file_name: validated.file_name,
          file_path: validated.file_path,
          file_size: validated.file_size,
          file_type: validated.file_type,
          title: validated.title,
          description: validated.description,
          category: validated.category,
          status: validated.status,
          access_level: validated.access_level,
          version: validated.version,
          parent_document_id: validated.parent_document_id,
          tags: validated.tags,
          uploaded_by: user.data.user?.id,
        }])
        .select()
        .single();

      if (dbError) {
        // Cleanup storage if DB insert fails
        await supabase.storage
          .from('operation-documents')
          .remove([uploadData.path]);
        throw dbError;
      }

      return document as OperationDocument;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DOCUMENTS_QUERY_KEY, operationId] });
      toast({
        title: 'Documento subido',
        description: 'El documento se ha subido correctamente',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error al subir documento',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Download document mutation
  const downloadMutation = useMutation({
    mutationFn: async (documentId: string) => {
      console.group('[DOWNLOAD_DOCUMENT] Starting...');
      console.log('Document ID:', documentId);
      console.log('Documents in cache:', documents?.length);

      // Try cache first, then fetch fresh from DB
      let doc = documents?.find(d => d.id === documentId);

      if (!doc) {
        console.log('[DOWNLOAD_DOCUMENT] Not in cache, fetching from DB...');
        const { data, error: fetchError } = await supabase
          .from('operation_documents')
          .select('*')
          .eq('id', documentId)
          .single();

        if (fetchError) {
          console.error('[DOWNLOAD_DOCUMENT] DB fetch error:', fetchError);
          throw new Error(`Documento no encontrado: ${fetchError.message}`);
        }
        doc = data as OperationDocument;
      }

      console.log('[DOWNLOAD_DOCUMENT] Document:', doc.file_name);
      console.log('[DOWNLOAD_DOCUMENT] File path:', doc.file_path);
      console.log('[DOWNLOAD_DOCUMENT] File type:', doc.file_type);

      if (!doc.file_path) {
        throw new Error('El documento no tiene ruta de archivo (file_path vacío)');
      }

      // Try direct download first
      console.log('[DOWNLOAD_DOCUMENT] Attempting direct download...');
      const { data: fileBlob, error: downloadError } = await supabase.storage
        .from('operation-documents')
        .download(doc.file_path);

      if (downloadError) {
        console.warn('[DOWNLOAD_DOCUMENT] Direct download failed:', downloadError.message);
        // Fallback: signed URL
        console.log('[DOWNLOAD_DOCUMENT] Trying signed URL fallback...');
        const { data: signedData, error: signedError } = await supabase.storage
          .from('operation-documents')
          .createSignedUrl(doc.file_path, 120);

        if (signedError || !signedData) {
          console.error('[DOWNLOAD_DOCUMENT] Signed URL failed:', signedError);
          throw new Error(`Error de acceso al archivo: ${signedError?.message || 'Sin URL firmada'}`);
        }

        console.log('[DOWNLOAD_DOCUMENT] Signed URL obtained, fetching blob...');
        const response = await fetch(signedData.signedUrl);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const blob = await response.blob();
        triggerDownload(blob, doc.file_name);
      } else {
        console.log('[DOWNLOAD_DOCUMENT] Direct download succeeded');
        triggerDownload(fileBlob, doc.file_name);
      }

      // Log download in audit table
      const { data: userData } = await supabase.auth.getUser();
      await supabase.from('operation_document_downloads').insert({
        document_id: documentId,
        downloaded_by: userData.user?.id,
      });

      // Increment download_count
      await supabase
        .from('operation_documents')
        .update({ download_count: (doc.download_count || 0) + 1 })
        .eq('id', documentId);

      console.log('[DOWNLOAD_DOCUMENT] Complete');
      console.groupEnd();

      return { fileName: doc.file_name };
    },
    onSuccess: ({ fileName }) => {
      queryClient.invalidateQueries({ queryKey: [DOCUMENTS_QUERY_KEY, operationId] });
      toast({
        title: 'Descarga iniciada',
        description: `Descargando ${fileName}`,
      });
    },
    onError: (error: Error) => {
      console.error('[DOWNLOAD_DOCUMENT] Final error:', error);
      toast({
        title: 'Error al descargar documento',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Update document mutation
  const updateMutation = useMutation({
    mutationFn: async ({ 
      documentId, 
      updates 
    }: { 
      documentId: string; 
      updates: UpdateDocumentInput 
    }) => {
      const { data, error } = await supabase
        .from('operation_documents')
        .update(updates)
        .eq('id', documentId)
        .select()
        .single();

      if (error) throw error;
      return data as OperationDocument;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DOCUMENTS_QUERY_KEY, operationId] });
      toast({
        title: 'Documento actualizado',
        description: 'El documento se ha actualizado correctamente',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error al actualizar',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Soft delete document mutation
  const deleteMutation = useMutation({
    mutationFn: async (documentId: string) => {
      const { error } = await supabase
        .from('operation_documents')
        .update({ is_deleted: true })
        .eq('id', documentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DOCUMENTS_QUERY_KEY, operationId] });
      toast({
        title: 'Documento eliminado',
        description: 'El documento se ha eliminado correctamente',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error al eliminar',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Get preview URL for document
  const getPreviewUrl = async (documentId: string): Promise<string | null> => {
    let doc = documents?.find(d => d.id === documentId);

    if (!doc) {
      const { data } = await supabase
        .from('operation_documents')
        .select('file_path, file_name')
        .eq('id', documentId)
        .single();
      if (!data) return null;
      doc = data as OperationDocument;
    }

    const { data, error } = await supabase.storage
      .from('operation-documents')
      .createSignedUrl(doc.file_path, 300); // 5 minutes

    if (error) {
      console.error('[PREVIEW_URL] Error:', error);
      return null;
    }
    return data.signedUrl;
  };

  return {
    documents: documents || [],
    isLoading,
    error,
    uploadDocument: uploadMutation.mutate,
    downloadDocument: downloadMutation.mutate,
    updateDocument: updateMutation.mutate,
    deleteDocument: deleteMutation.mutate,
    isUploading: uploadMutation.isPending,
    isDownloading: downloadMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    getPreviewUrl,
  };
};

/**
 * Hook para obtener historial de descargas de un documento
 */
export const useDocumentDownloads = (documentId: string) => {
  const { data: downloads, isLoading } = useQuery({
    queryKey: [DOWNLOADS_QUERY_KEY, documentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('operation_document_downloads')
        .select('*')
        .eq('document_id', documentId)
        .order('downloaded_at', { ascending: false });

      if (error) throw error;
      return data as DocumentDownload[];
    },
    enabled: !!documentId,
  });

  return {
    downloads: downloads || [],
    isLoading,
  };
};
