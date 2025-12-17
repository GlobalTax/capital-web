import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useVentaTestimonials, useUpdateVentaTestimonial, useCreateVentaTestimonial } from '@/hooks/useVentaEmpresasContent';
import { Loader2, Save, Edit, Star, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

const TestimonialsManager = () => {
  const { data: testimonials, isLoading } = useVentaTestimonials();
  const updateTestimonial = useUpdateVentaTestimonial();
  const createTestimonial = useCreateVentaTestimonial();
  const [editingTestimonial, setEditingTestimonial] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleEdit = (testimonial: any) => {
    setIsCreating(false);
    setEditingTestimonial({ ...testimonial });
  };

  const handleNew = () => {
    setIsCreating(true);
    setEditingTestimonial({
      name: '',
      position: '',
      company: '',
      sector: '',
      avatar_initials: '',
      rating: 5,
      quote: '',
      price_increase: '',
      time_to_sale: '',
      valuation: '',
      is_active: true,
      display_order: (testimonials?.length || 0) + 1,
    });
  };

  const handleSave = () => {
    if (!editingTestimonial) return;

    if (isCreating) {
      // Generar avatar_initials automáticamente del nombre
      const initials = editingTestimonial.name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

      createTestimonial.mutate({
        name: editingTestimonial.name,
        position: editingTestimonial.position,
        company: editingTestimonial.company,
        sector: editingTestimonial.sector,
        avatar_initials: initials || 'XX',
        rating: editingTestimonial.rating,
        quote: editingTestimonial.quote,
        price_increase: editingTestimonial.price_increase,
        time_to_sale: editingTestimonial.time_to_sale,
        valuation: editingTestimonial.valuation,
        is_active: true,
        display_order: editingTestimonial.display_order,
      });
    } else {
      updateTestimonial.mutate({
        id: editingTestimonial.id,
        data: {
          name: editingTestimonial.name,
          position: editingTestimonial.position,
          company: editingTestimonial.company,
          sector: editingTestimonial.sector,
          rating: editingTestimonial.rating,
          quote: editingTestimonial.quote,
          price_increase: editingTestimonial.price_increase,
          time_to_sale: editingTestimonial.time_to_sale,
          valuation: editingTestimonial.valuation,
        },
      });
    }

    setEditingTestimonial(null);
    setIsCreating(false);
  };

  const handleClose = () => {
    setEditingTestimonial(null);
    setIsCreating(false);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const isPending = isCreating ? createTestimonial.isPending : updateTestimonial.isPending;

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Lo Que Dicen Nuestros Clientes</CardTitle>
          <Button onClick={handleNew}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Testimonio
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {testimonials?.map((testimonial) => (
              <Card key={testimonial.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                          {testimonial.avatar_initials}
                        </div>
                        <div>
                          <h3 className="font-semibold">{testimonial.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {testimonial.position} - {testimonial.company}
                          </p>
                          <p className="text-xs text-muted-foreground">{testimonial.sector}</p>
                        </div>
                      </div>
                      <div className="flex gap-1 mb-2">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">"{testimonial.quote}"</p>
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <span>Incremento: {testimonial.price_increase}</span>
                        <span>Tiempo: {testimonial.time_to_sale}</span>
                        <span>Valoración: {testimonial.valuation}</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleEdit(testimonial)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!editingTestimonial} onOpenChange={handleClose}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isCreating ? 'Nuevo Testimonio' : 'Editar Testimonio'}</DialogTitle>
          </DialogHeader>
          {editingTestimonial && (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Nombre</Label>
                  <Input
                    value={editingTestimonial.name}
                    onChange={(e) =>
                      setEditingTestimonial({ ...editingTestimonial, name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Posición</Label>
                  <Input
                    value={editingTestimonial.position}
                    onChange={(e) =>
                      setEditingTestimonial({ ...editingTestimonial, position: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Empresa</Label>
                  <Input
                    value={editingTestimonial.company}
                    onChange={(e) =>
                      setEditingTestimonial({ ...editingTestimonial, company: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Sector</Label>
                  <Input
                    value={editingTestimonial.sector}
                    onChange={(e) =>
                      setEditingTestimonial({ ...editingTestimonial, sector: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <Label>Rating (1-5)</Label>
                <Input
                  type="number"
                  min={1}
                  max={5}
                  value={editingTestimonial.rating}
                  onChange={(e) =>
                    setEditingTestimonial({ ...editingTestimonial, rating: parseInt(e.target.value) || 5 })
                  }
                />
              </div>

              <div>
                <Label>Testimonio</Label>
                <Textarea
                  value={editingTestimonial.quote}
                  onChange={(e) =>
                    setEditingTestimonial({ ...editingTestimonial, quote: e.target.value })
                  }
                  rows={4}
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label>Incremento Precio</Label>
                  <Input
                    value={editingTestimonial.price_increase}
                    onChange={(e) =>
                      setEditingTestimonial({ ...editingTestimonial, price_increase: e.target.value })
                    }
                    placeholder="+35%"
                  />
                </div>
                <div>
                  <Label>Tiempo de Venta</Label>
                  <Input
                    value={editingTestimonial.time_to_sale}
                    onChange={(e) =>
                      setEditingTestimonial({ ...editingTestimonial, time_to_sale: e.target.value })
                    }
                    placeholder="6 meses"
                  />
                </div>
                <div>
                  <Label>Valoración</Label>
                  <Input
                    value={editingTestimonial.valuation}
                    onChange={(e) =>
                      setEditingTestimonial({ ...editingTestimonial, valuation: e.target.value })
                    }
                    placeholder="€2.8M"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleClose}>
                  Cancelar
                </Button>
                <Button onClick={handleSave} disabled={isPending}>
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Save className="h-4 w-4 mr-2" />
                  {isCreating ? 'Crear' : 'Guardar'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TestimonialsManager;
