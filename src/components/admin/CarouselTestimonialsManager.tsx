import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Trash2, Plus, Edit, Save, X, MoveUp, MoveDown } from 'lucide-react';
import ImageUploadField from './ImageUploadField';

interface CarouselTestimonial {
  id: string;
  quote: string;
  client_name: string;
  client_company: string;
  logo_url: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const CarouselTestimonialsManager = () => {
  const [testimonials, setTestimonials] = useState<CarouselTestimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<CarouselTestimonial>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTestimonial, setNewTestimonial] = useState<Partial<CarouselTestimonial>>({
    quote: '',
    client_name: '',
    client_company: '',
    logo_url: '',
    display_order: 0,
    is_active: true
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const { data, error } = await supabase
        .from('carousel_testimonials')
        .select('*')
        .order('display_order');

      if (error) throw error;
      setTestimonials(data || []);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      toast({
        title: "Error",
        description: "Error al cargar los testimoniales del carrusel.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newTestimonial.quote?.trim() || !newTestimonial.client_name?.trim() || !newTestimonial.client_company?.trim()) {
      toast({
        title: "Error",
        description: "Todos los campos son obligatorios.",
        variant: "destructive",
      });
      return;
    }

    try {
      const testimonialToInsert = {
        quote: newTestimonial.quote,
        client_name: newTestimonial.client_name,
        client_company: newTestimonial.client_company,
        logo_url: newTestimonial.logo_url || null,
        display_order: newTestimonial.display_order || 0,
        is_active: newTestimonial.is_active ?? true
      };

      const { error } = await supabase
        .from('carousel_testimonials')
        .insert(testimonialToInsert);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Testimonial creado correctamente.",
      });
      
      setNewTestimonial({
        quote: '',
        client_name: '',
        client_company: '',
        logo_url: '',
        display_order: 0,
        is_active: true
      });
      setShowAddForm(false);
      fetchTestimonials();
    } catch (error) {
      console.error('Error creating testimonial:', error);
      toast({
        title: "Error",
        description: "Error al crear el testimonial.",
        variant: "destructive",
      });
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      const { error } = await supabase
        .from('carousel_testimonials')
        .update(editForm)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Testimonial actualizado correctamente.",
      });
      
