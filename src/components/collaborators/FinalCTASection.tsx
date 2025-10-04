import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Clock, CheckCircle, Sparkles } from 'lucide-react';

export const FinalCTASection = () => {
  const scrollToForm = () => {
    const formSection = document.getElementById('application-form');
    if (formSection) {
      formSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="py-20 bg-muted relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="absolute top-10 right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-10 left-20 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          
          {/* Header */}
          <div className="mb-12">
            <Badge variant="outline" className="mb-6 text-sm flex items-center gap-2 w-fit mx-auto">
              <Sparkles className="w-4 h-4 text-yellow-500" />
              Oportunidad Limitada
            </Badge>
            
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
              Comienza tu carrera en
              <span className="text-primary block mt-2">
                M&A de alto nivel
              </span>
            </h2>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Únete a una comunidad selecta de profesionales que están definiendo 
              el futuro de las fusiones y adquisiciones en España.
            </p>
          </div>

          {/* Value Props */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="flex flex-col items-center text-center p-6 bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Clock className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Proceso Rápido</h3>
              <p className="text-sm text-muted-foreground">
                Respuesta en 48h y proceso completo en 2-3 semanas
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center p-6 bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Garantía de Calidad</h3>
              <p className="text-sm text-muted-foreground">
                Solo trabajamos con los mejores profesionales del sector
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center p-6 bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Impacto Inmediato</h3>
              <p className="text-sm text-muted-foreground">
                Comienza a trabajar en proyectos premium desde el día 1
              </p>
            </div>
          </div>

          {/* Urgency */}
          <div className="bg-primary/10 border border-primary/20 rounded-2xl p-8 mb-12">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Solo aceptamos 5 nuevos colaboradores por trimestre
            </h3>
            <p className="text-muted-foreground mb-6">
              Nuestro modelo de trabajo requiere un onboarding personalizado y dedicado. 
              Para mantener la excelencia, limitamos las incorporaciones.
            </p>
            <div className="flex items-center justify-center gap-8 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-muted-foreground">Q4 2024: 2 plazas disponibles</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-muted-foreground">Q1 2025: Lista de espera</span>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="space-y-6">
            <Button 
              size="lg"
              className="admin-button-primary text-xl px-12 py-6 h-auto shadow-xl hover:shadow-2xl transition-all duration-300"
              onClick={scrollToForm}
            >
              Solicitar Plaza Ahora
              <ArrowRight className="w-6 h-6 ml-3" />
            </Button>
            
            <p className="text-sm text-muted-foreground">
              Proceso 100% confidencial • Sin compromiso • Respuesta garantizada
            </p>
          </div>

          {/* Social Proof */}
          <div className="mt-16 pt-12 border-t border-border">
            <p className="text-sm text-muted-foreground mb-6">
              Profesionales de estas empresas ya forman parte de nuestro equipo:
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 text-muted-foreground/60 text-sm font-medium">
              <span>Goldman Sachs</span>
              <span>•</span>
              <span>McKinsey & Company</span>
              <span>•</span>
              <span>PwC</span>
              <span>•</span>
              <span>Deloitte</span>
              <span>•</span>
              <span>EY</span>
              <span>•</span>
              <span>KPMG</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCTASection;