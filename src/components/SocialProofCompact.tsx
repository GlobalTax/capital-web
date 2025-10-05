import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useCarouselLogos } from '@/hooks/useCarouselLogos';
import { LazyImage } from '@/components/shared/LazyImage';

interface CarouselLogo {
  id: string;
  company_name: string;
  logo_url?: string;
  display_order: number;
  is_active: boolean;
}

interface CarouselTestimonial {
  id: string;
  quote: string;
  client_name: string;
  client_company?: string;
  client_logo_url?: string;
  display_order: number;
  is_active: boolean;
}

const SocialProofCompact = () => {
  const { data: logos = [], isLoading: logosLoading } = useCarouselLogos();
  const [testimonial, setTestimonial] = useState<CarouselTestimonial | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const { data, error } = await supabase
          .from('carousel_testimonials')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true })
          .limit(1);

        if (error) {
          console.error('❌ Error fetching testimonials:', error);
          setTestimonial(null);
        } else {
          setTestimonial(data?.[0] || null);
        }
      } catch (error) {
        console.error('💥 Testimonials fetch failed:', error);
        setTestimonial(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  if (isLoading || logosLoading) {
    return (
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-96 mx-auto mb-8"></div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-16">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-gray-200 h-16 rounded-lg"></div>
              ))}
            </div>
            <div className="bg-gray-200 h-32 rounded-lg max-w-2xl mx-auto"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">
            Confían en Nosotros
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Empresas líderes de diversos sectores han confiado en nuestra experiencia para sus operaciones más importantes.
          </p>
        </div>

        {/* Company Logos */}
        {logos.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-16">
            {logos.map((logo) => (
              <div 
                key={logo.id} 
                className="flex items-center justify-center p-4 grayscale hover:grayscale-0 transition-all duration-300"
              >
                {logo.logo_url ? (
                  <LazyImage
                    src={logo.logo_url}
                    alt={logo.company_name}
                    className="max-h-12 w-auto object-contain"
                    priority={false}
                  />
                ) : (
                  <span className="text-gray-600 font-medium">
                    {logo.company_name}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Featured Testimonial */}
        {testimonial && (
          <Card className="max-w-2xl mx-auto border border-gray-300 shadow-sm">
            <CardContent className="p-8">
              <div className="text-center">
                <blockquote className="text-lg text-gray-600 italic mb-6 leading-relaxed">
                  "{testimonial.quote}"
                </blockquote>
                <div className="flex items-center justify-center space-x-4">
                  {testimonial.client_logo_url && (
                    <img
                      src={testimonial.client_logo_url}
                      alt={testimonial.client_company || 'Company logo'}
                      className="h-8 w-auto object-contain"
                    />
                  )}
                  <div className="text-left">
                    <div className="font-semibold text-black">{testimonial.client_name}</div>
                    {testimonial.client_company && (
                      <div className="text-sm text-gray-600">{testimonial.client_company}</div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
};

export default SocialProofCompact;