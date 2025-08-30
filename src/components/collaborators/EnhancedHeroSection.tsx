import React from 'react';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import { Star, Users, Trophy, TrendingUp, CheckCircle } from 'lucide-react';

export const EnhancedHeroSection = () => {
  const scrollToForm = () => {
    const formSection = document.getElementById('application-form');
    if (formSection) {
      formSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="pt-32 pb-20 bg-gradient-to-br from-background to-background/50 min-h-screen flex items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <div>
            <div className="inline-flex items-center px-4 py-2 bg-muted text-muted-foreground rounded-lg text-sm font-medium mb-8">
              <Star className="w-4 h-4 mr-2" />
              Programa Exclusivo
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-foreground mb-8 leading-tight tracking-tight">
              Únete al equipo de expertos en M&A
            </h1>
            
            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mb-12 font-light">
              Forma parte de nuestra red de profesionales especializados. 
              Trabaja en transacciones de alto nivel con flexibilidad total.
            </p>

            {/* Benefits */}
            <div className="space-y-4 mb-12">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-primary" />
                <span className="text-muted-foreground">Proyectos Premium de €5M-€100M+</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-primary" />
                <span className="text-muted-foreground">Red de 50+ colaboradores activos</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-primary" />
                <span className="text-muted-foreground">95% de satisfacción garantizada</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-6">
              <InteractiveHoverButton 
                text="Aplicar Ahora"
                variant="primary"
                size="lg"
                onClick={scrollToForm}
              />
              
              <InteractiveHoverButton 
                text="Ver Requisitos"
                variant="outline"
                size="lg"
              />
            </div>
          </div>

          {/* Statistics Card */}
          <div className="lg:justify-self-end">
            <div className="bg-card rounded-lg shadow-lg border p-8 max-w-md">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-card-foreground mb-2">Programa M&A</h3>
                <p className="text-muted-foreground text-sm">Red de Colaboradores</p>
              </div>
              
              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-card-foreground mb-1">50+</div>
                  <div className="text-xs text-muted-foreground">Colaboradores</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-card-foreground mb-1">€1.2B</div>
                  <div className="text-xs text-muted-foreground">Valor Gestionado</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-card-foreground mb-1">95%</div>
                  <div className="text-xs text-muted-foreground">Satisfacción</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-card-foreground mb-1">23</div>
                  <div className="text-xs text-muted-foreground">Proyectos Q4</div>
                </div>
              </div>

              {/* Specializations */}
              <div className="space-y-3">
                <h4 className="font-medium text-card-foreground text-sm mb-3">Especializaciones</h4>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-muted-foreground">Tecnología</span>
                  <Trophy className="w-4 h-4 text-primary" />
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-muted-foreground">Industrial</span>
                  <Trophy className="w-4 h-4 text-primary" />
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-muted-foreground">Servicios</span>
                  <Trophy className="w-4 h-4 text-primary" />
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-border">
                <div className="flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-primary mr-2" />
                  <span className="text-xs text-muted-foreground">Crecimiento sostenido desde 2009</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EnhancedHeroSection;