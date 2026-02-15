import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { useCaseStudies } from '@/hooks/useCaseStudies';

const VentaEmpresasCaseStudies = () => {
  const { caseStudies, isLoading } = useCaseStudies();
  
  // Limitar a 6 casos máximo para el carrusel
  const displayedCases = caseStudies.slice(0, 6);

  return (
    <section id="casos" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-normal text-foreground mb-6">
            Casos de Éxito
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Descubre cómo hemos ayudado a empresas como la tuya a maximizar su valor y 
            completar transacciones exitosas.
          </p>
        </div>

        {/* Case Studies Carousel */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : displayedCases.length > 0 ? (
          <Carousel className="w-full max-w-6xl mx-auto mb-16">
            <CarouselContent className="-ml-1">
              {displayedCases.map((study) => (
                <CarouselItem key={study.id} className="pl-1 md:basis-1/2 lg:basis-1/3">
                  <Card className="h-full bg-gradient-to-br from-card to-card/80 border-border shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group">
                    <CardContent className="p-6">
                      {/* Header con Sector + Año */}
                      <div className="flex items-center justify-between mb-4">
                        <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 font-medium">
                          {study.sector}
                        </Badge>
                        {study.year && (
                          <div className="text-xs font-semibold text-muted-foreground bg-muted/50 rounded-full px-3 py-1">
                            {study.year}
                          </div>
                        )}
                      </div>
                      
                      {/* Logo de la empresa (si existe) */}
                      {study.logo_url && (
                        <div className="mb-4 flex justify-center">
                          <img 
                            src={study.logo_url} 
                            alt={`Logo de ${study.title}`}
                            className="h-12 object-contain"
                            width={120}
                            height={48}
                            loading="lazy"
                            decoding="async"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                      
                      {/* Título del caso */}
                      <h3 className="text-lg font-normal text-foreground mb-3 group-hover:text-primary transition-colors line-clamp-2">
                        {study.title}
                      </h3>
                      
                      {/* Descripción */}
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                        {study.description}
                      </p>
                      
                      {/* Valor de la transacción (si existe y no es confidencial) */}
                      {study.value_amount && !study.is_value_confidential && (
                        <div className="mb-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 rounded-xl p-3 border border-green-200 dark:border-green-800">
                          <div className="text-xs text-muted-foreground mb-1">Valor de la transacción</div>
                          <div className="text-xl font-bold text-green-700 dark:text-green-400">
                            {study.value_currency}{study.value_amount}M
                          </div>
                        </div>
                      )}
                      
                      {/* Highlights como tags */}
                      {study.highlights && study.highlights.length > 0 && (
                        <div>
                          <div className="text-xs font-semibold text-foreground mb-2">Factores Clave</div>
                          <div className="flex flex-wrap gap-2">
                            {study.highlights.slice(0, 3).map((highlight, idx) => (
                              <span 
                                key={idx} 
                                className="text-xs bg-primary/5 border border-primary/20 text-primary rounded-full px-2.5 py-1 font-medium hover:bg-primary/10 transition-colors"
                              >
                                {highlight}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        ) : (
          <div className="text-center py-10">
            <p className="text-muted-foreground">No hay casos de éxito disponibles.</p>
          </div>
        )}

        {/* Global Success Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="text-center bg-card border border-border rounded-lg p-8 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="text-4xl font-bold text-foreground mb-2">200+</div>
            <div className="text-muted-foreground">Empresas Vendidas</div>
          </div>
          <div className="text-center bg-card border border-border rounded-lg p-8 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="text-4xl font-bold text-foreground mb-2">€902M</div>
            <div className="text-muted-foreground">Valor Total</div>
          </div>
          <div className="text-center bg-card border border-border rounded-lg p-8 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="text-4xl font-bold text-foreground mb-2">5.5x</div>
            <div className="text-muted-foreground">Múltiplo Promedio</div>
          </div>
        </div>

    </div>
    </section>
  );
};

export default VentaEmpresasCaseStudies;