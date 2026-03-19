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
}

interface StorageFile {
  name: string;
  created_at: string;
  metadata: { size?: number } | null;
  publicUrl: string;
}

const BUCKET = 'slide-backgrounds';
const FOLDER = 'templates';

export const PptxTemplateLibrary: React.FC<PptxTemplateLibraryProps> = ({ template, onChange }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const selectedUrl = template.templatePptxUrl;

  const loadFiles = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.storage.from(BUCKET).list(FOLDER, {
        sortBy: { column: 'created_at', order: 'desc' },
      });
      if (error) throw error;

      const pptxFiles: StorageFile[] = (data || [])
        .filter(f => f.name.endsWith('.pptx'))
        .map(f => {
          const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(`${FOLDER}/${f.name}`);
          return {
            name: f.name,
            created_at: f.created_at || '',
            metadata: f.metadata as any,
            publicUrl,
          };
        });

      setFiles(pptxFiles);
    } catch (err: any) {
      console.error('Error loading templates:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadFiles(); }, [loadFiles]);

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
      // Keep original name but make unique
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const path = `${FOLDER}/${Date.now()}_${safeName}`;
      const { error } = await supabase.storage.from(BUCKET).upload(path, file);
      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(path);

      // Auto-select the newly uploaded file
      onChange({
        ...template,
        templatePptxUrl: publicUrl,
        templateSlideMap: template.templateSlideMap || { ...DEFAULT_TEMPLATE_SLIDE_MAP },
        skipSlides: template.skipSlides || [...DEFAULT_SKIP_SLIDES],
      });

      toast({ title: 'Plantilla subida correctamente' });
      await loadFiles();
    } catch (err: any) {
      toast({ title: 'Error al subir', description: err.message, variant: 'destructive' });
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleSelect = (file: StorageFile) => {
    onChange({
      ...template,
      templatePptxUrl: file.publicUrl,
      templateSlideMap: template.templateSlideMap || { ...DEFAULT_TEMPLATE_SLIDE_MAP },
      skipSlides: template.skipSlides || [...DEFAULT_SKIP_SLIDES],
    });
  };

  const handleDeselect = () => {
    onChange({ ...template, templatePptxUrl: undefined, templateSlideMap: undefined, skipSlides: undefined });
  };

  const handleDownload = async (file: StorageFile) => {
    try {
      const filePath = `${FOLDER}/${file.name}`;
      const { data, error } = await supabase.storage.from(BUCKET).download(filePath);
      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      toast({ title: 'Error al descargar', description: err.message, variant: 'destructive' });
    }
  };

  const handleDelete = async (file: StorageFile) => {
    try {
      const filePath = `${FOLDER}/${file.name}`;
      const { error } = await supabase.storage.from(BUCKET).remove([filePath]);
      if (error) throw error;

      // If the deleted file was selected, deselect
      if (selectedUrl === file.publicUrl) {
        handleDeselect();
      }

      toast({ title: 'Plantilla eliminada' });
      await loadFiles();
    } catch (err: any) {
      toast({ title: 'Error al eliminar', description: err.message, variant: 'destructive' });
    }
  };

  const formatFileName = (name: string) => {
    // Remove timestamp prefix
    return name.replace(/^\d+_/, '').replace(/_/g, ' ').replace(/\.pptx$/i, '');
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const isSelected = (file: StorageFile) => selectedUrl === file.publicUrl;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">Plantillas PPTX</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Sube y gestiona tus plantillas. Selecciona una para usarla en la generación.
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

      {/* File list */}
      {loading ? (
        <div className="flex items-center justify-center py-8 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
          <span className="text-xs">Cargando plantillas...</span>
        </div>
      ) : files.length === 0 ? (
        <div className="py-8 text-center border-2 border-dashed border-[hsl(var(--linear-border))] rounded-[5px]">
          <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No hay plantillas subidas</p>
          <p className="text-xs text-muted-foreground mt-1">Sube un archivo .pptx para comenzar</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {files.map(file => {
            const selected = isSelected(file);
            return (
              <div
                key={file.name}
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
                    {formatFileName(file.name)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {file.created_at ? getRelativeTime(file.created_at) : ''}
                    {file.metadata?.size ? ` · ${formatSize(file.metadata.size)}` : ''}
                  </p>
                </div>

                <div className="flex gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleDownload(file)}
                    className="p-1.5 text-xs rounded-[4px] text-muted-foreground hover:bg-secondary transition-colors"
                    title="Descargar"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  {!selected ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleSelect(file)}
                        className="px-2.5 py-1 text-xs font-medium rounded-[4px] border border-[hsl(var(--linear-border))] text-foreground hover:bg-secondary/80 transition-colors"
                      >
                        Usar esta
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(file)}
                        className="p-1.5 text-xs rounded-[4px] text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={handleDeselect}
                      className="px-2.5 py-1 text-xs font-medium rounded-[4px] border border-primary/30 text-primary hover:bg-primary/10 transition-colors"
                    >
                      Deseleccionar
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

