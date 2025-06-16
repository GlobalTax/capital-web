import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import TestimonialPreview from './preview/TestimonialPreview';
import SectorSelect from './shared/SectorSelect';

interface Testimonial {
  id: string;
  client_name: string;
  client_company: string;
  client_position?: string;
  testimonial_text: string;
  client_photo_url?: string;
  rating: number;
  sector?: string;
  project_type?: string;
  display_order: number;
  is_featured: boolean;
  is_active: boolean;
  display_locations?: string[];
}

const availableLocations = [
  { value: 'home', label: 'Página Principal' },
  { value: 'testimonios', label: 'Testimonios' },
  { value: 'nosotros', label: 'Nosotros' },
  { value: 'servicios', label: 'Servicios' },
  { value: 'venta-empresas', label: 'Venta de Empresas' },
  { value: 'compra-empresas', label: 'Compra de Empresas' }
];

const TestimonialsManager = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  const emptyTestimonial: Omit<Testimonial, 'id'> = {
    client_name: '',
    client_company: '',
    client_position: '',
    testimonial_text: '',
    client_photo_url: '',
    rating: 5,
    sector: '',
    project_type: '',
    display_order: 0,
    is_featured: false,
    is_active: true,
    display_locations: ['home', 'testimonios']
  };

  const [formData, setFormData] = useState(emptyTestimonial);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .order('display_order')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTestimonials(data || []);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los testimonios.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Si no hay ubicaciones seleccionadas, marcar como inactivo (borrador)
    const isDraft = !formData.display_locations || formData.display_locations.length === 0;
    const dataToSubmit = {
      ...formData,
      is_active: !isDraft,
      display_locations: formData.display_locations || []
    };
    
    try {
      if (editingTestimonial) {
        const { error } = await supabase
          .from('testimonials')
          .update(dataToSubmit)
          .eq('id', editingTestimonial.id);
        
        if (error) throw error;
        toast({ 
          title: isDraft ? "Testimonio guardado como borrador" : "Testimonio actualizado correctamente" 
        });
      } else {
        const { error } = await supabase
          .from('testimonials')
          .insert([dataToSubmit]);
        
        if (error) throw error;
        toast({ 
          title: isDraft ? "Testimonio creado como borrador" : "Testimonio creado correctamente" 
        });
      }

      setFormData(emptyTestimonial);
      setEditingTestimonial(null);
      setShowForm(false);
      fetchTestimonials();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    setFormData({
      ...testimonial,
      display_locations: testimonial.display_locations || ['home', 'testimonios']
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este testimonio?')) return;

    try {
      const { error } = await supabase
        .from('testimonials')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: "Testimonio eliminado correctamente" });
      fetchTestimonials();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const toggleStatus = async (id: string, field: 'is_active' | 'is_featured', value: boolean) => {
    try {
      const { error } = await supabase
        .from('testimonials')
        .update({ [field]: value })
        .eq('id', id);

      if (error) throw error;
      fetchTestimonials();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleLocationChange = (location: string, checked: boolean) => {
    const currentLocations = formData.display_locations || [];
    if (checked) {
      setFormData({
        ...formData,
        display_locations: [...currentLocations, location]
      });
    } else {
      setFormData({
        ...formData,
        display_locations: currentLocations.filter(loc => loc !== location)
      });
    }
  };

  if (isLoading) {
    return <div className="p-6">Cargando testimonios...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-black">Gestión de Testimonios</h2>
        <Button
          onClick={() => {
            setFormData(emptyTestimonial);
            setEditingTestimonial(null);
            setShowForm(true);
          }}
          className="bg-black text-white border border-black rounded-lg"
        >
          Nuevo Testimonio
        </Button>
      </div>

      {showForm && (
        <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-bold text-black mb-4">
            {editingTestimonial ? 'Editar Testimonio' : 'Nuevo Testimonio'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">Nombre del Cliente</label>
                <Input
                  value={formData.client_name}
                  onChange={(e) => setFormData({...formData, client_name: e.target.value})}
                  className="border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-2">Empresa del Cliente</label>
                <Input
                  value={formData.client_company}
                  onChange={(e) => setFormData({...formData, client_company: e.target.value})}
                  className="border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-2">Posición del Cliente</label>
                <Input
                  value={formData.client_position || ''}
                  onChange={(e) => setFormData({...formData, client_position: e.target.value})}
                  className="border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-2">URL de la Foto del Cliente</label>
                <Input
                  type="url"
                  value={formData.client_photo_url || ''}
                  onChange={(e) => setFormData({...formData, client_photo_url: e.target.value})}
                  className="border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-2">Sector</label>
                <SectorSelect
                  value={formData.sector || ''}
                  onChange={(value) => setFormData({...formData, sector: value})}
                  placeholder="Selecciona un sector (opcional)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-2">Tipo de Proyecto</label>
                <Input
                  value={formData.project_type || ''}
                  onChange={(e) => setFormData({...formData, project_type: e.target.value})}
                  className="border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-2">Orden de Visualización</label>
                <Input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({...formData, display_order: parseInt(e.target.value)})}
                  className="border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-2">Rating</label>
                <Input
                  type="number"
                  value={formData.rating}
                  onChange={(e) => setFormData({...formData, rating: parseInt(e.target.value)})}
                  className="border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-2">Testimonio</label>
              <Textarea
                value={formData.testimonial_text}
                onChange={(e) => setFormData({...formData, testimonial_text: e.target.value})}
                className="border border-gray-300 rounded-lg"
                rows={4}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Ubicaciones donde mostrar
                <span className="text-sm text-gray-500 ml-2">(Si no seleccionas ninguna, se guardará como borrador)</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {availableLocations.map((location) => (
                  <label key={location.value} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.display_locations?.includes(location.value) || false}
                      onChange={(e) => handleLocationChange(location.value, e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700">{location.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData({...formData, is_featured: e.target.checked})}
                  className="mr-2"
                />
                Destacado
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                  className="mr-2"
                />
                Activo
              </label>
            </div>

            <div className="flex space-x-4">
              <Button
                type="submit"
                className="bg-black text-white border border-black rounded-lg"
              >
                {editingTestimonial ? 'Actualizar' : 'Crear'}
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="border border-gray-300 rounded-lg"
                  >
                    Previsualizar
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Previsualización</DialogTitle>
                  </DialogHeader>
                  <TestimonialPreview testimonial={formData} />
                </DialogContent>
              </Dialog>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setEditingTestimonial(null);
                  setFormData(emptyTestimonial);
                }}
                className="border border-gray-300 rounded-lg"
              >
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {testimonials.map((testimonial) => (
          <div key={testimonial.id} className="bg-white border border-gray-300 rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-4 mb-2">
                  {testimonial.client_photo_url && (
                    <img
                      src={testimonial.client_photo_url}
                      alt={`Foto de ${testimonial.client_name}`}
                      className="w-12 h-12 object-cover rounded-full"
                    />
                  )}
                  <div>
                    <h3 className="text-lg font-bold text-black">{testimonial.client_name}</h3>
                    <div className="text-sm text-gray-600">
                      {testimonial.client_position && <span>{testimonial.client_position} en </span>}
                      {testimonial.client_company}
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      {!testimonial.is_active && (
                        <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                          Borrador
                        </span>
                      )}
                      {(!testimonial.display_locations || testimonial.display_locations.length === 0) && (
                        <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                          Sin ubicaciones
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 mb-2">{testimonial.testimonial_text}</p>
                <div className="text-sm text-gray-500 mb-2">
                  {testimonial.sector && <span className="mr-2">Sector: {testimonial.sector}</span>}
                  {testimonial.project_type && <span>Tipo: {testimonial.project_type}</span>}
                  <span>Orden: {testimonial.display_order}</span>
                </div>
                <div className="mb-2">
                  <span className="text-sm font-medium text-gray-700">Ubicaciones: </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(testimonial.display_locations || []).map((location) => {
                      const locationLabel = availableLocations.find(loc => loc.value === location)?.label || location;
                      return (
                        <span key={location} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                          {locationLabel}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(testimonial)}
                  className="border border-gray-300 rounded-lg"
                >
                  Editar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(testimonial.id)}
                  className="border border-red-300 text-red-600 rounded-lg"
                >
                  Eliminar
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestimonialsManager;
