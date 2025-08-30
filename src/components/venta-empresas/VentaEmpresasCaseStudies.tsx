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
                <Card className="h-full bg-gradient-to-br from-card to-card/80 border-border shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group">
                  <CardContent className="p-6">
                    {/* Header with sector and ROI */}
                    <div className="flex items-center justify-between mb-6">
                      <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 font-medium">
                        {study.sector}
                      </Badge>
                      <div className="text-right bg-success/10 rounded-lg px-3 py-1.5">
                        <div className="text-xs text-success/70 font-medium">ROI</div>
                        <div className="text-lg font-bold text-success">{study.roi}</div>
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-foreground mb-6 group-hover:text-primary transition-colors">
                      {study.company}
                    </h3>
                    
                    <div className="space-y-6">
                      {/* Key metrics */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-muted/50 rounded-xl p-4 text-center border border-border/50 hover:bg-muted/70 transition-colors">
                          <div className="text-xs text-muted-foreground mb-1 font-medium">Valoración</div>
                          <div className="text-lg font-bold text-foreground">{study.valuation}</div>
                        </div>
                        <div className="bg-muted/50 rounded-xl p-4 text-center border border-border/50 hover:bg-muted/70 transition-colors">
                          <div className="text-xs text-muted-foreground mb-1 font-medium">Múltiplo</div>
                          <div className="text-lg font-bold text-foreground">{study.multiple}</div>
                        </div>
                      </div>
                      
                      {/* Before/After */}
                      <div className="bg-gradient-to-r from-muted/30 to-success/10 rounded-xl p-4 border border-border/50">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-sm text-muted-foreground font-medium">Situación inicial</span>
                          <span className="text-sm font-semibold text-foreground bg-background/80 px-2 py-1 rounded">{study.before}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground font-medium">Resultado final</span>
                          <span className="text-sm font-semibold text-success bg-success/10 px-2 py-1 rounded border border-success/20">{study.after}</span>
                        </div>
                      </div>
                      
                      {/* Key factors */}
                      <div>
                        <div className="text-sm font-semibold text-foreground mb-3">Factores de Éxito</div>
                        <div className="flex flex-wrap gap-2">
                          {study.highlights.map((highlight, idx) => (
                            <span key={idx} className="text-xs bg-primary/5 border border-primary/20 text-primary rounded-full px-3 py-1.5 font-medium hover:bg-primary/10 transition-colors">
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