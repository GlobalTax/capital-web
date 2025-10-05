import React from 'react';
import AutoScroll from "embla-carousel-auto-scroll";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { useCarouselLogos } from '@/hooks/useCarouselLogos';
import { LazyImage } from '@/components/shared/LazyImage';

const LogoCarousel = () => {
  const { data: logos = [], isLoading } = useCarouselLogos();

  if (isLoading) {
    return (
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-64 mx-auto mb-4"></div>
            <div className="h-4 bg-muted rounded w-96 mx-auto"></div>
          </div>
        </div>
      </section>
    );
  }

  if (logos.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
        <h2 className="text-2xl font-bold text-foreground mb-4">
          Empresas que Confían en Nosotros
        </h2>
        <p className="text-muted-foreground text-lg mb-8">
          Más de 200 empresas han confiado en nuestros servicios
        </p>
      </div>

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
                      <LazyImage
                        src={logo.logo_url}
                        alt={logo.company_name}
                        className="h-7 w-auto opacity-70 hover:opacity-100 transition-opacity duration-300"
                        priority={false}
                      />
                    ) : (
                      <div className="h-7 w-20 bg-muted rounded flex items-center justify-center">
                        <span className="text-xs text-muted-foreground">{logo.company_name}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
        <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-background to-transparent"></div>
        <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-background to-transparent"></div>
      </div>
    </section>
  );
};

export default LogoCarousel;
