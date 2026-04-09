/**
 * BuyPipelineAttachments - Manage files attached to buy pipeline emails
 */

import React, { useCallback, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Paperclip, Upload, Trash2, FileText, FileSpreadsheet, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useDropzone } from 'react-dropzone';
import { cn } from '@/lib/utils';

interface Attachment {
  id: string;
  label: string;
  file_name: string;
  file_type: string;
  file_size_bytes: number;
  storage_path: string;
  is_active: boolean;
  created_at: string;
}

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getFileIcon = (fileType: string) => {
  if (fileType.includes('pdf')) return <FileText className="h-4 w-4 text-red-500" />;
  if (fileType.includes('sheet') || fileType.includes('excel') || fileType.includes('xlsx'))
    return <FileSpreadsheet className="h-4 w-4 text-green-600" />;
  return <FileText className="h-4 w-4 text-muted-foreground" />;
};

export const BuyPipelineAttachments: React.FC = () => {
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);

  const { data: attachments = [], isLoading } = useQuery({
    queryKey: ['buy-pipeline-attachments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('buy_pipeline_attachments')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Attachment[];
    },
  });

  const activeCount = attachments.filter(a => a.is_active).length;

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('buy_pipeline_attachments')
        .update({ is_active })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['buy-pipeline-attachments'] }),
    onError: (e: any) => toast.error('Error al actualizar', { description: e.message }),
  });

  const deleteAttachment = useMutation({
    mutationFn: async (att: Attachment) => {
      await supabase.storage.from('buy-pipeline-attachments').remove([att.storage_path]);
      const { error } = await supabase.from('buy_pipeline_attachments').delete().eq('id', att.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buy-pipeline-attachments'] });
      toast.success('Archivo eliminado');
    },
    onError: (e: any) => toast.error('Error al eliminar', { description: e.message }),
  });

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    setIsUploading(true);
    try {
      for (const file of acceptedFiles) {
        const ext = file.name.split('.').pop();
        const storagePath = `${crypto.randomUUID()}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from('buy-pipeline-attachments')
          .upload(storagePath, file);
        if (uploadError) throw uploadError;

        const label = file.name.replace(/\.[^/.]+$/, '');
        const { error: dbError } = await supabase
          .from('buy_pipeline_attachments')
          .insert({
            label,
            file_name: file.name,
            file_type: file.type,
            file_size_bytes: file.size,
            storage_path: storagePath,
            is_active: true,
          });
        if (dbError) throw dbError;
      }
      queryClient.invalidateQueries({ queryKey: ['buy-pipeline-attachments'] });
      toast.success(`${acceptedFiles.length} archivo(s) subido(s)`);
    } catch (e: any) {
      toast.error('Error al subir archivo', { description: e.message });
    } finally {
      setIsUploading(false);
    }
  }, [queryClient]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
    },
    disabled: isUploading,
  });

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className={cn("h-9 gap-1.5", activeCount > 0 && "border-primary text-primary")}>
          <Paperclip className="h-4 w-4" />
          Adjuntos
          {activeCount > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">{activeCount}</Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-3 border-b">
          <p className="text-sm font-medium">Documentos adjuntos al email</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Los archivos activos se adjuntan automáticamente
          </p>
        </div>

        {/* Upload zone */}
        <div className="p-2 border-b">
          <div
            {...getRootProps()}
            className={cn(
              "border-2 border-dashed rounded-md p-3 text-center cursor-pointer transition-colors",
              isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/20 hover:border-primary/50",
              isUploading && "opacity-50 cursor-not-allowed"
            )}
          >
            <input {...getInputProps()} />
            {isUploading ? (
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Subiendo...
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Upload className="h-4 w-4" />
                Arrastra PDF o Excel aquí
              </div>
            )}
          </div>
        </div>

        {/* File list */}
        <div className="max-h-60 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-xs text-muted-foreground">Cargando...</div>
          ) : attachments.length === 0 ? (
            <div className="p-4 text-center text-xs text-muted-foreground">
              No hay archivos adjuntos
            </div>
          ) : (
            attachments.map(att => (
              <div key={att.id} className="flex items-center gap-2 px-3 py-2 hover:bg-muted/50 group">
                {getFileIcon(att.file_type)}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{att.file_name}</p>
                  <p className="text-[10px] text-muted-foreground">{formatFileSize(att.file_size_bytes)}</p>
                </div>
                <Switch
                  checked={att.is_active}
                  onCheckedChange={(checked) => toggleActive.mutate({ id: att.id, is_active: checked })}
                  className="scale-75"
                />
                <button
                  onClick={() => {
                    if (confirm(`¿Eliminar "${att.file_name}"?`)) {
                      deleteAttachment.mutate(att);
                    }
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/10 transition-opacity"
                >
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </button>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
