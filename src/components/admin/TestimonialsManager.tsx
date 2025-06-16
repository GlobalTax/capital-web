
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Star, Eye, EyeOff } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useForm } from 'react-hook-form';

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
  is_featured: boolean;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

const TestimonialsManager = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm({
    defaultValues: {
      client_name: '',
      client_company: '',
      client_position: '',
      testimonial_text: '',
      client_photo_url: '',
      rating: 5,
      sector: '',
      project_type: '',
      is_featured: false,
      is_active: true,
      display_order: 0,
    },
  });

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

      if (error) {
        console.error('Error fetching testimonials:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los testimonios.",
          variant: "destructive",
        });
        return;
      }

      setTestimonials(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingTestimonial) {
        const { error } = await supabase
          .from('testimonials')
          .update(values)
          .eq('id', editingTestimonial.id);

        if (error) {
          console.error('Error updating testimonial:', error);
          toast({
            title: "Error",
            description: "No se pudo actualizar el testimonio.",
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Éxito",
          description: "Testimonio actualizado correctamente.",
        });
      } else {
        const { error } = await supabase
          .from('testimonials')
          .insert([values]);

        if (error) {
          console.error('Error creating testimonial:', error);
          toast({
            title: "Error",
            description: "No se pudo crear el testimonio.",
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Éxito",
          description: "Testimonio creado correctamente.",
        });
      }

      setIsDialogOpen(false);
      setEditingTestimonial(null);
      form.reset();
      fetchTestimonials();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleEdit = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    form.reset(testimonial);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este testimonio?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('testimonials')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting testimonial:', error);
        toast({
          title: "Error",
          description: "No se pudo eliminar el testimonio.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Éxito",
        description: "Testimonio eliminado correctamente.",
      });
      fetchTestimonials();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const toggleFeatured = async (testimonial: Testimonial) => {
    try {
      const { error } = await supabase
        .from('testimonials')
        .update({ is_featured: !testimonial.is_featured })
        .eq('id', testimonial.id);

      if (error) {
        console.error('Error updating featured status:', error);
        return;
      }

      fetchTestimonials();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const toggleActive = async (testimonial: Testimonial) => {
    try {
      const { error } = await supabase
        .from('testimonials')
        .update({ is_active: !testimonial.is_active })
        .eq('id', testimonial.id);

      if (error) {
        console.error('Error updating active status:', error);
        return;
      }

      fetchTestimonials();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const openCreateDialog = () => {
    setEditingTestimonial(null);
    form.reset({
      client_name: '',
      client_company: '',
      client_position: '',
      testimonial_text: '',
      client_photo_url: '',
      rating: 5,
      sector: '',
      project_type: '',
      is_featured: false,
      is_active: true,
      display_order: 0,
    });
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-black">Gestión de Testimonios</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={openCreateDialog}
              className="bg-white text-black border border-gray-300 rounded-lg hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Testimonio
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingTestimonial ? 'Editar Testimonio' : 'Nuevo Testimonio'}
              </DialogTitle>
              <DialogDescription>
                {editingTestimonial 
                  ? 'Modifica los datos del testimonio existente.'
                  : 'Añade un nuevo testimonio de cliente.'
                }
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="client_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre del Cliente</FormLabel>
                        <FormControl>
                          <Input {...field} required />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="client_company"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Empresa</FormLabel>
                        <FormControl>
                          <Input {...field} required />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="client_position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cargo/Posición</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="testimonial_text"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Testimonio</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={4} required />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="sector"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sector</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="project_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Proyecto</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="venta">Venta</SelectItem>
                            <SelectItem value="valoración">Valoración</SelectItem>
                            <SelectItem value="fusión">Fusión</SelectItem>
                            <SelectItem value="adquisición">Adquisición</SelectItem>
                            <SelectItem value="reestructuración">Reestructuración</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="rating"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Puntuación (1-5)</FormLabel>
                        <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={field.value?.toString()}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="5">5 estrellas</SelectItem>
                            <SelectItem value="4">4 estrellas</SelectItem>
                            <SelectItem value="3">3 estrellas</SelectItem>
                            <SelectItem value="2">2 estrellas</SelectItem>
                            <SelectItem value="1">1 estrella</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="display_order"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Orden</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="client_photo_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL Foto</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="https://..." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex items-center space-x-4">
                  <FormField
                    control={form.control}
                    name="is_featured"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="rounded"
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal">
                          Destacado
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="is_active"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="rounded"
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal">
                          Activo
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingTestimonial ? 'Actualizar' : 'Crear'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {testimonials.map((testimonial) => (
          <Card key={testimonial.id} className="bg-white border border-gray-300 rounded-lg shadow-sm">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{testimonial.client_name}</CardTitle>
                  <p className="text-gray-600">
                    {testimonial.client_position} en {testimonial.client_company}
                  </p>
                  <div className="flex items-center space-x-2 mt-2">
                    <div className="flex">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">({testimonial.rating}/5)</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleFeatured(testimonial)}
                    className={testimonial.is_featured ? 'bg-yellow-50 border-yellow-300' : ''}
                  >
                    <Star className={`w-4 h-4 ${testimonial.is_featured ? 'text-yellow-500 fill-current' : 'text-gray-400'}`} />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleActive(testimonial)}
                    className={testimonial.is_active ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-300'}
                  >
                    {testimonial.is_active ? (
                      <Eye className="w-4 h-4 text-green-600" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(testimonial)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(testimonial.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-3">"{testimonial.testimonial_text}"</p>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Sector: {testimonial.sector || 'No especificado'}</span>
                <span>Proyecto: {testimonial.project_type || 'No especificado'}</span>
                <span>Orden: {testimonial.display_order}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {testimonials.length === 0 && (
        <Card className="bg-white border border-gray-300 rounded-lg text-center p-8">
          <CardContent>
            <p className="text-gray-500">No hay testimonios creados aún.</p>
            <Button 
              onClick={openCreateDialog}
              className="mt-4"
            >
              Crear primer testimonio
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TestimonialsManager;
