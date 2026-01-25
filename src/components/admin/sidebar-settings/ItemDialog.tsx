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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SidebarItem, SidebarItemFormData, SidebarSection } from '@/types/sidebar-config';
import { IconPicker } from './IconPicker';

const itemSchema = z.object({
  title: z.string().min(1, 'El título es requerido').max(50),
  url: z.string().min(1, 'La URL es requerida').max(200),
  icon: z.string().min(1, 'El icono es requerido'),
  description: z.string().max(200).optional(),
  badge: z.enum(['URGENTE', 'AI', 'NEW', 'HOT']).nullable().optional(),
  is_active: z.boolean(),
  section_id: z.string().optional(),
});

interface ItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: SidebarItem | null;
  onSave: (data: SidebarItemFormData & { section_id?: string }) => void;
  isLoading?: boolean;
  sections?: SidebarSection[];
  currentSectionId?: string | null;
}

export const ItemDialog: React.FC<ItemDialogProps> = ({
  open,
  onOpenChange,
  item,
  onSave,
  isLoading = false,
  sections = [],
  currentSectionId = null,
}) => {
  const isEditing = !!item;

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<SidebarItemFormData & { section_id?: string }>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      title: '',
      url: '',
      icon: 'Circle',
      description: '',
      badge: null,
      is_active: true,
      section_id: undefined,
    },
  });

  useEffect(() => {
    if (item) {
      reset({
        title: item.title,
        url: item.url,
        icon: item.icon,
        description: item.description || '',
        badge: item.badge,
        is_active: item.is_active,
        section_id: item.section_id,
      });
    } else {
      reset({
        title: '',
        url: '/admin/',
        icon: 'Circle',
        description: '',
        badge: null,
        is_active: true,
        section_id: currentSectionId || undefined,
      });
    }
  }, [item, reset, currentSectionId]);

  const onSubmit = (data: SidebarItemFormData) => {
    onSave(data);
  };

  const isActive = watch('is_active');
  const currentIcon = watch('icon');
  const currentBadge = watch('badge');
  const currentSectionIdValue = watch('section_id');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Item' : 'Nuevo Item'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="Vista General"
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">URL *</Label>
            <Input
              id="url"
              {...register('url')}
              placeholder="/admin/dashboard"
            />
            {errors.url && (
              <p className="text-xs text-destructive">{errors.url.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Icono *</Label>
            <IconPicker
              value={currentIcon}
              onChange={(iconName) => setValue('icon', iconName)}
            />
            {errors.icon && (
              <p className="text-xs text-destructive">{errors.icon.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Descripción breve del item"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Badge</Label>
            <Select
              value={currentBadge || 'none'}
              onValueChange={(value) => setValue('badge', value === 'none' ? null : value as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sin badge" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sin badge</SelectItem>
                <SelectItem value="URGENTE">🔴 URGENTE</SelectItem>
                <SelectItem value="AI">✨ AI</SelectItem>
                <SelectItem value="NEW">🆕 NEW</SelectItem>
                <SelectItem value="HOT">🔥 HOT</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {sections.length > 0 && isEditing && (
            <div className="space-y-2">
              <Label>Sección</Label>
              <Select
                value={currentSectionIdValue || currentSectionId || ''}
                onValueChange={(value) => setValue('section_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona sección" />
                </SelectTrigger>
                <SelectContent>
                  {sections.map((section) => (
                    <SelectItem key={section.id} value={section.id}>
                      {section.emoji} {section.title.replace(/^[^\s]+\s/, '')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Cambia la sección para mover este item
              </p>
            </div>
          )}

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <Label htmlFor="is_active">Activo</Label>
              <p className="text-xs text-muted-foreground">
                Mostrar item en el sidebar
              </p>
            </div>
            <Switch
              id="is_active"
              checked={isActive}
              onCheckedChange={(checked) => setValue('is_active', checked)}
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
