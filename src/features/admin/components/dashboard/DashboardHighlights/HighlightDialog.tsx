import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { IconPicker } from '@/components/admin/sidebar-settings/IconPicker';
import { Highlight, CreateHighlightData } from './useHighlights';

const schema = z.object({
  title: z.string().min(1, 'El título es obligatorio').max(50, 'Máximo 50 caracteres'),
  url: z.string().min(1, 'La URL es obligatoria').max(500, 'Máximo 500 caracteres'),
  icon: z.string().default('Link'),
  description: z.string().max(100, 'Máximo 100 caracteres').optional(),
  color: z.string().default('blue'),
});

type FormData = z.infer<typeof schema>;

interface HighlightDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  highlight?: Highlight | null;
  onSave: (data: CreateHighlightData) => void;
  isSaving?: boolean;
}

const COLORS = [
  { value: 'blue', label: 'Azul' },
  { value: 'green', label: 'Verde' },
  { value: 'purple', label: 'Púrpura' },
  { value: 'orange', label: 'Naranja' },
  { value: 'red', label: 'Rojo' },
  { value: 'yellow', label: 'Amarillo' },
  { value: 'pink', label: 'Rosa' },
  { value: 'gray', label: 'Gris' },
];

export const HighlightDialog: React.FC<HighlightDialogProps> = ({
  open,
  onOpenChange,
  highlight,
  onSave,
  isSaving = false,
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      url: '',
      icon: 'Link',
      description: '',
      color: 'blue',
    },
  });

  const icon = watch('icon');
  const color = watch('color');

  useEffect(() => {
    if (open) {
      if (highlight) {
        reset({
          title: highlight.title,
          url: highlight.url,
          icon: highlight.icon,
          description: highlight.description || '',
          color: highlight.color,
        });
      } else {
        reset({
          title: '',
          url: '',
          icon: 'Link',
          description: '',
          color: 'blue',
        });
      }
    }
  }, [open, highlight, reset]);

  const onSubmit = (data: FormData) => {
    onSave({
      title: data.title,
      url: data.url,
      icon: data.icon,
      description: data.description || undefined,
      color: data.color,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {highlight ? 'Editar destacado' : 'Nuevo destacado'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="Mi enlace rápido"
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">URL *</Label>
            <Input
              id="url"
              {...register('url')}
              placeholder="/admin/leads o https://..."
            />
            {errors.url && (
              <p className="text-sm text-destructive">{errors.url.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Icono</Label>
              <IconPicker
                value={icon}
                onChange={(iconName) => setValue('icon', iconName)}
              />
            </div>

            <div className="space-y-2">
              <Label>Color</Label>
              <Select value={color} onValueChange={(v) => setValue('color', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COLORS.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-3 h-3 rounded-full bg-${c.value}-500`}
                        />
                        {c.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción (opcional)</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Breve descripción..."
              rows={2}
            />
            {errors.description && (
              <p className="text-sm text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
