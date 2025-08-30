import React from 'react';

const MinimalistTestimonials = () => {
  const testimonials = [
    {
      quote: "Capittal nos ayudó a conseguir una valoración 45% superior a la oferta inicial. Su conocimiento del mercado fue determinante.",
      author: "CEO, Empresa Tecnológica",
      transaction: "€12M - Sector TI"
    },
    {
      quote: "El proceso fue impecable. En 7 meses cerramos la operación con el comprador ideal. Su red de contactos es excepcional.",
      author: "Fundador, Empresa Industrial",
      transaction: "€28M - Sector Industrial"
    },
    {
      quote: "Profesionalidad absoluta. Nos guiaron en cada paso y el resultado superó nuestras expectativas más optimistas.",
      author: "Accionista Principal",
      transaction: "€35M - Sector Servicios"
    }
  ];

  return (
    <section className="py-24 bg-white border-t border-gray-200">
      <div className="max-w-4xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="text-center">
              <div className="mb-8">
                <p className="text-black leading-relaxed italic">
                  "{testimonial.quote}"
                </p>
              </div>
              
              <div className="border-t border-gray-200 pt-6">
                <div className="text-sm font-medium text-black mb-1">
                  {testimonial.author}
                </div>
                <div className="text-sm text-gray-600">
                  {testimonial.transaction}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MinimalistTestimonials;