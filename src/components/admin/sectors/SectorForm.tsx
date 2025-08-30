import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useSectors } from '@/hooks/useSectors';
import { Sector } from '@/types/sectors';

const sectorSchema = z.object({
  name_es: z.string().min(1, 'El nombre en español es requerido'),
  name_en: z.string().optional(),
  slug: z.string()
    .min(1, 'El slug es requerido')
    .regex(/^[a-z0-9-]+$/, 'El slug solo puede contener letras minúsculas, números y guiones'),
  description: z.string().optional(),
  display_order: z.number().min(0, 'El orden debe ser mayor o igual a 0'),
  is_active: z.boolean(),
});

type SectorFormData = z.infer<typeof sectorSchema>;

interface SectorFormProps {
  sector?: Sector | null;
  isOpen: boolean;
  onClose: () => void;
}

export const SectorForm: React.FC<SectorFormProps> = ({
  sector,
  isOpen,
  onClose,
}) => {
  const { createSector, updateSector, isCreating, isUpdating } = useSectors();

  const form = useForm<SectorFormData>({
    resolver: zodResolver(sectorSchema),
    defaultValues: {
      name_es: sector?.name_es || '',
      name_en: sector?.name_en || '',
      slug: sector?.slug || '',
      description: sector?.description || '',
      display_order: sector?.display_order || 0,
      is_active: sector?.is_active ?? true,
    },
  });

  const isEditing = !!sector;
  const isSubmitting = isCreating || isUpdating;

  const onSubmit = (data: SectorFormData) => {
    if (isEditing && sector) {
      updateSector({
        id: sector.id,
        updates: data,
      });
    } else {
      createSector({
        name_es: data.name_es,
        name_en: data.name_en,
        slug: data.slug,
        description: data.description,
        display_order: data.display_order,
      });
    }
    onClose();
  };

  // Auto-generate slug from name_es
  const handleNameChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .replace(/[áäâà]/g, 'a')
      .replace(/[éëêè]/g, 'e')
      .replace(/[íïîì]/g, 'i')
      .replace(/[óöôò]/g, 'o')
      .replace(/[úüûù]/g, 'u')
      .replace(/[ñ]/g, 'n')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
    
    form.setValue('slug', slug);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Editar Sector' : 'Crear Nuevo Sector'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Modifica los datos del sector seleccionado'
              : 'Completa la información para crear un nuevo sector'
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name_es"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre (Español) *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: Tecnología"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        if (!isEditing) {
                          handleNameChange(e.target.value);
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name_en"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre (Inglés)</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Technology" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="ej: tecnologia" 
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descripción opcional del sector"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-4">
              <FormField
                control={form.control}
                name="display_order"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Orden de visualización</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-col justify-end">
                    <FormLabel>Activo</FormLabel>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting 
                  ? (isEditing ? 'Guardando...' : 'Creando...')
                  : (isEditing ? 'Guardar cambios' : 'Crear sector')
                }
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};