import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Star, Users, Trophy, TrendingUp } from 'lucide-react';

export const EnhancedHeroSection = () => {
  const scrollToForm = () => {
    const formSection = document.getElementById('application-form');
    if (formSection) {
      formSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative pt-32 pb-20 bg-gradient-to-br from-background via-muted/20 to-primary/5 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="absolute top-20 right-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            {/* Content */}
            <div className="lg:col-span-7 animate-fade-in">
              <Badge variant="outline" className="mb-6 text-sm flex items-center gap-2 w-fit">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                Programa Exclusivo
              </Badge>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-8 leading-tight">
                Únete al equipo de
                <span className="text-primary block mt-2">
                  expertos en M&A
                </span>
              </h1>
              
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed max-w-2xl">
                Forma parte de nuestra red de profesionales especializados. 
                Trabaja en transacciones de alto nivel con la flexibilidad 
                que buscas y el respaldo de 15 años de experiencia.
              </p>

              {/* Key benefits */}
              <div className="grid grid-cols-2 gap-6 mb-12">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Proyectos Premium</h3>
                    <p className="text-sm text-muted-foreground">Transacciones de €5M-€100M+</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Crecimiento Profesional</h3>
                    <p className="text-sm text-muted-foreground">Mentoría y desarrollo continuo</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg"
                  className="admin-button-primary text-lg px-8 py-4 h-auto"
                  onClick={scrollToForm}
                >
                  Aplicar Ahora
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                
                <Button 
                  variant="outline" 
                  size="lg"
                  className="text-lg px-8 py-4 h-auto"
                >
                  Ver Requisitos
                </Button>
              </div>
            </div>

            {/* Stats Dashboard */}
            <div className="lg:col-span-5 animate-scale-in">
              <div className="relative">
                {/* Main dashboard card */}
                <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
                  <div className="bg-primary text-primary-foreground p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold mb-1">Capittal Collaborators</h3>
                        <p className="text-primary-foreground/80 text-sm">Network Dashboard</p>
                      </div>
                      <Users className="w-8 h-8 text-primary-foreground/80" />
                    </div>
                  </div>
                  
                  {/* Stats grid */}
                  <div className="p-6">
                    <div className="grid grid-cols-2 gap-6 mb-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-foreground mb-2">50+</div>
                        <div className="text-sm text-muted-foreground">Colaboradores Activos</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-foreground mb-2">€1.2B</div>
                        <div className="text-sm text-muted-foreground">Valor Gestionado</div>
                      </div>
                    </div>

                    {/* Recent activity */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-foreground text-sm mb-3">Actividad Reciente</h4>
                      
                      <div className="flex items-center justify-between py-3 px-4 bg-muted/50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm font-medium text-foreground">TechCorp Valuation</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-foreground">€25M</div>
                          <div className="text-xs text-green-600">Completado</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between py-3 px-4 bg-muted/50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                          <span className="text-sm font-medium text-foreground">Industrial M&A</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-foreground">€45M</div>
                          <div className="text-xs text-blue-600">En Progreso</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between py-3 px-4 bg-muted/50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                          <span className="text-sm font-medium text-foreground">Retail DD</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-foreground">€18M</div>
                          <div className="text-xs text-primary">Iniciado</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 pt-4 border-t border-border">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Proyectos Q4 2024</span>
                        <span className="font-bold text-foreground">23 activos</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Floating badges */}
                <div className="absolute -top-4 -right-4 bg-accent border border-border rounded-xl p-3 shadow-lg animate-pulse">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div className="text-sm font-semibold text-foreground">+12 nuevos</div>
                  </div>
                </div>
                
                <div className="absolute -bottom-4 -left-4 bg-card border border-border rounded-xl p-3 shadow-lg">
                  <div className="text-center">
                    <div className="text-lg font-bold text-primary">95%</div>
                    <div className="text-xs text-muted-foreground">Satisfacción</div>
                  </div>
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