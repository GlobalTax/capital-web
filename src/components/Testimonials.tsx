
import React, { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Quote } from 'lucide-react';
import { useCache } from '@/hooks/useCache';
import { globalCache } from '@/utils/cache';

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
}

const Testimonials = () => {
  const fetchTestimonials = useCallback(async (): Promise<Testimonial[]> => {
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .eq('is_active', true)
      .order('is_featured', { ascending: false })
      .order('display_order')
      .order('created_at', { ascending: false })
      .limit(3);

    if (error) {
      console.error('Error fetching testimonials:', error);
      throw error;
    }

    return data || [];
  }, []);

  const { 
    data: testimonials, 
    isLoading, 
    error 
  } = useCache(
    'testimonials_featured',
    fetchTestimonials,
    globalCache,
    10 * 60 * 1000 // 10 minutos de cache
  );

  if (isLoading) {
    return (
      <section id="testimonios" className="py-20 bg-gray-50">
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

  if (error || !testimonials || testimonials.length === 0) {
    return null;
  }

  return (
    <section id="testimonios" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-black mb-6">
            Lo que Dicen Nuestros Clientes
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            La confianza de nuestros clientes es nuestro mayor activo. Descubra por qué 
            las empresas más exitosas eligen Capittal como su partner estratégico.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="bg-white border-0.5 border-border rounded-lg shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <Quote className="w-8 h-8 text-gray-300" />
                  <div className="flex">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </div>
                
                <p className="text-gray-700 mb-6 leading-relaxed italic">
                  "{testimonial.testimonial_text}"
                </p>

                <div className="flex items-center">
                  {testimonial.client_photo_url ? (
                    <img
                      src={testimonial.client_photo_url}
                      alt={testimonial.client_name}
                      className="w-12 h-12 rounded-full object-cover mr-4"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mr-4">
                      <span className="text-gray-500 font-medium text-sm">
                        {testimonial.client_name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-black">{testimonial.client_name}</p>
                    <p className="text-sm text-gray-600">
                      {testimonial.client_position} en {testimonial.client_company}
                    </p>
                    {testimonial.sector && (
                      <p className="text-xs text-gray-500 mt-1">{testimonial.sector}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <button className="bg-white text-black border-0.5 border-border rounded-lg px-6 py-3 text-base font-medium hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out">
            Ver Más Testimonios
          </button>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
