import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, Trash2, CheckCircle2, Loader2 } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface DocumentStepProps {
  campaignId: string;
}

export const DocumentStep: React.FC<DocumentStepProps> = ({ campaignId }) => {
  const [isUploading, setIsUploading] = useState(false);
  const queryClient = useQueryClient();

  const { data: documents, isLoading } = useQuery({
    queryKey: ['campaign-document', campaignId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campaign_presentations')
        .select('*')
        .eq('campaign_id', campaignId)
        .is('company_id', null);
      if (error) throw error;
      return data || [];
    },
  });

  const uploadFile = useCallback(async (file: File) => {
    if (file.type !== 'application/pdf') {
      toast.error('Solo se aceptan archivos PDF');
      return;
    }

    setIsUploading(true);
    try {
      const storagePath = `${campaignId}/${file.name}`;

      // Upload via edge function (bypasses RLS)
      const arrayBuffer = await file.arrayBuffer();
      const base64 = btoa(
        new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
      );

      const { error: uploadError } = await supabase.functions.invoke('upload-campaign-presentation', {
        body: {
          action: 'upload_blob',
          path: storagePath,
          base64,
          contentType: 'application/pdf',
        },
      });

      if (uploadError) throw uploadError;

      // Upsert DB record (no company_id = generic document)
      const { error: dbError } = await (supabase as any)
        .from('campaign_presentations')
        .upsert({
          campaign_id: campaignId,
          company_id: null,
          file_name: file.name,
          storage_path: storagePath,
          status: 'assigned',
          assigned_manually: true,
          match_confidence: 1,
          updated_at: new Date().toISOString(),
        } as any, { onConflict: 'campaign_id,file_name' });

      if (dbError) throw dbError;

      toast.success(`"${file.name}" subido correctamente`);
      queryClient.invalidateQueries({ queryKey: ['campaign-document', campaignId] });
    } catch (err: any) {
      console.error('Upload error:', err);
      toast.error('Error al subir: ' + (err.message || 'Error desconocido'));
    } finally {
      setIsUploading(false);
    }
  }, [campaignId, queryClient]);

  const deleteFile = useCallback(async (id: string, storagePath: string) => {
    try {
      await supabase.functions.invoke('upload-campaign-presentation', {
        body: { action: 'delete', path: storagePath },
      });

      await supabase
        .from('campaign_presentations')
        .delete()
        .eq('id', id);

      toast.success('Documento eliminado');
      queryClient.invalidateQueries({ queryKey: ['campaign-document', campaignId] });
    } catch (err: any) {
      toast.error('Error al eliminar: ' + err.message);
    }
  }, [campaignId, queryClient]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (files) => files[0] && uploadFile(files[0]),
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
    disabled: isUploading,
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Documento PDF
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Sube el PDF que se adjuntará a todos los emails de esta campaña
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'
            } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
          >
            <input {...getInputProps()} />
            {isUploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Subiendo documento...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm font-medium">
                  {isDragActive ? 'Suelta el archivo aquí' : 'Arrastra un PDF o haz clic para seleccionar'}
                </p>
                <p className="text-xs text-muted-foreground">Solo archivos PDF</p>
              </div>
            )}
          </div>

          {/* Uploaded documents */}
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Cargando...</p>
          ) : documents && documents.length > 0 ? (
            <div className="space-y-2">
              {documents.map((doc: any) => (
                <div key={doc.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium">{doc.file_name}</p>
                      <p className="text-xs text-muted-foreground">
                        Subido {new Date(doc.created_at).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-green-700 border-green-300">Listo</Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteFile(doc.id, doc.storage_path)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-2">
              No hay documentos subidos aún
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
