import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Quote } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const testimonials = [
  {
    id: 1,
    name: 'Carlos M.',
    position: 'CEO',
    company: 'Empresa Tecnológica',
    sector: 'SaaS',
    avatar: 'CM',
    rating: 5,
    quote: 'Capittal superó nuestras expectativas. No solo conseguimos un precio un 35% superior al que esperábamos, sino que el proceso fue completamente confidencial y profesional. Su equipo nos acompañó en cada paso.',
    metrics: {
      priceIncrease: '+35%',
      timeToSale: '6 meses',
      valuation: '€2.8M'
    }
  },
  {
    id: 2,
    name: 'María L.',
    position: 'Fundadora',
    company: 'Distribuidora Regional',
    sector: 'Distribución',
    avatar: 'ML',
    rating: 5,
    quote: 'Después de 25 años al frente de la empresa, Capittal me ayudó a conseguir la mejor operación posible. Su red de compradores cualificados y su experiencia en negociación fueron clave para cerrar la operación en tiempo récord.',
    metrics: {
      priceIncrease: '+28%',
      timeToSale: '4 meses',
      valuation: '€4.2M'
    }
  },
  {
    id: 3,
    name: 'Javier R.',
    position: 'Socio Fundador',
    company: 'Consultoría Especializada',
    sector: 'Servicios Profesionales',
    avatar: 'JR',
    rating: 5,
    quote: 'La valoración inicial fue precisa y realista. Durante todo el proceso, Capittal nos mantuvo informados y manejó las negociaciones de forma experta. El resultado final superó nuestras expectativas iniciales.',
    metrics: {
      priceIncrease: '+42%',
      timeToSale: '7 meses',
      valuation: '€1.5M'
    }
  },
  {
    id: 4,
    name: 'Ana G.',
    position: 'Directora General',
    company: 'Empresa Industrial',
    sector: 'Manufactura',
    avatar: 'AG',
    rating: 5,
    quote: 'Tenía dudas sobre el proceso de venta, pero Capittal hizo que todo fuera transparente y sencillo. Su equipo es muy profesional y me sentí acompañada en todo momento. Recomiendo 100% sus servicios.',
    metrics: {
      priceIncrease: '+31%',
      timeToSale: '8 meses',
      valuation: '€3.6M'
    }
  },
  {
    id: 5,
    name: 'Roberto S.',
    position: 'Co-fundador',
    company: 'E-commerce Retail',
    sector: 'Comercio Electrónico',
    avatar: 'RS',
    rating: 5,
    quote: 'La experiencia con Capittal fue excepcional. Desde el primer día demostraron un conocimiento profundo de nuestro sector. Consiguieron múltiples ofertas competitivas que elevaron el precio final significativamente.',
    metrics: {
      priceIncrease: '+48%',
      timeToSale: '5 meses',
      valuation: '€2.1M'
    }
  },
  {
    id: 6,
    name: 'Laura P.',
    position: 'CEO',
    company: 'Empresa de Servicios',
    sector: 'Consultoría',
    avatar: 'LP',
    rating: 5,
    quote: 'Capittal nos ayudó a estructurar la operación de forma óptima desde el punto de vista fiscal. Su red de contactos nos permitió acceder a compradores que no habríamos encontrado por nuestra cuenta.',
    metrics: {
      priceIncrease: '+39%',
      timeToSale: '6 meses',
      valuation: '€1.9M'
    }
  }
];

const VentaEmpresasTestimonials = () => {
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
                      {testimonial.avatar}
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
                    <div className="text-lg font-bold text-primary">{testimonial.metrics.priceIncrease}</div>
                    <div className="text-xs text-muted-foreground">Sobre precio esperado</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-primary">{testimonial.metrics.timeToSale}</div>
                    <div className="text-xs text-muted-foreground">Tiempo de venta</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-primary">{testimonial.metrics.valuation}</div>
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
