
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Star } from 'lucide-react';

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
}

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .eq('is_active', true)
        .order('is_featured', { ascending: false })
        .order('display_order')
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) {
        console.error('Error fetching testimonials:', error);
        return;
      }

      setTestimonials(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-96 mx-auto"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (testimonials.length === 0) {
    return null; // No mostrar la sección si no hay testimonios
  }

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-black mb-6">
            Lo Que Dicen Nuestros Clientes
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            La confianza de nuestros clientes es nuestra mejor recomendación. 
            Estos son algunos testimonios reales de empresarios que trabajaron con nosotros.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div 
              key={testimonial.id} 
              className={`bg-white border-0.5 border-black rounded-lg shadow-sm p-8 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out group ${testimonial.is_featured ? 'ring-2 ring-black' : ''}`}
            >
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              
              <blockquote className="text-gray-700 mb-6 italic leading-relaxed group-hover:text-gray-900 transition-colors">
                "{testimonial.testimonial_text}"
              </blockquote>
              
              <div className="border-t border-gray-200 pt-6">
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    {testimonial.client_photo_url && (
                      <img 
                        src={testimonial.client_photo_url} 
                        alt={testimonial.client_name}
                        className="w-12 h-12 rounded-full object-cover mr-4"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    )}
                    <div>
                      <div className="font-bold text-black text-lg">{testimonial.client_name}</div>
                      {testimonial.client_position && (
                        <div className="text-gray-600">{testimonial.client_position}</div>
                      )}
                      <div className="text-gray-500 text-sm">{testimonial.client_company}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    {testimonial.sector && (
                      <div className="text-gray-500 text-sm mb-1">{testimonial.sector}</div>
                    )}
                    {testimonial.project_type && (
                      <div className="text-green-600 font-medium text-sm capitalize">
                        {testimonial.project_type}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <p className="text-lg text-gray-600 mb-6">
            ¿Quiere ser nuestro próximo caso de éxito?
          </p>
          <button className="bg-white text-black border-0.5 border-black rounded-lg px-6 py-3 text-base font-medium hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out">
            Contactar con Nosotros
          </button>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
