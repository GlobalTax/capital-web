import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, Loader2, Copy, RefreshCw } from 'lucide-react';
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
  const [isRepurposing, setIsRepurposing] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    if (open) {
      if (item) {
        reset(item);
      } else {
        reset({
          title: '', status: 'idea', priority: 'medium', content_type: 'article',
          channel: 'blog', linkedin_format: null, target_audience: 'sellers',
          category: '', scheduled_date: null, notes: '', target_keywords: [],
          meta_title: '', meta_description: '', ai_generated_content: null, key_data: '',
          ...prefill,
        });
      }
      setActiveTab('details');
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

  const callAI = async (mode: string, extraBody?: Record<string, any>) => {
    const formData = watch();
    const { data, error } = await supabase.functions.invoke('generate-content-calendar-ai', {
      body: {
        mode,
        item_data: {
          title: formData.title, channel: formData.channel, content_type: formData.content_type,
          linkedin_format: formData.linkedin_format, target_audience: formData.target_audience,
          notes: formData.notes, key_data: formData.key_data, target_keywords: formData.target_keywords,
          category: formData.category, ai_generated_content: formData.ai_generated_content,
        },
        ...extraBody,
      },
    });
    if (error) throw error;
    if (data?.error) throw new Error(data.error);
    return data;
  };

  const handleGenerateDraft = async () => {
    setIsGeneratingDraft(true);
    try {
      const data = await callAI('generate_draft');
      setValue('ai_generated_content', data?.result?.content || '');
      setValue('ai_generation_metadata', data?.metadata || null);
      setActiveTab('content');
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
      const data = await callAI('optimize_seo');
      setValue('meta_title', data?.result?.meta_title || '');
      setValue('meta_description', data?.result?.meta_description || '');
      setValue('target_keywords', Array.isArray(data?.result?.target_keywords) ? data.result.target_keywords : []);
      setActiveTab('seo');
      toast.success('SEO optimizado');
    } catch (e: any) {
      toast.error(e.message || 'Error optimizando SEO');
    } finally {
      setIsOptimizingSEO(false);
    }
  };

  const handleRepurpose = async (targetChannel: string) => {
    setIsRepurposing(true);
    try {
      const data = await callAI('generate_draft', {
        item_data: {
          ...watch(),
          channel: targetChannel,
          content_type: targetChannel.startsWith('linkedin') ? 'linkedin_post' : 'article',
          notes: `Repurpose del contenido original: ${watch('title')}. ${watch('notes') || ''}`,
        },
      });
      // Copy to clipboard for now
      navigator.clipboard.writeText(data.result.content);
      toast.success(`Contenido adaptado a ${CHANNEL_OPTIONS.find(c => c.value === targetChannel)?.label} copiado al portapapeles`);
    } catch (e: any) {
      toast.error(e.message || 'Error adaptando contenido');
    } finally {
      setIsRepurposing(false);
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
          <DialogTitle className="flex items-center gap-2">
            {item ? 'Editar contenido' : 'Nuevo contenido'}
            {aiContent && <Badge variant="secondary" className="text-[10px]"><Sparkles className="h-2.5 w-2.5 mr-1" />IA</Badge>}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Title */}
          <div>
            <Label>Título *</Label>
            <Input {...register('title', { required: true })} placeholder="Título del contenido" className="text-base font-medium" />
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full justify-start">
              <TabsTrigger value="details">Detalles</TabsTrigger>
              <TabsTrigger value="content" className="gap-1">
                <Sparkles className="h-3 w-3" /> Contenido IA
              </TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
              <TabsTrigger value="repurpose" className="gap-1">
                <RefreshCw className="h-3 w-3" /> Repurpose
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-3 mt-3">
              {/* Row 1 */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs">Estado</Label>
                  <Select value={status} onValueChange={v => setValue('status', v as any)}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
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
                  <Label className="text-xs">Prioridad</Label>
                  <Select value={priority} onValueChange={v => setValue('priority', v as any)}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">🟢 Baja</SelectItem>
                      <SelectItem value="medium">🟡 Media</SelectItem>
                      <SelectItem value="high">🟠 Alta</SelectItem>
                      <SelectItem value="urgent">🔴 Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Tipo</Label>
                  <Select value={contentType} onValueChange={v => setValue('content_type', v as any)}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="article">Artículo</SelectItem>
                      <SelectItem value="guide">Guía</SelectItem>
                      <SelectItem value="case_study">Caso de estudio</SelectItem>
                      <SelectItem value="report">Informe</SelectItem>
                      <SelectItem value="infographic">Infografía</SelectItem>
                      <SelectItem value="linkedin_post">Post LinkedIn</SelectItem>
                      <SelectItem value="carousel">Carrusel</SelectItem>
                      <SelectItem value="newsletter_edition">Edición Newsletter</SelectItem>
                      <SelectItem value="sector_brief">Brief Sectorial</SelectItem>
                      <SelectItem value="crm_sheet">Ficha CRM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs">Canal</Label>
                  <Select value={channel || 'blog'} onValueChange={v => setValue('channel', v as any)}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CHANNEL_OPTIONS.map(o => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {isLinkedIn && (
                  <div>
                    <Label className="text-xs">Formato LinkedIn</Label>
                    <Select value={linkedinFormat || ''} onValueChange={v => setValue('linkedin_format', v as any)}>
                      <SelectTrigger className="h-9"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                      <SelectContent>
                        {LINKEDIN_FORMAT_OPTIONS.map(o => (
                          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div>
                  <Label className="text-xs">Audiencia</Label>
                  <Select value={targetAudience || 'sellers'} onValueChange={v => setValue('target_audience', v as any)}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
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
                  <Label className="text-xs">Fecha programada</Label>
                  <Input type="date" {...register('scheduled_date')} className="h-9" />
                </div>
                <div>
                  <Label className="text-xs">Categoría / Sector</Label>
                  <Input {...register('category')} placeholder="Despachos, Salud, M&A..." className="h-9" />
                </div>
              </div>

              <div>
                <Label className="text-xs">Dato clave</Label>
                <Input {...register('key_data')} placeholder="Ej: 11 de 30 CPAs = propiedad PE" className="h-9" />
              </div>

              <div>
                <Label className="text-xs">Notas / Brief</Label>
                <Textarea {...register('notes')} placeholder="Descripción, enfoque, fuentes..." rows={3} />
              </div>
            </TabsContent>

            <TabsContent value="content" className="space-y-3 mt-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> Borrador generado por IA
                </p>
                <div className="flex gap-2">
                  <Button type="button" size="sm" variant="outline" onClick={handleGenerateDraft} disabled={isGeneratingDraft}>
                    {isGeneratingDraft ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Sparkles className="h-3 w-3 mr-1" />}
                    {aiContent ? 'Regenerar' : 'Generar borrador'}
                  </Button>
                  {aiContent && (
                    <Button type="button" size="sm" variant="ghost" onClick={() => { navigator.clipboard.writeText(aiContent); toast.success('Copiado'); }}>
                      <Copy className="h-3 w-3 mr-1" /> Copiar
                    </Button>
                  )}
                </div>
              </div>
              {aiContent ? (
                <>
                  <div className="border rounded-lg p-4 prose prose-sm max-w-none bg-muted/20 max-h-[350px] overflow-y-auto">
                    <ReactMarkdown>{aiContent}</ReactMarkdown>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                    <Badge variant="secondary" className="text-[10px]">
                      {aiContent.split(/\s+/).length} palabras
                    </Badge>
                    <Badge variant="secondary" className="text-[10px]">
                      ~{Math.ceil(aiContent.split(/\s+/).length / 200)} min lectura
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-xs">Editar borrador</Label>
                    <Textarea
                      {...register('ai_generated_content')}
                      rows={8}
                      className="font-mono text-xs"
                    />
                  </div>
                </>
              ) : (
                <div className="border rounded-lg p-8 text-center text-muted-foreground bg-muted/10">
                  <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Haz clic en "Generar borrador" para crear contenido con IA</p>
                  <p className="text-xs mt-1">Usa los datos del brief, sector PE y audiencia objetivo</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="seo" className="space-y-3 mt-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground">SEO & Keywords</p>
                <Button type="button" size="sm" variant="outline" onClick={handleOptimizeSEO} disabled={isOptimizingSEO}>
                  {isOptimizingSEO ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Sparkles className="h-3 w-3 mr-1" />}
                  Optimizar con IA
                </Button>
              </div>
              <div>
                <Label className="text-xs">Meta título <span className="text-muted-foreground">(max 60)</span></Label>
                <Input {...register('meta_title')} placeholder="Título SEO" maxLength={60} className="h-9" />
              </div>
              <div>
                <Label className="text-xs">Meta descripción <span className="text-muted-foreground">(max 160)</span></Label>
                <Textarea {...register('meta_description')} placeholder="Descripción SEO" rows={2} maxLength={160} />
              </div>
              <div>
                <Label className="text-xs">Keywords objetivo (separadas por coma)</Label>
                <Input
                  {...register('target_keywords')}
                  placeholder="valoración empresa, M&A España..."
                  defaultValue={item?.target_keywords?.join(', ') || prefill.target_keywords?.join(', ') || ''}
                  className="h-9"
                />
              </div>
            </TabsContent>

            <TabsContent value="repurpose" className="space-y-3 mt-3">
              <p className="text-xs text-muted-foreground">
                Adapta este contenido a otros canales con un clic. La IA reformatea el mensaje manteniendo el dato clave.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {CHANNEL_OPTIONS.filter(c => c.value !== channel).map(ch => (
                  <Button
                    key={ch.value}
                    type="button"
                    variant="outline"
                    className="h-auto py-3 flex flex-col gap-1"
                    disabled={isRepurposing || (!aiContent && !watch('notes'))}
                    onClick={() => handleRepurpose(ch.value)}
                  >
                    <span className="text-lg">{ch.label.split(' ')[0]}</span>
                    <span className="text-xs font-normal">Adaptar a {ch.label.substring(2)}</span>
                  </Button>
                ))}
              </div>
              {!aiContent && !watch('notes') && (
                <p className="text-xs text-amber-600">Genera un borrador o añade notas antes de repurposear.</p>
              )}
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit">{item ? 'Guardar cambios' : 'Crear'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ContentItemDialog;
