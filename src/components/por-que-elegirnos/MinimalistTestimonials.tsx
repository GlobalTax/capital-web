import React from 'react';

const MinimalistTestimonials = () => {
  const testimonials = [
    {
      quote: "Su especialización en empresa familiar fue clave. Entendieron nuestras necesidades de continuidad y encontraron el comprador perfecto que respetará nuestro legado.",
      author: "CEO, Empresa Familiar de Alimentación",
      transaction: "€24M - Cataluña"
    },
    {
      quote: "La preparación documental fue impecable. Pasamos la due diligence sin ajustes y cerramos en los tiempos previstos. Su plataforma de seguimiento nos dio tranquilidad total.",
      author: "Fundador, Distribuidora Logística",
      transaction: "€18M - Sector Logístico"
    },
    {
      quote: "Alineación total de incentivos. Solo cobraron el éxito cuando nosotros ganamos. Su red de inversores cualificados hizo la diferencia en la valoración final.",
      author: "Accionista Principal, Protección contra Incendios",
      transaction: "€32M - Sector Especializado"
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