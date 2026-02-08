import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { GripVertical, Plus, Pencil, Trash2, Image, Upload } from 'lucide-react';

interface HeroSlide {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  cta_primary_text: string | null;
  cta_primary_url: string | null;
  cta_secondary_text: string | null;
  cta_secondary_url: string | null;
  image_url: string | null;
  display_order: number;
  is_active: boolean;
  autoplay_duration: number | null;
}

const emptySlide = {
  title: '',
  subtitle: '',
  description: '',
  cta_primary_text: 'Contactar',
  cta_primary_url: '#contacto',
  cta_secondary_text: 'Valorar mi empresa',
  cta_secondary_url: '/lp/calculadora-web',
  image_url: '',
  is_active: true,
  autoplay_duration: 6000,
};

const HeroSlidesManager: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [formData, setFormData] = useState(emptySlide);
  const [uploading, setUploading] = useState(false);

  const { data: slides = [], isLoading } = useQuery({
    queryKey: ['hero_slides_admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hero_slides')
        .select('*')
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data as HeroSlide[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData & { id?: string }) => {
      if (data.id) {
        const { error } = await supabase
          .from('hero_slides')
          .update({
            title: data.title,
            subtitle: data.subtitle || null,
            description: data.description || null,
            cta_primary_text: data.cta_primary_text || null,
            cta_primary_url: data.cta_primary_url || null,
            cta_secondary_text: data.cta_secondary_text || null,
            cta_secondary_url: data.cta_secondary_url || null,
            image_url: data.image_url || null,
            is_active: data.is_active,
            autoplay_duration: data.autoplay_duration,
          })
          .eq('id', data.id);
        if (error) throw error;
      } else {
        const maxOrder = slides.length > 0 ? Math.max(...slides.map(s => s.display_order)) : 0;
        const { error } = await supabase
          .from('hero_slides')
          .insert({
            title: data.title,
            subtitle: data.subtitle || null,
            description: data.description || null,
            cta_primary_text: data.cta_primary_text || null,
            cta_primary_url: data.cta_primary_url || null,
            cta_secondary_text: data.cta_secondary_text || null,
            cta_secondary_url: data.cta_secondary_url || null,
            image_url: data.image_url || null,
            is_active: data.is_active,
            autoplay_duration: data.autoplay_duration || 6000,
            display_order: maxOrder + 1,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hero_slides_admin'] });
      queryClient.invalidateQueries({ queryKey: ['hero_slides'] });
      setIsDialogOpen(false);
      toast({ title: 'Slide guardado correctamente' });
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('hero_slides').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hero_slides_admin'] });
      queryClient.invalidateQueries({ queryKey: ['hero_slides'] });
      toast({ title: 'Slide eliminado' });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from('hero_slides').update({ is_active }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hero_slides_admin'] });
      queryClient.invalidateQueries({ queryKey: ['hero_slides'] });
    },
  });

  const reorderMutation = useMutation({
    mutationFn: async (reordered: { id: string; display_order: number }[]) => {
      for (const item of reordered) {
        const { error } = await supabase
          .from('hero_slides')
          .update({ display_order: item.display_order })
          .eq('id', item.id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hero_slides_admin'] });
      queryClient.invalidateQueries({ queryKey: ['hero_slides'] });
    },
  });

  const handleUploadImage = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Solo imágenes', variant: 'destructive' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'Máximo 5MB', variant: 'destructive' });
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const fileName = `hero_${Date.now()}.${ext}`;
      const { data, error } = await supabase.storage
        .from('hero-images')
        .upload(fileName, file);
      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('hero-images')
        .getPublicUrl(data.path);

      setFormData(prev => ({ ...prev, image_url: urlData.publicUrl }));
      toast({ title: 'Imagen subida correctamente' });
    } catch (err: any) {
      toast({ title: 'Error subiendo imagen', description: err.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(slides);
    const [reordered] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reordered);
    const updates = items.map((item, i) => ({ id: item.id, display_order: i + 1 }));
    reorderMutation.mutate(updates);
  };

  const openEdit = (slide: HeroSlide) => {
    setEditingSlide(slide);
    setIsNew(false);
    setFormData({
      title: slide.title,
      subtitle: slide.subtitle || '',
      description: slide.description || '',
      cta_primary_text: slide.cta_primary_text || '',
      cta_primary_url: slide.cta_primary_url || '',
      cta_secondary_text: slide.cta_secondary_text || '',
      cta_secondary_url: slide.cta_secondary_url || '',
      image_url: slide.image_url || '',
      is_active: slide.is_active,
      autoplay_duration: slide.autoplay_duration || 6000,
    });
    setIsDialogOpen(true);
  };

  const openNew = () => {
    setEditingSlide(null);
    setIsNew(true);
    setFormData(emptySlide);
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.title.trim()) {
      toast({ title: 'El título es obligatorio', variant: 'destructive' });
      return;
    }
    saveMutation.mutate({ ...formData, id: editingSlide?.id });
  };

  if (isLoading) return <div className="p-6">Cargando slides...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Hero Slides</h2>
          <p className="text-muted-foreground text-sm">Gestiona las imágenes y textos del hero de la home</p>
        </div>
        <Button onClick={openNew} className="gap-2">
          <Plus className="h-4 w-4" /> Nuevo Slide
        </Button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="hero-slides">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-3">
              {slides.map((slide, index) => (
                <Draggable key={slide.id} draggableId={slide.id} index={index}>
                  {(provided, snapshot) => (
                    <Card
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`transition-shadow ${snapshot.isDragging ? 'shadow-lg' : ''} ${!slide.is_active ? 'opacity-50' : ''}`}
                    >
                      <CardContent className="flex items-center gap-4 p-4">
                        <div {...provided.dragHandleProps} className="cursor-grab">
                          <GripVertical className="h-5 w-5 text-muted-foreground" />
                        </div>

                        {/* Image preview */}
                        <div className="w-24 h-16 rounded overflow-hidden bg-muted flex-shrink-0 flex items-center justify-center">
                          {slide.image_url ? (
                            <img src={slide.image_url} alt={slide.title} className="w-full h-full object-cover" />
                          ) : (
                            <Image className="h-6 w-6 text-muted-foreground" />
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{slide.title.replace(/\n/g, ' ')}</p>
                          <p className="text-sm text-muted-foreground truncate">{slide.subtitle || slide.description}</p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={slide.is_active}
                            onCheckedChange={(checked) =>
                              toggleActiveMutation.mutate({ id: slide.id, is_active: checked })
                            }
                          />
                          <Button variant="ghost" size="icon" onClick={() => openEdit(slide)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (confirm('¿Eliminar este slide?')) deleteMutation.mutate(slide.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {slides.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Image className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No hay slides configurados. Se mostrarán las imágenes por defecto.</p>
            <Button onClick={openNew} variant="outline" className="mt-4 gap-2">
              <Plus className="h-4 w-4" /> Crear primer slide
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Edit/Create Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isNew ? 'Nuevo Slide' : 'Editar Slide'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Título *</Label>
              <Textarea
                value={formData.title}
                onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))}
                placeholder="Especialistas en\ncompraventa de empresas"
                rows={2}
              />
              <p className="text-xs text-muted-foreground mt-1">Usa \n para saltos de línea</p>
            </div>

            <div>
              <Label>Subtítulo</Label>
              <Textarea
                value={formData.subtitle}
                onChange={(e) => setFormData(p => ({ ...p, subtitle: e.target.value }))}
                rows={2}
              />
            </div>

            <div>
              <Label>Imagen</Label>
              {formData.image_url && (
                <img src={formData.image_url} alt="Preview" className="w-full h-32 object-cover rounded mb-2" />
              )}
              <div className="flex gap-2">
                <Input
                  value={formData.image_url}
                  onChange={(e) => setFormData(p => ({ ...p, image_url: e.target.value }))}
                  placeholder="URL de la imagen o sube una"
                  className="flex-1"
                />
                <label className="cursor-pointer">
                  <Button variant="outline" size="icon" asChild disabled={uploading}>
                    <span>
                      <Upload className="h-4 w-4" />
                    </span>
                  </Button>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleUploadImage(e.target.files[0])}
                  />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>CTA Primario - Texto</Label>
                <Input
                  value={formData.cta_primary_text}
                  onChange={(e) => setFormData(p => ({ ...p, cta_primary_text: e.target.value }))}
                />
              </div>
              <div>
                <Label>CTA Primario - URL</Label>
                <Input
                  value={formData.cta_primary_url}
                  onChange={(e) => setFormData(p => ({ ...p, cta_primary_url: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>CTA Secundario - Texto</Label>
                <Input
                  value={formData.cta_secondary_text}
                  onChange={(e) => setFormData(p => ({ ...p, cta_secondary_text: e.target.value }))}
                />
              </div>
              <div>
                <Label>CTA Secundario - URL</Label>
                <Input
                  value={formData.cta_secondary_url}
                  onChange={(e) => setFormData(p => ({ ...p, cta_secondary_url: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Duración autoplay (ms)</Label>
                <Input
                  type="number"
                  value={formData.autoplay_duration}
                  onChange={(e) => setFormData(p => ({ ...p, autoplay_duration: parseInt(e.target.value) || 6000 }))}
                />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(p => ({ ...p, is_active: checked }))}
                />
                <Label>Activo</Label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleSave} disabled={saveMutation.isPending}>
                {saveMutation.isPending ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HeroSlidesManager;
