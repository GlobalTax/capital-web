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
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-black text-white rounded-lg text-sm font-medium mb-6">
            Casos de Éxito
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">
            Lo Que Dicen Nuestros Clientes
          </h2>
          
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Testimonios reales de empresarios que confiaron en nosotros para maximizar 
            el valor de sus empresas.
          </p>
        </div>

        {/* Testimonials grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index} 
              className="bg-white border-0.5 border-border rounded-lg p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out group"
            >
              <div className="mb-6">
                <p className="text-gray-700 leading-relaxed italic text-lg">
                  "{testimonial.quote}"
                </p>
              </div>
              
              <div className="border-t border-border pt-4">
                <div className="text-sm font-bold text-black mb-1">
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