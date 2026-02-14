import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { type ContentCalendarItem } from '@/hooks/useContentCalendar';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

interface ContentItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: ContentCalendarItem | null;
  prefill: Partial<ContentCalendarItem>;
  onSave: (data: Partial<ContentCalendarItem>) => void;
}

const CHANNEL_OPTIONS = [
  { value: 'linkedin_company', label: '🏢 LinkedIn Empresa' },
  { value: 'linkedin_personal', label: '👤 LinkedIn Personal' },
  { value: 'blog', label: '📝 Blog / Web' },
  { value: 'newsletter', label: '📧 Newsletter' },
  { value: 'crm_internal', label: '🔒 CRM Interno' },
];

const LINKEDIN_FORMAT_OPTIONS = [
  { value: 'carousel', label: 'Carrusel' },
  { value: 'long_text', label: 'Texto largo' },
  { value: 'infographic', label: 'Infografía' },
  { value: 'opinion', label: 'Opinión' },
  { value: 'storytelling', label: 'Storytelling' },
  { value: 'data_highlight', label: 'Dato destacado' },
];

const AUDIENCE_OPTIONS = [
  { value: 'sellers', label: '🎯 Vendedores' },
  { value: 'buyers', label: '💼 Compradores' },
  { value: 'advisors', label: '🤝 Asesores' },
  { value: 'internal', label: '🔒 Interno' },
];

