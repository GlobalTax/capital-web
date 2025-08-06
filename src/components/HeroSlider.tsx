import React from 'react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import { useHeroSlides } from '@/hooks/useHeroSlides';
import ErrorBoundary from '@/components/ErrorBoundary';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import Autoplay from 'embla-carousel-autoplay';
import { useRef } from 'react';

const HeroSlider = () => {
  const { slides, isLoading, error } = useHeroSlides();
  const { isOnline } = useNetworkStatus();
  const plugin = useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  );

  if (isLoading) {
    return (
      <section className="relative min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 flex items-center">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded w-3/4 mx-auto mb-4"></div>
              <div className="h-4 bg-muted rounded w-1/2 mx-auto mb-8"></div>
              <div className="h-12 bg-muted rounded w-48 mx-auto"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error || !slides.length) {
    // Fallback to default content
    return (
      <section className="relative min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 flex items-center overflow-hidden">
        <div className="container mx-auto px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="space-y-8 text-center lg:text-left">
              <div className="space-y-4">
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-light leading-tight">
                  <span className="block text-muted-foreground text-2xl md:text-3xl font-normal mb-2">
                    Capittal
                  </span>
                  Expertos en M&A y Valoraciones
                </h1>
                <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto lg:mx-0">
                  Maximizamos el valor de tu empresa con estrategias personalizadas de fusiones, adquisiciones y valoraciones empresariales.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <InteractiveHoverButton
                  variant="primary"
                  size="lg"
                  onClick={() => window.location.href = '/contacto'}
                  disabled={!isOnline}
                  className="min-w-[200px]"
                  text="Solicitar Consulta"
                />
                
                <InteractiveHoverButton
                  variant="outline"
                  size="lg"
                  onClick={() => window.location.href = '/casos-exito'}
                  disabled={!isOnline}
                  className="min-w-[200px]"
                  text="Ver Casos de Éxito"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <ErrorBoundary>
      <section className="relative min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 flex items-center overflow-hidden">
        <Carousel
          className="w-full"
          plugins={[plugin.current]}
          onMouseEnter={plugin.current.stop}
          onMouseLeave={plugin.current.reset}
        >
          <CarouselContent>
            {slides.map((slide) => (
              <CarouselItem key={slide.id}>
                <div className="container mx-auto px-6 lg:px-8 relative z-10">
                  <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center min-h-screen py-20">
                    <div className="space-y-8 text-center lg:text-left">
                      <div className="space-y-4">
                        {slide.subtitle && (
                          <span className="block text-muted-foreground text-2xl md:text-3xl font-normal mb-2">
                            {slide.subtitle}
                          </span>
                        )}
                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-light leading-tight">
                          {slide.title}
                        </h1>
                        {slide.description && (
                          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto lg:mx-0">
                            {slide.description}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                        {slide.cta_primary_text && slide.cta_primary_url && (
                          <InteractiveHoverButton
                            variant="primary"
                            size="lg"
                            onClick={() => window.location.href = slide.cta_primary_url}
                            disabled={!isOnline}
                            className="min-w-[200px]"
                            text={slide.cta_primary_text}
                          />
                        )}
                        
                        {slide.cta_secondary_text && slide.cta_secondary_url && (
                          <InteractiveHoverButton
                            variant="outline"
                            size="lg"
                            onClick={() => window.location.href = slide.cta_secondary_url}
                            disabled={!isOnline}
                            className="min-w-[200px]"
                            text={slide.cta_secondary_text}
                          />
                        )}
                      </div>
                    </div>

                    {slide.image_url && (
                      <div className="relative">
                        <img 
                          src={slide.image_url}
                          alt={slide.title}
                          className="w-full h-auto rounded-lg shadow-2xl"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          
          {slides.length > 1 && (
            <>
              <CarouselPrevious className="left-4" />
              <CarouselNext className="right-4" />
            </>
          )}
        </Carousel>
      </section>
    </ErrorBoundary>
  );
};

export default HeroSlider;