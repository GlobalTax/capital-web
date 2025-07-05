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
    <section className="relative pt-32 pb-24 bg-gradient-to-br from-background via-muted/30 to-primary/5 overflow-hidden">
      {/* Enhanced background elements */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxIiBmaWxsPSJoc2woMjE1IDI3JSAyMyUgLyAwLjA1KSIvPgo8L3N2Zz4=')] opacity-30"></div>
      <div className="absolute top-20 right-20 w-80 h-80 bg-primary/8 rounded-full blur-3xl animate-bounce-gentle"></div>
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-accent/8 rounded-full blur-3xl animate-bounce-gentle delay-1000"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            {/* Content */}
            <div className="lg:col-span-7 animate-fade-in-up">
              <Badge variant="outline" className="mb-8 text-sm flex items-center gap-2 w-fit border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 transition-colors">
                <Star className="w-4 h-4 fill-primary text-primary" />
                Programa Exclusivo
              </Badge>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-10 leading-[1.1] tracking-tight">
                Únete al equipo de
                <span className="text-primary block mt-3 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                  expertos en M&A
                </span>
              </h1>
              
              <p className="text-xl text-muted-foreground mb-10 leading-relaxed max-w-2xl font-medium">
                Forma parte de nuestra red de profesionales especializados. 
                Trabaja en transacciones de alto nivel con la flexibilidad 
                que buscas y el respaldo de 15 años de experiencia.
              </p>

              {/* Key benefits */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-14">
                <div className="flex items-start space-x-4 group">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/15 transition-colors duration-300">
                    <Trophy className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2 text-lg">Proyectos Premium</h3>
                    <p className="text-muted-foreground leading-relaxed">Transacciones de €5M-€100M+</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4 group">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/15 transition-colors duration-300">
                    <TrendingUp className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2 text-lg">Crecimiento Profesional</h3>
                    <p className="text-muted-foreground leading-relaxed">Mentoría y desarrollo continuo</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-6">
                <Button 
                  size="lg"
                  className="text-lg px-10 py-4 h-auto shadow-lg hover:shadow-xl group"
                  onClick={scrollToForm}
                >
                  Aplicar Ahora
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                
                <Button 
                  variant="outline" 
                  size="lg"
                  className="text-lg px-10 py-4 h-auto border-primary/20 text-primary hover:bg-primary/5"
                >
                  Ver Requisitos
                </Button>
              </div>
            </div>

            {/* Enhanced Stats Dashboard */}
            <div className="lg:col-span-5 animate-scale-in delay-300">
              <div className="relative">
                {/* Main dashboard card */}
                <div className="bg-card border border-border rounded-2xl shadow-[0_20px_25px_-5px_hsl(215_27%_23%_/_0.1)] overflow-hidden backdrop-blur-sm hover:shadow-[0_25px_30px_-5px_hsl(215_27%_23%_/_0.15)] transition-all duration-300">
                  <div className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground p-8">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-bold mb-2">Capittal Collaborators</h3>
                        <p className="text-primary-foreground/90 text-sm font-medium">Network Dashboard</p>
                      </div>
                      <div className="w-12 h-12 bg-primary-foreground/10 rounded-xl flex items-center justify-center">
                        <Users className="w-6 h-6 text-primary-foreground" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Enhanced stats grid */}
                  <div className="p-8">
                    <div className="grid grid-cols-2 gap-8 mb-8">
                      <div className="text-center group">
                        <div className="text-4xl font-bold text-foreground mb-3 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent group-hover:scale-110 transition-transform">50+</div>
                        <div className="text-sm text-muted-foreground font-medium">Colaboradores Activos</div>
                      </div>
                      <div className="text-center group">
                        <div className="text-4xl font-bold text-foreground mb-3 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent group-hover:scale-110 transition-transform">€1.2B</div>
                        <div className="text-sm text-muted-foreground font-medium">Valor Gestionado</div>
                      </div>
                    </div>

                    {/* Enhanced recent activity */}
                    <div className="space-y-5">
                      <h4 className="font-semibold text-foreground mb-4">Actividad Reciente</h4>
                      
                      <div className="flex items-center justify-between py-4 px-5 bg-muted/30 rounded-xl border border-border/50 hover:bg-muted/50 transition-colors group">
                        <div className="flex items-center space-x-4">
                          <div className="w-3 h-3 bg-success rounded-full shadow-sm"></div>
                          <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">TechCorp Valuation</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-foreground">€25M</div>
                          <div className="text-xs text-success font-medium">Completado</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between py-4 px-5 bg-muted/30 rounded-xl border border-border/50 hover:bg-muted/50 transition-colors group">
                        <div className="flex items-center space-x-4">
                          <div className="w-3 h-3 bg-primary rounded-full animate-pulse shadow-sm"></div>
                          <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">Industrial M&A</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-foreground">€45M</div>
                          <div className="text-xs text-primary font-medium">En Progreso</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between py-4 px-5 bg-muted/30 rounded-xl border border-border/50 hover:bg-muted/50 transition-colors group">
                        <div className="flex items-center space-x-4">
                          <div className="w-3 h-3 bg-warning rounded-full shadow-sm"></div>
                          <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">Retail DD</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-foreground">€18M</div>
                          <div className="text-xs text-warning font-medium">Iniciado</div>
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