import React from 'react';
import { Star, BadgeCheck } from 'lucide-react';

const testimonials = [
  {
    quote: 'Tras 30 años en mi empresa, temía que la venta fuera fría e impersonal. Capittal encontró un comprador que genuinamente quería continuar mi legado.',
    author: 'Carlos M.',
    sector: 'Sector Industrial',
    operationType: 'Venta 100%',
    rating: 5,
  },
  {
    quote: 'Pensaba que nadie pagaría lo que mi empresa valía realmente. El proceso competitivo que gestionaron consiguió un 25% más de lo que esperaba.',
    author: 'María L.',
    sector: 'Sector Servicios',
    operationType: 'Venta mayoritaria',
    rating: 5,
  },
  {
    quote: 'La confidencialidad fue perfecta. Ni empleados ni proveedores supieron nada hasta el cierre. Eso para mí era fundamental.',
    author: 'Javier R.',
    sector: 'Sector Retail',
    operationType: 'Venta a fondo',
    rating: 5,
  },
  {
    quote: 'Me acompañaron en cada paso, desde la valoración hasta la firma notarial. Profesionales de verdad que entienden lo que significa vender tu empresa.',
    author: 'Ana P.',
    sector: 'Sector Tecnología',
    operationType: 'Venta a estratégico',
    rating: 5,
  },
];

const HubVentaTestimonials: React.FC = () => {
  return (
    <section className="py-20 md:py-28 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="font-mono text-xs font-light uppercase tracking-widest text-slate-500 mb-4">
            Testimonios
          </p>
          <h2 className="text-3xl md:text-4xl font-normal text-slate-900">
            Lo Que Dicen Nuestros Clientes
          </h2>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-8 border border-slate-200 hover:shadow-lg transition-shadow"
            >
              {/* Rating */}
              <div className="flex items-center gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>

              {/* Quote */}
              <blockquote className="text-lg text-slate-700 leading-relaxed mb-6">
                "{testimonial.quote}"
              </blockquote>

              {/* Author */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-slate-900">{testimonial.author}</span>
                    <BadgeCheck className="h-4 w-4 text-blue-500" />
                  </div>
                  <div className="text-sm text-slate-500">{testimonial.sector}</div>
                </div>
                <div className="px-3 py-1 bg-slate-100 rounded-full text-xs text-slate-600">
                  {testimonial.operationType}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Note */}
        <p className="text-center text-sm text-slate-500 mt-8">
          * Testimonios reales de clientes. Nombres modificados por confidencialidad.
        </p>
      </div>
    </section>
  );
};

export default HubVentaTestimonials;
