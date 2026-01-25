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
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { SidebarSection, SidebarSectionFormData } from '@/types/sidebar-config';

const sectionSchema = z.object({
  title: z.string().min(1, 'El título es requerido').max(50),
  description: z.string().max(200).optional(),
  emoji: z.string().max(4).optional(),
  is_active: z.boolean(),
  is_collapsed_default: z.boolean(),
});

interface SectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  section: SidebarSection | null;
  onSave: (data: SidebarSectionFormData) => void;
  isLoading?: boolean;
}

export const SectionDialog: React.FC<SectionDialogProps> = ({
  open,
  onOpenChange,
  section,
  onSave,
  isLoading = false,
}) => {
  const isEditing = !!section;

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<SidebarSectionFormData>({
    resolver: zodResolver(sectionSchema),
    defaultValues: {
      title: '',
      description: '',
      emoji: '',
      is_active: true,
      is_collapsed_default: false,
    },
  });

  useEffect(() => {
    if (section) {
      reset({
        title: section.title,
        description: section.description || '',
        emoji: section.emoji || '',
        is_active: section.is_active,
        is_collapsed_default: section.is_collapsed_default,
      });
    } else {
      reset({
        title: '',
        description: '',
        emoji: '',
        is_active: true,
        is_collapsed_default: false,
      });
    }
  }, [section, reset]);

  const onSubmit = (data: SidebarSectionFormData) => {
    onSave(data);
  };

  const isActive = watch('is_active');
  const isCollapsed = watch('is_collapsed_default');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Sección' : 'Nueva Sección'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-[60px_1fr] gap-3">
            <div className="space-y-2">
              <Label htmlFor="emoji">Emoji</Label>
              <Input
                id="emoji"
                {...register('emoji')}
                placeholder="📊"
                className="text-center text-lg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                {...register('title')}
                placeholder="DASHBOARD"
              />
              {errors.title && (
                <p className="text-xs text-destructive">{errors.title.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Descripción breve de la sección"
              rows={2}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <Label htmlFor="is_active">Activa</Label>
              <p className="text-xs text-muted-foreground">
                Mostrar sección en el sidebar
              </p>
            </div>
            <Switch
              id="is_active"
              checked={isActive}
              onCheckedChange={(checked) => setValue('is_active', checked)}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <Label htmlFor="is_collapsed">Colapsada por defecto</Label>
              <p className="text-xs text-muted-foreground">
                Iniciar con la sección cerrada
              </p>
            </div>
            <Switch
              id="is_collapsed"
              checked={isCollapsed}
              onCheckedChange={(checked) => setValue('is_collapsed_default', checked)}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Guardando...' : isEditing ? 'Guardar' : 'Crear'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
