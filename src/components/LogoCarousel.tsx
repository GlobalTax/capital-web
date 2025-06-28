
import React, { useState, useEffect } from 'react';
import AutoScroll from "embla-carousel-auto-scroll";
import { cn } from "@/lib/utils";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { supabase } from '@/integrations/supabase/client';

interface CarouselLogo {
  id: string;
  company_name: string;
  logo_url: string | null;
  display_order: number;
  is_active: boolean;
}

interface CarouselTestimonial {
  id: string;
  quote: string;
  client_name: string;
  client_company: string;
  logo_url: string | null;
  display_order: number;
  is_active: boolean;
}

const LogoCarousel = () => {
  const [logos, setLogos] = useState<CarouselLogo[]>([]);
  const [testimonials, setTestimonials] = useState<CarouselTestimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Con RLS habilitado, solo se pueden ver logos y testimoniales activos
      const { data: logosData, error: logosError } = await supabase
        .from('carousel_logos')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (logosError) {
        console.error('Error fetching carousel logos:', logosError);
        // No mostrar error al usuario, simplemente continuar sin logos
      } else {
        setLogos(logosData || []);
      }

      // Fetch testimonials
      const { data: testimonialsData, error: testimonialsError } = await supabase
        .from('carousel_testimonials')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (testimonialsError) {
        console.error('Error fetching carousel testimonials:', testimonialsError);
        // No mostrar error al usuario, simplemente continuar sin testimoniales
      } else {
        setTestimonials(testimonialsData || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-96 mx-auto"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
        <h2 className="text-2xl font-bold text-black mb-4">
          Empresas que Confían en Nosotros
        </h2>
        <p className="text-gray-600 text-lg mb-8">
          Más de 200 empresas han confiado en nuestros servicios
        </p>
      </div>

      {logos.length > 0 && (
        <div className="relative mx-auto flex items-center justify-center pt-8 lg:max-w-5xl">
          <Carousel
            opts={{ loop: true }}
            plugins={[AutoScroll({ playOnInit: true })]}
          >
            <CarouselContent className="ml-0">
              {logos.map((logo) => (
                <CarouselItem
                  key={logo.id}
                  className="flex basis-1/3 justify-center pl-0 sm:basis-1/4 md:basis-1/5 lg:basis-1/6"
                >
                  <div className="flex shrink-0 items-center justify-center lg:mx-10">
                    <div>
                      {logo.logo_url ? (
                        <img
                          src={logo.logo_url}
                          alt={logo.company_name}
                          className="h-7 w-auto"
                        />
                      ) : (
                        <div className="h-7 w-20 bg-gray-200 rounded flex items-center justify-center">
                          <span className="text-xs text-gray-500">{logo.company_name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
          <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-white to-transparent"></div>
          <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-white to-transparent"></div>
        </div>
      )}

      {testimonials.length > 0 && (
        <div className="max-w-6xl mx-auto mt-16">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-black mb-4">
              Lo que Dicen Nuestros Clientes
            </h3>
          </div>
          <Carousel opts={{ loop: true }} className="mx-auto w-full">
            <CarouselContent>
              {testimonials.map((testimonial) => (
                <CarouselItem key={testimonial.id} className="md:basis-1/2 lg:basis-1/3">
                  <div className="relative w-full px-12 text-center md:px-8 md:text-left">
                    <h5 className="text-gray-600 mb-14 mt-5 line-clamp-3 text-lg tracking-tight md:mb-28">
                      "{testimonial.quote}"
                    </h5>
                    <div className="mt-auto">
                      <p className="text-black text-lg font-semibold tracking-tight">
                        {testimonial.client_name}, {testimonial.client_company}
                      </p>
                      {testimonial.logo_url && (
                        <img
                          className="mx-auto my-5 w-40 md:mx-0"
                          alt="Company logo"
                          src={testimonial.logo_url}
                        />
                      )}
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      )}

      {logos.length === 0 && testimonials.length === 0 && (
        <div className="text-center">
          <p className="text-gray-600">No hay contenido disponible en este momento.</p>
        </div>
      )}
    </section>
  );
};

export default LogoCarousel;
