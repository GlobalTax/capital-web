
import React from 'react';
import { Star } from 'lucide-react';

const PorQueElegirnosTestimonials = () => {
  const testimonials = [
    {
      name: "Carlos Mendoza",
      company: "TechStart Solutions",
      role: "CEO",
      testimonial: "Capittal superó todas nuestras expectativas. Su profesionalismo y expertise nos ayudaron a conseguir un 40% más del valor inicial estimado.",
      rating: 5,
      deal: "€15M de valoración"
    },
    {
      name: "Ana García",
      company: "MedDevice Innovations",
      role: "Fundadora",
      testimonial: "El proceso fue transparente y eficiente. El equipo de Capittal nos guió en cada paso y consiguió múltiples ofertas competitivas.",
      rating: 5,
      deal: "€8M de valoración"
    },
    {
      name: "Miguel Torres",
      company: "Green Energy Corp",
      role: "Director General",
      testimonial: "Su conocimiento del mercado y red de contactos fue clave. Completamos la transacción en tiempo récord con excelentes términos.",
      rating: 5,
      deal: "€22M de valoración"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-black mb-6">
            Lo Que Dicen Nuestros Clientes
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            La confianza de nuestros clientes es nuestra mejor recomendación. 
            Estos son algunos testimonios reales de empresarios que trabajaron con nosotros.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index} 
              className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group"
            >
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              
              <blockquote className="text-gray-700 mb-6 italic leading-relaxed group-hover:text-gray-900 transition-colors">
                "{testimonial.testimonial}"
              </blockquote>
              
              <div className="border-t border-gray-200 pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-bold text-black text-lg">{testimonial.name}</div>
                    <div className="text-gray-600">{testimonial.role}</div>
                    <div className="text-gray-500 text-sm">{testimonial.company}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-green-600 font-bold text-lg">{testimonial.deal}</div>
                    <div className="text-gray-500 text-sm">Valoración final</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PorQueElegirnosTestimonials;
