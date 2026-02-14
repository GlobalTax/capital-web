import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { type ContentCalendarItem } from '@/hooks/useContentCalendar';

interface ContentItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: ContentCalendarItem | null;
  prefill: Partial<ContentCalendarItem>;
  onSave: (data: Partial<ContentCalendarItem>) => void;
}

const ContentItemDialog: React.FC<ContentItemDialogProps> = ({ open, onOpenChange, item, prefill, onSave }) => {
  const { register, handleSubmit, setValue, watch, reset } = useForm<Partial<ContentCalendarItem>>();

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
          category: '',
          scheduled_date: null,
          notes: '',
          target_keywords: [],
          meta_title: '',
          meta_description: '',
          ...prefill,
        });
      }
    }
  }, [open, item, prefill, reset]);

  const status = watch('status');
  const priority = watch('priority');
  const contentType = watch('content_type');

  const onSubmit = (data: Partial<ContentCalendarItem>) => {
    // Convert comma-separated keywords to array
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{item ? 'Editar elemento' : 'Nuevo elemento'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>Título *</Label>
            <Input {...register('title', { required: true })} placeholder="Título del contenido" />
          </div>

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
              <Label>Categoría</Label>
              <Input {...register('category')} placeholder="M&A, Valoraciones, PE..." />
            </div>
          </div>

          <div>
            <Label>Keywords objetivo (separadas por coma)</Label>
            <Input
              {...register('target_keywords')}
              placeholder="valoración empresa, M&A España, due diligence..."
              defaultValue={item?.target_keywords?.join(', ') || prefill.target_keywords?.join(', ') || ''}
            />
          </div>

          <div>
            <Label>Notas / Brief</Label>
            <Textarea {...register('notes')} placeholder="Descripción, enfoque, fuentes..." rows={4} />
          </div>

          <div className="border-t pt-3 space-y-3">
            <p className="text-xs font-medium text-muted-foreground">SEO</p>
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
