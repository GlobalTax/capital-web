import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useHeroSlidesAdmin, HeroSlide } from '@/hooks/useHeroSlides';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, MoveUp, MoveDown, Eye } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const HeroSlidesManager = () => {
  const { slides, isLoading, createSlide, updateSlide, deleteSlide, reorderSlides } = useHeroSlidesAdmin();
  const { toast } = useToast();
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    cta_primary_text: '',
    cta_primary_url: '',
    cta_secondary_text: '',
    cta_secondary_url: '',
    image_url: '',
    background_color: '#ffffff',
    text_color: '#000000',
    is_active: true,
    autoplay_duration: 5000,
  });

  const resetForm = () => {
    setFormData({
      title: '',
      subtitle: '',
      description: '',
      cta_primary_text: '',
      cta_primary_url: '',
      cta_secondary_text: '',
      cta_secondary_url: '',
      image_url: '',
      background_color: '#ffffff',
      text_color: '#000000',
      is_active: true,
      autoplay_duration: 5000,
    });
    setEditingSlide(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const slideData = {
        ...formData,
        display_order: editingSlide ? editingSlide.display_order : slides.length + 1,
      };

      if (editingSlide) {
        await updateSlide(editingSlide.id, slideData);
        toast({
          title: "Slide actualizado",
          description: "El slide se ha actualizado correctamente.",
        });
      } else {
        await createSlide(slideData);
        toast({
          title: "Slide creado",
          description: "El slide se ha creado correctamente.",
        });
      }
      
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar el slide.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (slide: HeroSlide) => {
    setEditingSlide(slide);
    setFormData({
      title: slide.title,
      subtitle: slide.subtitle || '',
      description: slide.description || '',
      cta_primary_text: slide.cta_primary_text || '',
      cta_primary_url: slide.cta_primary_url || '',
      cta_secondary_text: slide.cta_secondary_text || '',
      cta_secondary_url: slide.cta_secondary_url || '',
      image_url: slide.image_url || '',
      background_color: slide.background_color || '#ffffff',
      text_color: slide.text_color || '#000000',
      is_active: slide.is_active,
      autoplay_duration: slide.autoplay_duration || 5000,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este slide?')) {
      try {
        await deleteSlide(id);
        toast({
          title: "Slide eliminado",
          description: "El slide se ha eliminado correctamente.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo eliminar el slide.",
          variant: "destructive",
        });
      }
    }
  };

  const handleReorder = async (slideId: string, direction: 'up' | 'down') => {
    const slideIndex = slides.findIndex(s => s.id === slideId);
    if (slideIndex === -1) return;

    const newSlides = [...slides];
    const targetIndex = direction === 'up' ? slideIndex - 1 : slideIndex + 1;
    
    if (targetIndex < 0 || targetIndex >= slides.length) return;

    // Swap display orders
    [newSlides[slideIndex], newSlides[targetIndex]] = [newSlides[targetIndex], newSlides[slideIndex]];
    
    const reorderData = newSlides.map((slide, index) => ({
      id: slide.id,
      display_order: index + 1
    }));

    try {
      await reorderSlides(reorderData);
      toast({
        title: "Orden actualizado",
        description: "El orden de los slides se ha actualizado.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el orden.",
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async (slide: HeroSlide) => {
    try {
      await updateSlide(slide.id, { is_active: !slide.is_active });
      toast({
        title: slide.is_active ? "Slide desactivado" : "Slide activado",
        description: `El slide se ha ${slide.is_active ? 'desactivado' : 'activado'} correctamente.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo cambiar el estado del slide.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestión de Hero Slider</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Slide
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingSlide ? 'Editar Slide' : 'Nuevo Slide'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="subtitle">Subtítulo</Label>
                  <Input
                    id="subtitle"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cta_primary_text">Texto Botón Primario</Label>
                  <Input
                    id="cta_primary_text"
                    value={formData.cta_primary_text}
                    onChange={(e) => setFormData({ ...formData, cta_primary_text: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="cta_primary_url">URL Botón Primario</Label>
                  <Input
                    id="cta_primary_url"
                    value={formData.cta_primary_url}
                    onChange={(e) => setFormData({ ...formData, cta_primary_url: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cta_secondary_text">Texto Botón Secundario</Label>
                  <Input
                    id="cta_secondary_text"
                    value={formData.cta_secondary_text}
                    onChange={(e) => setFormData({ ...formData, cta_secondary_text: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="cta_secondary_url">URL Botón Secundario</Label>
                  <Input
                    id="cta_secondary_url"
                    value={formData.cta_secondary_url}
                    onChange={(e) => setFormData({ ...formData, cta_secondary_url: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="image_url">URL de Imagen</Label>
                <Input
                  id="image_url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="autoplay_duration">Duración Autoplay (ms)</Label>
                  <Input
                    id="autoplay_duration"
                    type="number"
                    value={formData.autoplay_duration}
                    onChange={(e) => setFormData({ ...formData, autoplay_duration: parseInt(e.target.value) })}
                  />
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label htmlFor="is_active">Activo</Label>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingSlide ? 'Actualizar' : 'Crear'} Slide
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {slides.map((slide, index) => (
          <Card key={slide.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CardTitle className="text-lg">{slide.title}</CardTitle>
                  <Badge variant={slide.is_active ? "default" : "secondary"}>
                    {slide.is_active ? "Activo" : "Inactivo"}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Orden: {slide.display_order}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleReorder(slide.id, 'up')}
                    disabled={index === 0}
                  >
                    <MoveUp className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleReorder(slide.id, 'down')}
                    disabled={index === slides.length - 1}
                  >
                    <MoveDown className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleActive(slide)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(slide)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(slide.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <strong>Subtítulo:</strong> {slide.subtitle || 'N/A'}
                </div>
                <div>
                  <strong>Botón Primario:</strong> {slide.cta_primary_text || 'N/A'}
                </div>
                <div>
                  <strong>Botón Secundario:</strong> {slide.cta_secondary_text || 'N/A'}
                </div>
              </div>
              {slide.description && (
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                  {slide.description}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {slides.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <p className="text-muted-foreground mb-4">No hay slides configurados</p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Crear Primer Slide
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default HeroSlidesManager;