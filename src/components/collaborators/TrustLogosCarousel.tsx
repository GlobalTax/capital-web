import React from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import AutoScroll from 'embla-carousel-auto-scroll';
import { Badge } from '@/components/ui/badge';
import { useCarouselLogos } from '@/hooks/useCarouselLogos';
import { Skeleton } from '@/components/ui/skeleton';

export const TrustLogosCarousel = () => {
  const { data: logos, isLoading } = useCarouselLogos(false);
  
  const [emblaRef] = useEmblaCarousel(
    { 
      loop: true,
      align: 'start',
      skipSnaps: false,
      dragFree: true
    },
    [
      AutoScroll({ 
        playOnInit: true, 
        speed: 1,
        stopOnInteraction: false,
        stopOnMouseEnter: true
      })
    ]
  );

  if (isLoading) {
    return (
      <section className="py-12 bg-muted/50 border-y border-border">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <Skeleton className="h-6 w-64 mx-auto" />
          </div>
          <div className="flex gap-8 justify-center">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 w-32" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!logos || logos.length === 0) {
    return null;
  }

  return (
    <section className="py-12 md:py-16 bg-muted/50 border-y border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <Badge variant="outline" className="mb-4">
            Confianza y experiencia
          </Badge>
          <h3 className="text-xl md:text-2xl font-semibold text-foreground mb-2">
            Empresas que han confiado en nosotros
          </h3>
          <p className="text-muted-foreground">
            Colaboramos con líderes de diferentes sectores
          </p>
        </div>
        
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-8 md:gap-12">
            {logos.map((logo) => (
              <div
                key={logo.id}
                className="flex-[0_0_auto] min-w-[150px] md:min-w-[200px]"
              >
                <div className="flex items-center justify-center h-20 md:h-24 px-4 bg-background rounded-lg border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-md group">
                  {logo.logo_url ? (
                    <img
                      src={logo.logo_url}
                      alt={logo.company_name}
                      className="max-h-12 md:max-h-16 w-auto object-contain grayscale group-hover:grayscale-0 transition-all duration-300 opacity-70 group-hover:opacity-100"
                      loading="lazy"
                    />
                  ) : (
                    <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                      {logo.company_name}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustLogosCarousel;
