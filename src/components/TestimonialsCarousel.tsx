import React, { useState, useEffect } from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from '@/components/ui/card';
import { Quote } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface CarouselTestimonial {
  id: string;
  quote: string;
  client_name: string;
  client_company: string;
  logo_url: string | null;
  display_order: number;
  is_active: boolean;
}

const TestimonialsCarousel = () => {
  const [testimonials, setTestimonials] = useState<CarouselTestimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const { data, error } = await supabase
        .from('carousel_testimonials')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (error) {
        console.error('Error fetching carousel testimonials:', error);
      } else {
        setTestimonials(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded w-64 mx-auto mb-4"></div>
              <div className="h-4 bg-muted rounded w-96 mx-auto"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (testimonials.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-background">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-normal text-foreground mb-6 tracking-tight">
            Lo que Dicen Nuestros Clientes
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed font-normal">
            La confianza de nuestros clientes es nuestro mayor activo. Descubra por qué 
            las empresas más exitosas eligen Capittal como su partner estratégico.
          </p>
        </div>

        <div className="relative max-w-6xl mx-auto">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="mx-auto w-full"
          >
            <CarouselContent>
              {testimonials.map((testimonial) => (
                <CarouselItem key={testimonial.id} className="md:basis-1/2 lg:basis-1/3">
                  <div className="p-4">
                    <Card className="h-full bg-card border border-border shadow-sm hover:shadow-md transition-all duration-300 ease-out">
                      <CardContent className="p-6 flex flex-col justify-between h-full">
                        <div>
                          <Quote className="w-6 h-6 text-muted-foreground mb-4" />
                          <p className="text-muted-foreground mb-6 leading-relaxed italic text-base font-normal">
                            "{testimonial.quote}"
                          </p>
                        </div>
                        
                        <div className="mt-auto">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-foreground text-base">
                                {testimonial.client_name}
                              </p>
                              <p className="text-sm text-muted-foreground font-normal">
                                {testimonial.client_company}
                              </p>
                            </div>
                            {testimonial.logo_url && (
                              <img
                                src={testimonial.logo_url}
                                alt={`Logo de ${testimonial.client_company}`}
                                className="h-8 w-auto opacity-70"
                              />
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex" />
            <CarouselNext className="hidden md:flex" />
          </Carousel>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsCarousel;