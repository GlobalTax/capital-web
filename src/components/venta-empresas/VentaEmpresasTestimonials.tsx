import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Quote, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useVentaTestimonials } from '@/hooks/useVentaEmpresasContent';

const VentaEmpresasTestimonials = () => {
  const { data: testimonials, isLoading } = useVentaTestimonials();

  if (isLoading) {
    return (
      <section className="py-20 bg-gradient-to-b from-background to-secondary/5">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </section>
    );
  }

  if (!testimonials || testimonials.length === 0) {
    return null;
  }
  return (
    <section className="py-20 bg-gradient-to-b from-background to-secondary/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <Star className="h-4 w-4 fill-current" />
            +200 Operaciones Exitosas
          </div>
          <h2 className="text-4xl font-bold mb-4">
            Lo Que Dicen Nuestros Clientes
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Empresarios como tú que han confiado en Capittal para vender sus empresas
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {testimonial.avatar_initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h4 className="font-semibold">{testimonial.name}</h4>
                    <p className="text-sm text-muted-foreground">{testimonial.position}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.sector}</p>
                  </div>
                  <Quote className="h-6 w-6 text-primary/20" />
                </div>

                <div className="flex gap-1 mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                <p className="text-sm text-muted-foreground mb-4 line-clamp-4">
                  "{testimonial.quote}"
                </p>

                <div className="border-t pt-4 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-lg font-bold text-primary">{testimonial.price_increase}</div>
                    <div className="text-xs text-muted-foreground">Sobre precio esperado</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-primary">{testimonial.time_to_sale}</div>
                    <div className="text-xs text-muted-foreground">Tiempo de venta</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-primary">{testimonial.valuation}</div>
                    <div className="text-xs text-muted-foreground">Valoración final</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground">
            <strong className="text-foreground">Valoración promedio: 4.9/5</strong> basada en +200 operaciones completadas
          </p>
        </div>
      </div>
    </section>
  );
};

export default VentaEmpresasTestimonials;
