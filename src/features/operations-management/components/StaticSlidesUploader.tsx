import React, { useRef } from 'react';
import { Upload, X, Image, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { FullSlideTemplate } from '../types/slideTemplate';
import { DEFAULT_TEMPLATE_SLIDE_MAP, DEFAULT_SKIP_SLIDES } from '../types/slideTemplate';
import { DEALHUB_SECTIONS } from '../utils/generateDealhubPptx';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface StaticSlidesUploaderProps {
  template: FullSlideTemplate;
  onChange: (template: FullSlideTemplate) => void;
}

interface SlotConfig {
  label: string;
  getValue: (t: FullSlideTemplate) => string | undefined;
  setValue: (t: FullSlideTemplate, url: string | undefined) => FullSlideTemplate;
}

const SLOTS: SlotConfig[] = [
  {
    label: 'Portada',
    getValue: (t) => t.cover.backgroundImage,
    setValue: (t, url) => ({ ...t, cover: { ...t.cover, backgroundImage: url } }),
  },
  {
    label: 'Índice',
    getValue: (t) => t.index.backgroundImage,
    setValue: (t, url) => ({ ...t, index: { ...t.index, backgroundImage: url } }),
  },
  ...DEALHUB_SECTIONS.map((s, i) => ({
    label: `Separador ${String(i + 1).padStart(2, '0')} — ${s.label}`,
    getValue: (t: FullSlideTemplate) => t.separator.backgroundImages?.[s.key],
    setValue: (t: FullSlideTemplate, url: string | undefined) => ({
      ...t,
      separator: {
        ...t.separator,
        backgroundImages: { ...(t.separator.backgroundImages || {}), [s.key]: url || '' },
      },
    }),
  })),
  {
    label: 'Cierre',
    getValue: (t) => t.closing?.backgroundImage,
    setValue: (t, url) => ({ ...t, closing: { ...(t.closing || {}), backgroundImage: url } as any }),
  },
];

const SlotUploader: React.FC<{
  slot: SlotConfig;
  template: FullSlideTemplate;
  onChange: (t: FullSlideTemplate) => void;
}> = ({ slot, template, onChange }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [uploading, setUploading] = React.useState(false);
  const value = slot.getValue(template);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Solo se permiten imágenes', variant: 'destructive' });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: 'Máximo 10MB', variant: 'destructive' });
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `slides/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { data, error } = await supabase.storage.from('slide-backgrounds').upload(path, file);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('slide-backgrounds').getPublicUrl(data.path);
      onChange(slot.setValue(template, publicUrl));
    } catch (err: any) {
      toast({ title: 'Error al subir', description: err.message, variant: 'destructive' });
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleRemove = () => {
    onChange(slot.setValue(template, undefined));
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-[5px] border border-[hsl(var(--linear-border))] bg-background">
      {value ? (
        <img src={value} alt={slot.label} className="w-20 h-12 object-cover rounded-[4px] border border-[hsl(var(--linear-border))]" />
      ) : (
        <div className="w-20 h-12 rounded-[4px] border border-dashed border-[hsl(var(--linear-border))] flex items-center justify-center bg-secondary/40">
          <Image className="w-4 h-4 text-muted-foreground" />
        </div>
      )}
      <span className="flex-1 text-sm text-foreground font-medium truncate">{slot.label}</span>
      <div className="flex gap-1.5">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="px-2.5 py-1.5 text-xs font-semibold rounded-[4px] border border-[hsl(var(--linear-border))] bg-secondary text-foreground hover:bg-secondary/80 transition-colors flex items-center gap-1.5"
        >
          <Upload className="w-3 h-3" />
          {uploading ? 'Subiendo...' : value ? 'Cambiar' : 'Subir'}
        </button>
        {value && (
          <button
            type="button"
            onClick={handleRemove}
            className="px-2 py-1.5 text-xs rounded-[4px] border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
    </div>
  );
};

const PptxUploader: React.FC<{
  template: FullSlideTemplate;
  onChange: (t: FullSlideTemplate) => void;
}> = ({ template, onChange }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [uploading, setUploading] = React.useState(false);
  const value = template.templatePptxUrl;

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
      const path = `templates/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.pptx`;
      const { data, error } = await supabase.storage.from('slide-backgrounds').upload(path, file);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('slide-backgrounds').getPublicUrl(data.path);
      onChange({
        ...template,
        templatePptxUrl: publicUrl,
        templateSlideMap: template.templateSlideMap || { ...DEFAULT_TEMPLATE_SLIDE_MAP },
        skipSlides: template.skipSlides || [...DEFAULT_SKIP_SLIDES],
      });
      toast({ title: 'Plantilla PPTX subida correctamente' });
    } catch (err: any) {
      toast({ title: 'Error al subir', description: err.message, variant: 'destructive' });
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleRemove = () => {
    onChange({ ...template, templatePptxUrl: undefined, templateSlideMap: undefined, skipSlides: undefined });
  };

  return (
    <div className="p-4 rounded-[5px] border-2 border-dashed border-[hsl(var(--linear-border))] bg-secondary/20">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-[5px] bg-primary/10 flex items-center justify-center shrink-0">
          <FileText className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">Plantilla PPTX completa</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {value
              ? 'Plantilla cargada — las slides de operaciones se insertarán automáticamente'
              : 'Sube un .pptx con portada, índice, separadores y cierre. Las operaciones se insertan tras cada separador.'}
          </p>
        </div>
        <div className="flex gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="px-3 py-1.5 text-xs font-semibold rounded-[4px] border border-[hsl(var(--linear-border))] bg-secondary text-foreground hover:bg-secondary/80 transition-colors flex items-center gap-1.5"
          >
            <Upload className="w-3 h-3" />
            {uploading ? 'Subiendo...' : value ? 'Cambiar' : 'Subir PPTX'}
          </button>
          {value && (
            <button
              type="button"
              onClick={handleRemove}
              className="px-2 py-1.5 text-xs rounded-[4px] border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
      <input ref={inputRef} type="file" accept=".pptx" onChange={handleUpload} className="hidden" />
    </div>
  );
};

/** Editable mapping: which template slide corresponds to each section separator */
const SlideMapEditor: React.FC<{
  template: FullSlideTemplate;
  onChange: (t: FullSlideTemplate) => void;
}> = ({ template, onChange }) => {
  const slideMap = template.templateSlideMap || { ...DEFAULT_TEMPLATE_SLIDE_MAP };
  const skipSlides = template.skipSlides || [...DEFAULT_SKIP_SLIDES];

  const updateMap = (key: string, value: number) => {
    onChange({
      ...template,
      templateSlideMap: { ...slideMap, [key]: value },
    });
  };

  const updateSkipSlides = (text: string) => {
    const nums = text.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n) && n > 0);
    onChange({ ...template, skipSlides: nums });
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Mapeo de separadores
        </p>
        <p className="text-xs text-muted-foreground mb-3">
          Indica en qué número de slide del PPTX está cada separador de sección. Las operaciones se insertarán después.
        </p>
        <div className="grid grid-cols-2 gap-3">
          {DEALHUB_SECTIONS.map(section => (
            <div key={section.key} className="flex items-center gap-2">
              <Label className="text-xs text-foreground flex-1 truncate">{section.label}</Label>
              <Input
                type="number"
                min={1}
                value={slideMap[section.key] || ''}
                onChange={e => updateMap(section.key, parseInt(e.target.value) || 0)}
                className="w-16 h-8 text-xs text-center"
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Slides a eliminar
        </Label>
        <p className="text-xs text-muted-foreground mt-1 mb-2">
          Slides de ejemplo o placeholder que se deben eliminar del PPTX antes de mergear (separadas por comas).
        </p>
        <Input
          type="text"
          value={skipSlides.join(', ')}
          onChange={e => updateSkipSlides(e.target.value)}
          placeholder="Ej: 4"
          className="h-8 text-xs"
        />
      </div>
    </div>
  );
};

export const StaticSlidesUploader: React.FC<StaticSlidesUploaderProps> = ({ template, onChange }) => {
  const hasPptx = !!template.templatePptxUrl;

  return (
    <div className="p-6 space-y-4">
      {/* PPTX template upload */}
      <PptxUploader template={template} onChange={onChange} />

      {/* When PPTX is uploaded, show slide mapping editor instead of individual images */}
      {hasPptx ? (
        <SlideMapEditor template={template} onChange={onChange} />
      ) : (
        <>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-[hsl(var(--linear-border))]" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-background px-2 text-muted-foreground">o sube imágenes individuales</span>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Si no usas plantilla PPTX, puedes subir imágenes PNG/JPG para slides fijas individuales.
          </p>
          <div className="space-y-2">
            {SLOTS.map((slot, i) => (
              <SlotUploader key={i} slot={slot} template={template} onChange={onChange} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