      setEditingId(null);
      setEditForm({});
      fetchTestimonials();
    } catch (error) {
      console.error('Error updating testimonial:', error);
      toast({
        title: "Error",
        description: "Error al actualizar el testimonial.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este testimonial?')) return;

    try {
      const { error } = await supabase
        .from('carousel_testimonials')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Testimonial eliminado correctamente.",
      });
      
      fetchTestimonials();
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      toast({
        title: "Error",
        description: "Error al eliminar el testimonial.",
        variant: "destructive",
      });
    }
  };

  const handleMoveUp = async (testimonial: CarouselTestimonial) => {
    const newOrder = Math.max(1, testimonial.display_order - 1);
    await updateOrder(testimonial.id, newOrder);
  };

  const handleMoveDown = async (testimonial: CarouselTestimonial) => {
    const newOrder = testimonial.display_order + 1;
    await updateOrder(testimonial.id, newOrder);
  };

  const updateOrder = async (id: string, newOrder: number) => {
    try {
      const { error } = await supabase
        .from('carousel_testimonials')
        .update({ display_order: newOrder })
        .eq('id', id);

      if (error) throw error;
      fetchTestimonials();
    } catch (error) {
      console.error('Error updating order:', error);
      toast({
        title: "Error",
        description: "Error al actualizar el orden.",
        variant: "destructive",
      });
    }
  };

  const startEdit = (testimonial: CarouselTestimonial) => {
    setEditingId(testimonial.id);
    setEditForm({ ...testimonial });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-0.5 border-black"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-black">Testimoniales del Carrusel</h2>
        <Button 
          onClick={() => setShowAddForm(true)}
          className="bg-black text-white border-0.5 border-black rounded-lg hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
        >
          <Plus className="w-4 h-4 mr-2" />
          Añadir Testimonial
        </Button>
      </div>

      {showAddForm && (
        <Card className="bg-white border-0.5 border-black rounded-lg shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-black">Nuevo Testimonial</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Testimonial *
              </label>
              <Textarea
                value={newTestimonial.quote || ''}
                onChange={(e) => setNewTestimonial({ ...newTestimonial, quote: e.target.value })}
                className="border-0.5 border-black rounded-lg"
                placeholder="Texto del testimonial"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Nombre del Cliente *
              </label>
              <Input
                value={newTestimonial.client_name || ''}
                onChange={(e) => setNewTestimonial({ ...newTestimonial, client_name: e.target.value })}
                className="border-0.5 border-black rounded-lg"
                placeholder="Nombre del cliente"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Empresa del Cliente *
              </label>
              <Input
                value={newTestimonial.client_company || ''}
                onChange={(e) => setNewTestimonial({ ...newTestimonial, client_company: e.target.value })}
                className="border-0.5 border-black rounded-lg"
                placeholder="Empresa del cliente"
              />
            </div>

            <ImageUploadField
              label="Logo de la Empresa"
              value={newTestimonial.logo_url || ''}
              onChange={(url) => setNewTestimonial({ ...newTestimonial, logo_url: url })}
              placeholder="URL del logo de la empresa"
              folder="logos"
            />

            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Orden de Visualización
              </label>
              <Input
                type="number"
                min="0"
                value={newTestimonial.display_order || 0}
                onChange={(e) => setNewTestimonial({ ...newTestimonial, display_order: parseInt(e.target.value) || 0 })}
                className="border-0.5 border-black rounded-lg"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="newActive"
                checked={newTestimonial.is_active}
                onChange={(e) => setNewTestimonial({ ...newTestimonial, is_active: e.target.checked })}
                className="rounded border-0.5 border-black"
              />
              <label htmlFor="newActive" className="text-sm text-black">
                Activo
              </label>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleCreate}
                className="bg-black text-white border-0.5 border-black rounded-lg hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <Save className="w-4 h-4 mr-2" />
                Guardar
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowAddForm(false)}
                className="border-0.5 border-black rounded-lg hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {testimonials.map((testimonial) => (
          <Card key={testimonial.id} className="bg-white border-0.5 border-black rounded-lg shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <CardContent className="p-6">
              {editingId === testimonial.id ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Testimonial *
                    </label>
                    <Textarea
                      value={editForm.quote || ''}
                      onChange={(e) => setEditForm({ ...editForm, quote: e.target.value })}
                      className="border-0.5 border-black rounded-lg"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Nombre del Cliente *
                    </label>
                    <Input
                      value={editForm.client_name || ''}
                      onChange={(e) => setEditForm({ ...editForm, client_name: e.target.value })}
                      className="border-0.5 border-black rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Empresa del Cliente *
                    </label>
                    <Input
                      value={editForm.client_company || ''}
                      onChange={(e) => setEditForm({ ...editForm, client_company: e.target.value })}
                      className="border-0.5 border-black rounded-lg"
                    />
                  </div>

                  <ImageUploadField
                    label="Logo de la Empresa"
                    value={editForm.logo_url || ''}
                    onChange={(url) => setEditForm({ ...editForm, logo_url: url })}
                    placeholder="URL del logo de la empresa"
                    folder="logos"
                  />

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Orden de Visualización
                    </label>
                    <Input
                      type="number"
                      min="0"
                      value={editForm.display_order || 0}
                      onChange={(e) => setEditForm({ ...editForm, display_order: parseInt(e.target.value) || 0 })}
                      className="border-0.5 border-black rounded-lg"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`active-${testimonial.id}`}
                      checked={editForm.is_active}
                      onChange={(e) => setEditForm({ ...editForm, is_active: e.target.checked })}
                      className="rounded border-0.5 border-black"
                    />
                    <label htmlFor={`active-${testimonial.id}`} className="text-sm text-black">
                      Activo
                    </label>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleUpdate(testimonial.id)}
                      className="bg-black text-white border-0.5 border-black rounded-lg hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Guardar
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={cancelEdit}
                      className="border-0.5 border-black rounded-lg hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    {testimonial.logo_url && (
                      <img 
                        src={testimonial.logo_url} 
                        alt={testimonial.client_company}
                        className="h-12 w-auto object-contain flex-shrink-0"
                      />
                    )}
                    <div className="flex-1">
                      <p className="text-gray-600 italic mb-2">"{testimonial.quote}"</p>
                      <h3 className="text-lg font-bold text-black">{testimonial.client_name}</h3>
                      <p className="text-sm text-gray-600">{testimonial.client_company}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Orden: {testimonial.display_order} | {testimonial.is_active ? 'Activo' : 'Inactivo'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMoveUp(testimonial)}
                      className="border-0.5 border-black rounded-lg hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                    >
                      <MoveUp className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMoveDown(testimonial)}
                      className="border-0.5 border-black rounded-lg hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                    >
                      <MoveDown className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startEdit(testimonial)}
                      className="border-0.5 border-black rounded-lg hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(testimonial.id)}
                      className="text-red-600 border-red-500 hover:bg-red-50 border-0.5 rounded-lg hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {testimonials.length === 0 && (
        <Card className="bg-white border-0.5 border-black rounded-lg shadow-sm">
          <CardContent className="p-8 text-center">
            <p className="text-gray-600">No hay testimoniales configurados aún.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CarouselTestimonialsManager;
