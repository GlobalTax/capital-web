import React, { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { Save } from 'lucide-react';
import ImageUploadField from './ImageUploadField';

interface LaFirmaFormData {
  section_label: string;
  heading_line1: string;
  heading_line2: string;
  image_url: string;
  image_alt: string;
  paragraph1: string;
  paragraph2: string;
  value1_title: string;
  value1_text: string;
  value2_title: string;
  value2_text: string;
  cta_text: string;
  cta_url: string;
  stat1_value: number;
  stat1_suffix: string;
  stat1_prefix: string;
  stat1_label: string;
  stat2_value: number;
  stat2_suffix: string;
  stat2_prefix: string;
  stat2_label: string;
  stat3_value: number;
  stat3_suffix: string;
  stat3_prefix: string;
  stat3_label: string;
  stat4_value: number;
  stat4_suffix: string;
  stat4_prefix: string;
  stat4_label: string;
}

const LaFirmaManager: React.FC = () => {
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, setValue, watch } = useForm<LaFirmaFormData>();
  const imageUrl = watch('image_url');

  const { data, isLoading } = useQuery({
    queryKey: ['la-firma-content'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('la_firma_content')
        .select('*')
        .limit(1)
        .single();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (data) {
      reset({
        section_label: data.section_label,
        heading_line1: data.heading_line1,
        heading_line2: data.heading_line2,
        image_url: data.image_url || '',
        image_alt: data.image_alt || '',
        paragraph1: data.paragraph1,
        paragraph2: data.paragraph2,
        value1_title: data.value1_title,
        value1_text: data.value1_text,
        value2_title: data.value2_title,
        value2_text: data.value2_text,
        cta_text: data.cta_text,
        cta_url: data.cta_url,
        stat1_value: data.stat1_value,
        stat1_suffix: data.stat1_suffix,
        stat1_prefix: data.stat1_prefix || '',
        stat1_label: data.stat1_label,
        stat2_value: data.stat2_value,
        stat2_suffix: data.stat2_suffix,
        stat2_prefix: data.stat2_prefix || '',
        stat2_label: data.stat2_label,
        stat3_value: data.stat3_value,
        stat3_suffix: data.stat3_suffix,
        stat3_prefix: data.stat3_prefix || '',
        stat3_label: data.stat3_label,
        stat4_value: data.stat4_value,
        stat4_suffix: data.stat4_suffix,
        stat4_prefix: data.stat4_prefix || '',
        stat4_label: data.stat4_label,
      });
    }
  }, [data, reset]);

  const mutation = useMutation({
    mutationFn: async (formData: LaFirmaFormData) => {
      if (!data?.id) throw new Error('No record found');
      const { error } = await supabase
        .from('la_firma_content')
        .update({
          ...formData,
          stat1_value: Number(formData.stat1_value),
          stat2_value: Number(formData.stat2_value),
          stat3_value: Number(formData.stat3_value),
          stat4_value: Number(formData.stat4_value),
          updated_at: new Date().toISOString(),
        })
        .eq('id', data.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['la-firma-content'] });
      toast.success('Contenido actualizado correctamente');
    },
    onError: () => toast.error('Error al guardar los cambios'),
  });

  if (isLoading) return <div className="p-8 text-muted-foreground">Cargando...</div>;

  const StatFields = ({ n, label }: { n: 1 | 2 | 3 | 4; label: string }) => (
    <div className="border border-border rounded-lg p-4 space-y-3">
      <h4 className="font-medium text-sm text-foreground">{label}</h4>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-muted-foreground">Valor</label>
          <Input type="number" {...register(`stat${n}_value` as const)} />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Etiqueta</label>
          <Input {...register(`stat${n}_label` as const)} />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Prefijo</label>
          <Input {...register(`stat${n}_prefix` as const)} placeholder="€" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Sufijo</label>
          <Input {...register(`stat${n}_suffix` as const)} placeholder="M, +, %" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">La Firma</h1>
          <p className="text-sm text-muted-foreground">Gestiona el contenido de la sección "La Firma" en la home</p>
        </div>
        <Button onClick={handleSubmit((d) => mutation.mutate(d))} disabled={mutation.isPending}>
          <Save className="w-4 h-4 mr-2" />
          {mutation.isPending ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </div>

      <form className="space-y-8" onSubmit={handleSubmit((d) => mutation.mutate(d))}>
        {/* Header */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">Encabezado</h3>
          <div>
            <label className="text-sm font-medium text-foreground">Etiqueta de sección</label>
            <Input {...register('section_label')} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground">Título línea 1</label>
              <Input {...register('heading_line1')} />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Título línea 2</label>
              <Input {...register('heading_line2')} />
            </div>
          </div>
        </section>

        {/* Image */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">Imagen del equipo</h3>
          <ImageUploadField
            label="Foto del equipo"
            value={imageUrl}
            onChange={(url) => setValue('image_url', url || '')}
            folder="la-firma"
            placeholder="URL de la imagen del equipo"
          />
          <div>
            <label className="text-sm font-medium text-foreground">Texto alternativo</label>
            <Input {...register('image_alt')} />
          </div>
        </section>

        {/* Text */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">Contenido</h3>
          <div>
            <label className="text-sm font-medium text-foreground">Párrafo principal</label>
            <Textarea {...register('paragraph1')} rows={3} />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Párrafo secundario</label>
            <Textarea {...register('paragraph2')} rows={3} />
          </div>
        </section>

        {/* Values */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">Valores</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground">Valor 1 - Título</label>
              <Input {...register('value1_title')} />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Valor 1 - Texto</label>
              <Input {...register('value1_text')} />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Valor 2 - Título</label>
              <Input {...register('value2_title')} />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Valor 2 - Texto</label>
              <Input {...register('value2_text')} />
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">Call to Action</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground">Texto del enlace</label>
              <Input {...register('cta_text')} />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">URL destino</label>
              <Input {...register('cta_url')} />
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">Estadísticas</h3>
          <div className="grid grid-cols-2 gap-4">
            <StatFields n={1} label="Estadística 1" />
            <StatFields n={2} label="Estadística 2" />
            <StatFields n={3} label="Estadística 3" />
            <StatFields n={4} label="Estadística 4" />
          </div>
        </section>
      </form>
    </div>
  );
};

export default LaFirmaManager;
