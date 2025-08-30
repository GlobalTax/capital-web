import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

const VentaEmpresasCaseStudies = () => {
  const caseStudies = [
    {
      sector: "SaaS B2B",
      company: "TechFlow Solutions",
      valuation: "€12.5M",
      multiple: "6.2x EBITDA",
      roi: "+320%",
      before: "€2M EBITDA",
      after: "Vendida a grupo internacional",
      highlights: ["Escalabilidad demostrada", "ARR recurrente 95%", "Expansión internacional"]
    },
    {
      sector: "E-commerce",
      company: "RetailMax Pro", 
      valuation: "€8.7M",
      multiple: "4.8x EBITDA",
      roi: "+280%",
      before: "€1.8M EBITDA",
      after: "Adquirida por competidor estratégico", 
      highlights: ["Base de clientes leal", "Márgenes optimizados", "Logística automatizada"]
    },
    {
      sector: "HealthTech",
      company: "MedDevice Innovation",
      valuation: "€15.2M", 
      multiple: "7.1x EBITDA",
      roi: "+450%",
      before: "€2.1M EBITDA",
      after: "Vendida a fondo de private equity",
      highlights: ["Tecnología patentada", "Regulación CE", "Pipeline robusto"]
    },
    {
      sector: "Servicios B2B", 
      company: "ConsultPro Group",
      valuation: "€6.3M",
      multiple: "5.5x EBITDA", 
      roi: "+190%",
      before: "€1.1M EBITDA",
      after: "Integración con grupo consultor",
      highlights: ["Contratos recurrentes", "Equipo especializado", "Diversificación sectorial"]
    }
  ];

  return (
    <section id="casos" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-6">
            Casos de Éxito
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Descubre cómo hemos ayudado a empresas como la tuya a maximizar su valor y 
            completar transacciones exitosas.
          </p>
        </div>

        {/* Case Studies Carousel */}
        <Carousel className="w-full max-w-6xl mx-auto mb-16">
          <CarouselContent className="-ml-1">
            {caseStudies.map((study, index) => (
              <CarouselItem key={index} className="pl-1 md:basis-1/2 lg:basis-1/3">
                <Card className="h-full bg-card border-border shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Badge variant="secondary" className="bg-muted text-foreground">
                        {study.sector}
                      </Badge>
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">ROI</div>
                        <div className="font-bold text-success">{study.roi}</div>
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-bold text-foreground mb-4">
                      {study.company}
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div className="bg-muted rounded-lg p-3">
                          <div className="text-sm text-muted-foreground mb-1">Valoración</div>
                          <div className="font-bold text-foreground">{study.valuation}</div>
                        </div>
                        <div className="bg-muted rounded-lg p-3">
                          <div className="text-sm text-muted-foreground mb-1">Múltiplo</div>
                          <div className="font-bold text-foreground">{study.multiple}</div>
                        </div>
                      </div>
                      
                      <div className="bg-muted rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-muted-foreground">Antes:</span>
                          <span className="text-sm font-medium text-foreground">{study.before}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Resultado:</span>
                          <span className="text-sm font-medium text-success">{study.after}</span>
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-sm font-medium text-foreground mb-2">Factores Clave:</div>
                        <div className="flex flex-wrap gap-2">
                          {study.highlights.map((highlight, idx) => (
                            <span key={idx} className="text-xs bg-card border border-border rounded-full px-2 py-1 text-muted-foreground">
                              {highlight}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>

        {/* Global Success Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="text-center bg-card border border-border rounded-lg p-8 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="text-4xl font-bold text-foreground mb-2">200+</div>
            <div className="text-muted-foreground">Empresas Vendidas</div>
          </div>
          <div className="text-center bg-card border border-border rounded-lg p-8 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="text-4xl font-bold text-foreground mb-2">€2.1B</div>
            <div className="text-muted-foreground">Valor Total</div>
          </div>
          <div className="text-center bg-card border border-border rounded-lg p-8 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="text-4xl font-bold text-foreground mb-2">5.2x</div>
            <div className="text-muted-foreground">Múltiplo Promedio</div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button className="bg-card text-foreground border border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            Ver Más Casos de Éxito
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default VentaEmpresasCaseStudies;