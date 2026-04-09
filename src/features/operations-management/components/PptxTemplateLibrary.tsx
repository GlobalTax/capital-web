import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Upload, Download, Check, FileText, Trash2, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { FullSlideTemplate } from '../types/slideTemplate';
import { DEFAULT_TEMPLATE_SLIDE_MAP, DEFAULT_SKIP_SLIDES } from '../types/slideTemplate';
import { getRelativeTime } from '@/shared/utils/date';

interface PptxTemplateLibraryProps {
  template: FullSlideTemplate;
  onChange: (t: FullSlideTemplate) => void;
  onPersistTemplate?: (t: FullSlideTemplate) => Promise<boolean>;
}

interface TemplateDocument {
  id: string;
  title: string;
  file_name: string;
  storage_path: string;
  public_url: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const BUCKET = 'slide-backgrounds';
const FOLDER = 'templates';

const db = supabase as any;

const buildSelectedTemplate = (template: FullSlideTemplate, publicUrl?: string): FullSlideTemplate => {
  if (!publicUrl) {
    return {
      ...template,
      templatePptxUrl: undefined,
      templateSlideMap: undefined,
      skipSlides: undefined,
    };
  }

  return {
    ...template,
    templatePptxUrl: publicUrl,
    templateSlideMap: template.templateSlideMap || { ...DEFAULT_TEMPLATE_SLIDE_MAP },
    skipSlides: template.skipSlides || [...DEFAULT_SKIP_SLIDES],
  };
};

const extractStoragePathFromPublicUrl = (publicUrl?: string) => {
  if (!publicUrl) return null;

  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const index = publicUrl.indexOf(marker);
  if (index === -1) return null;

  return decodeURIComponent(publicUrl.slice(index + marker.length));
};

const formatFileLabel = (name: string) => name.replace(/^\d+_/, '').replace(/_/g, ' ').replace(/\.pptx$/i, '');

export const PptxTemplateLibrary: React.FC<PptxTemplateLibraryProps> = ({ template, onChange, onPersistTemplate }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [files, setFiles] = useState<TemplateDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const selectedUrl = template.templatePptxUrl;

  const loadFiles = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await db
        .from('rod_template_documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const documents = (data || []) as TemplateDocument[];
      const fallbackPath = extractStoragePathFromPublicUrl(selectedUrl);

      if (selectedUrl && fallbackPath && !documents.some((doc) => doc.public_url === selectedUrl || doc.storage_path === fallbackPath)) {
        const fallbackName = fallbackPath.split('/').pop() || 'plantilla.pptx';
        documents.unshift({
          id: `fallback-${fallbackPath}`,
          title: formatFileLabel(fallbackName),
          file_name: fallbackName,
          storage_path: fallbackPath,
          public_url: selectedUrl,
          is_active: true,
          created_at: '',
          updated_at: '',
        });
      }

      setFiles(documents);
    } catch (err: any) {
      console.error('Error loading templates:', err);
      toast({ title: 'Error al cargar plantillas', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [selectedUrl, toast]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  const persistTemplateSelection = useCallback(async (nextTemplate: FullSlideTemplate) => {
    onChange(nextTemplate);

    if (!onPersistTemplate) return true;

    const ok = await onPersistTemplate(nextTemplate);
    if (!ok) {
      throw new Error('No se pudo guardar la plantilla activa');
    }

    return true;
  }, [onChange, onPersistTemplate]);

  const markDocumentAsActive = useCallback(async (documentId: string) => {
    const { error: clearError } = await db
      .from('rod_template_documents')
      .update({ is_active: false })
      .eq('is_active', true);

    if (clearError) throw clearError;

    if (!documentId.startsWith('fallback-')) {
      const { error: activateError } = await db
        .from('rod_template_documents')
        .update({ is_active: true })
        .eq('id', documentId);

      if (activateError) throw activateError;
    }
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith('.pptx')) {
      toast({ title: 'Solo se permiten archivos .pptx', variant: 'destructive' });
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      toast({ title: 'Máximo 20MB', variant: 'destructive' });
      return;
    }

    setUploading(true);
    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const path = `${FOLDER}/${Date.now()}_${safeName}`;
      const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(path);

      await markDocumentAsActive('pending-upload');

      const { data: inserted, error: insertError } = await db
        .from('rod_template_documents')
        .insert({
          title: formatFileLabel(safeName),
          file_name: safeName,
          storage_path: path,
          public_url: publicUrl,
          is_active: true,
        })
        .select('*')
        .single();

      if (insertError) throw insertError;

      const nextTemplate = buildSelectedTemplate(template, publicUrl);
      await persistTemplateSelection(nextTemplate);
      setProcessingId((inserted as TemplateDocument).id);

      toast({ title: 'Plantilla subida y guardada' });
      await loadFiles();
    } catch (err: any) {
      toast({ title: 'Error al subir', description: err.message, variant: 'destructive' });
    } finally {
      setUploading(false);
      setProcessingId(null);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleSelect = async (file: TemplateDocument) => {
    setProcessingId(file.id);
    try {
      await markDocumentAsActive(file.id);
      await persistTemplateSelection(buildSelectedTemplate(template, file.public_url));
      toast({ title: 'Plantilla activa actualizada' });
      await loadFiles();
    } catch (err: any) {
      toast({ title: 'Error al seleccionar', description: err.message, variant: 'destructive' });
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeselect = async () => {
    setProcessingId('deselect');
    try {
      await markDocumentAsActive('');
      await persistTemplateSelection(buildSelectedTemplate(template, undefined));
      toast({ title: 'Plantilla deseleccionada' });
      await loadFiles();
    } catch (err: any) {
      toast({ title: 'Error al deseleccionar', description: err.message, variant: 'destructive' });
    } finally {
      setProcessingId(null);
    }
  };

  const handleDownload = async (file: TemplateDocument) => {
    try {
      const { data, error } = await supabase.storage.from(BUCKET).download(file.storage_path);
      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      toast({ title: 'Error al descargar', description: err.message, variant: 'destructive' });
    }
  };

  const handleDelete = async (file: TemplateDocument) => {
    setProcessingId(file.id);
    try {
      const { error: storageError } = await supabase.storage.from(BUCKET).remove([file.storage_path]);
      if (storageError) throw storageError;

      if (!file.id.startsWith('fallback-')) {
        const { error: deleteError } = await db
          .from('rod_template_documents')
          .delete()
          .eq('id', file.id);

        if (deleteError) throw deleteError;
      }

      if (selectedUrl === file.public_url) {
        await persistTemplateSelection(buildSelectedTemplate(template, undefined));
      }

      toast({ title: 'Plantilla eliminada' });
      await loadFiles();
    } catch (err: any) {
      toast({ title: 'Error al eliminar', description: err.message, variant: 'destructive' });
    } finally {
      setProcessingId(null);
    }
  };

  const formatSize = (fileName?: string) => {
    const found = files.find((file) => file.file_name === fileName);
    return found ? '' : '';
  };

  const isSelected = (file: TemplateDocument) => selectedUrl === file.public_url;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">Plantillas PPTX</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Sube y gestiona tus plantillas. La selección se guarda automáticamente.
          </p>
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="px-3 py-1.5 text-xs font-semibold rounded-[4px] bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-1.5"
        >
          {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
          {uploading ? 'Subiendo...' : 'Subir nueva'}
        </button>
        <input ref={inputRef} type="file" accept=".pptx" onChange={handleUpload} className="hidden" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
          <span className="text-xs">Cargando plantillas...</span>
        </div>
      ) : files.length === 0 ? (
        <div className="py-8 text-center border-2 border-dashed border-[hsl(var(--linear-border))] rounded-[5px]">
          <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No hay plantillas registradas</p>
          <p className="text-xs text-muted-foreground mt-1">Sube un archivo .pptx para comenzar</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {files.map(file => {
            const selected = isSelected(file);
            const busy = processingId === file.id;

            return (
              <div
                key={file.id}
                className={`flex items-center gap-3 p-3 rounded-[5px] border transition-colors ${
                  selected
                    ? 'border-primary bg-primary/5'
                    : 'border-[hsl(var(--linear-border))] bg-background hover:bg-secondary/30'
                }`}
              >
                <div className={`w-9 h-9 rounded-[4px] flex items-center justify-center shrink-0 ${
                  selected ? 'bg-primary/10' : 'bg-secondary/60'
                }`}>
                  {selected ? (
                    <Check className="w-4 h-4 text-primary" />
                  ) : (
                    <FileText className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {file.title || formatFileLabel(file.file_name)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {file.created_at ? getRelativeTime(file.created_at) : 'Plantilla existente'}
                    {file.is_active ? ' · activa' : ''}
                    {formatSize(file.file_name)}
                  </p>
                </div>

                <div className="flex gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleDownload(file)}
                    className="p-1.5 text-xs rounded-[4px] text-muted-foreground hover:bg-secondary transition-colors"
                    title="Descargar"
                    disabled={busy}
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  {!selected ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleSelect(file)}
                        disabled={busy}
                        className="px-2.5 py-1 text-xs font-medium rounded-[4px] border border-[hsl(var(--linear-border))] text-foreground hover:bg-secondary/80 transition-colors disabled:opacity-60"
                      >
                        {busy ? 'Guardando...' : 'Usar esta'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(file)}
                        disabled={busy}
                        className="p-1.5 text-xs rounded-[4px] text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-60"
                        title="Eliminar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={handleDeselect}
                      disabled={processingId === 'deselect' || busy}
                      className="px-2.5 py-1 text-xs font-medium rounded-[4px] border border-primary/30 text-primary hover:bg-primary/10 transition-colors disabled:opacity-60"
                    >
                      {processingId === 'deselect' ? 'Quitando...' : 'Deseleccionar'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};