const ContentItemDialog: React.FC<ContentItemDialogProps> = ({ open, onOpenChange, item, prefill, onSave }) => {
  const { register, handleSubmit, setValue, watch, reset } = useForm<Partial<ContentCalendarItem>>();
  const [isGeneratingDraft, setIsGeneratingDraft] = useState(false);
  const [isOptimizingSEO, setIsOptimizingSEO] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (open) {
      if (item) {
        reset(item);
      } else {
        reset({
          title: '',
          status: 'idea',
          priority: 'medium',
          content_type: 'article',
          channel: 'blog',
          linkedin_format: null,
          target_audience: 'sellers',
          category: '',
          scheduled_date: null,
          notes: '',
          target_keywords: [],
          meta_title: '',
          meta_description: '',
          ai_generated_content: null,
          key_data: '',
          ...prefill,
        });
      }
    }
  }, [open, item, prefill, reset]);

  const status = watch('status');
  const priority = watch('priority');
  const contentType = watch('content_type');
  const channel = watch('channel');
  const linkedinFormat = watch('linkedin_format');
  const targetAudience = watch('target_audience');
  const aiContent = watch('ai_generated_content');
  const isLinkedIn = channel === 'linkedin_company' || channel === 'linkedin_personal';

  const handleGenerateDraft = async () => {
    setIsGeneratingDraft(true);
    try {
      const formData = watch();
      const { data, error } = await supabase.functions.invoke('generate-content-calendar-ai', {
        body: {
          mode: 'generate_draft',
          item_data: {
            title: formData.title,
            channel: formData.channel,
            content_type: formData.content_type,
            linkedin_format: formData.linkedin_format,
            target_audience: formData.target_audience,
            notes: formData.notes,
            key_data: formData.key_data,
            target_keywords: formData.target_keywords,
            category: formData.category,
          },
        },
      });
      if (error) throw error;
      if (data?.error) { toast.error(data.error); return; }
      
      setValue('ai_generated_content', data.result.content);
      setValue('ai_generation_metadata', data.metadata);
      setShowPreview(true);
      toast.success('Borrador generado');
    } catch (e: any) {
      toast.error(e.message || 'Error generando borrador');
    } finally {
      setIsGeneratingDraft(false);
    }
  };

  const handleOptimizeSEO = async () => {
    setIsOptimizingSEO(true);
    try {
      const formData = watch();
      const { data, error } = await supabase.functions.invoke('generate-content-calendar-ai', {
        body: {
          mode: 'optimize_seo',
          item_data: {
            title: formData.title,
            channel: formData.channel,
            category: formData.category,
            notes: formData.notes,
            ai_generated_content: formData.ai_generated_content,
          },
        },
      });
      if (error) throw error;
      if (data?.error) { toast.error(data.error); return; }

      setValue('meta_title', data.result.meta_title);
      setValue('meta_description', data.result.meta_description);
      setValue('target_keywords', data.result.target_keywords);
      toast.success('SEO optimizado');
    } catch (e: any) {
      toast.error(e.message || 'Error optimizando SEO');
    } finally {
      setIsOptimizingSEO(false);
    }
  };

  const onSubmit = (data: Partial<ContentCalendarItem>) => {
    if (typeof data.target_keywords === 'string') {
      data.target_keywords = (data.target_keywords as unknown as string).split(',').map(k => k.trim()).filter(Boolean);
    }
    if (typeof data.tags === 'string') {
      data.tags = (data.tags as unknown as string).split(',').map(k => k.trim()).filter(Boolean);
    }
    onSave(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{item ? 'Editar elemento' : 'Nuevo elemento'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>Título *</Label>
            <Input {...register('title', { required: true })} placeholder="Título del contenido" />
          </div>

          {/* Row 1: Status, Priority, Type */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Estado</Label>
              <Select value={status} onValueChange={v => setValue('status', v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="idea">💡 Idea</SelectItem>
                  <SelectItem value="draft">📝 Borrador</SelectItem>
                  <SelectItem value="review">👀 Revisión</SelectItem>
                  <SelectItem value="scheduled">📅 Programado</SelectItem>
                  <SelectItem value="published">✅ Publicado</SelectItem>
                  <SelectItem value="archived">📦 Archivado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Prioridad</Label>
              <Select value={priority} onValueChange={v => setValue('priority', v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">🟢 Baja</SelectItem>
                  <SelectItem value="medium">🟡 Media</SelectItem>
                  <SelectItem value="high">🟠 Alta</SelectItem>
                  <SelectItem value="urgent">🔴 Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tipo</Label>
              <Select value={contentType} onValueChange={v => setValue('content_type', v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="article">Artículo</SelectItem>
                  <SelectItem value="guide">Guía</SelectItem>
                  <SelectItem value="case_study">Caso de estudio</SelectItem>
                  <SelectItem value="report">Informe</SelectItem>
                  <SelectItem value="infographic">Infografía</SelectItem>
                  <SelectItem value="newsletter">Newsletter</SelectItem>
                  <SelectItem value="linkedin_post">Post LinkedIn</SelectItem>
                  <SelectItem value="carousel">Carrusel</SelectItem>
                  <SelectItem value="newsletter_edition">Edición Newsletter</SelectItem>
                  <SelectItem value="sector_brief">Brief Sectorial</SelectItem>
                  <SelectItem value="crm_sheet">Ficha CRM</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 2: Channel, LinkedIn Format, Audience */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Canal</Label>
              <Select value={channel || 'blog'} onValueChange={v => setValue('channel', v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CHANNEL_OPTIONS.map(o => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {isLinkedIn && (
              <div>
                <Label>Formato LinkedIn</Label>
                <Select value={linkedinFormat || ''} onValueChange={v => setValue('linkedin_format', v as any)}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                  <SelectContent>
                    {LINKEDIN_FORMAT_OPTIONS.map(o => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <Label>Audiencia</Label>
              <Select value={targetAudience || 'sellers'} onValueChange={v => setValue('target_audience', v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {AUDIENCE_OPTIONS.map(o => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Fecha programada</Label>
              <Input type="date" {...register('scheduled_date')} />
            </div>
            <div>
              <Label>Categoría / Sector</Label>
              <Input {...register('category')} placeholder="Despachos, Salud, M&A..." />
            </div>
          </div>

          <div>
            <Label>Dato clave</Label>
            <Input {...register('key_data')} placeholder="Ej: 11 de 30 CPAs = propiedad PE" />
          </div>

          <div>
            <Label>Keywords objetivo (separadas por coma)</Label>
            <Input
              {...register('target_keywords')}
              placeholder="valoración empresa, M&A España..."
              defaultValue={item?.target_keywords?.join(', ') || prefill.target_keywords?.join(', ') || ''}
            />
          </div>

          <div>
            <Label>Notas / Brief</Label>
            <Textarea {...register('notes')} placeholder="Descripción, enfoque, fuentes..." rows={3} />
          </div>

          {/* AI Section */}
          <div className="border-t pt-3 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Sparkles className="h-3 w-3" /> Contenido IA
              </p>
              <div className="flex gap-2">
                <Button type="button" size="sm" variant="outline" onClick={handleGenerateDraft} disabled={isGeneratingDraft}>
                  {isGeneratingDraft ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Sparkles className="h-3 w-3 mr-1" />}
                  Generar borrador
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={() => setShowPreview(p => !p)} disabled={!aiContent}>
                  {showPreview ? 'Editar' : 'Preview'}
                </Button>
              </div>
            </div>
            {showPreview && aiContent ? (
              <div className="border rounded-lg p-4 prose prose-sm max-w-none bg-muted/30 max-h-[300px] overflow-y-auto">
                <ReactMarkdown>{aiContent}</ReactMarkdown>
              </div>
            ) : (
              <Textarea
                {...register('ai_generated_content')}
                placeholder="El contenido generado por IA aparecerá aquí..."
                rows={6}
                className="font-mono text-xs"
              />
            )}
            {aiContent && (
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                <Badge variant="secondary" className="text-[10px]">
                  {aiContent.split(/\s+/).length} palabras
                </Badge>
              </div>
            )}
          </div>

          {/* SEO Section */}
          <div className="border-t pt-3 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">SEO</p>
              <Button type="button" size="sm" variant="outline" onClick={handleOptimizeSEO} disabled={isOptimizingSEO}>
                {isOptimizingSEO ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Sparkles className="h-3 w-3 mr-1" />}
                Optimizar SEO
              </Button>
            </div>
            <div>
              <Label>Meta título</Label>
              <Input {...register('meta_title')} placeholder="Título SEO (max 60 chars)" maxLength={60} />
            </div>
            <div>
              <Label>Meta descripción</Label>
              <Textarea {...register('meta_description')} placeholder="Descripción SEO (max 160 chars)" rows={2} maxLength={160} />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit">{item ? 'Guardar cambios' : 'Crear'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ContentItemDialog;
