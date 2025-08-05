import React from 'react';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import ErrorBoundary from '@/components/ErrorBoundary';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
const Hero = () => {
  const { isOnline } = useNetworkStatus();
  
  return (
    <ErrorBoundary fallback={<div className="min-h-screen flex items-center justify-center bg-background"><p>Error cargando la sección principal</p></div>}>
      <section className="pt-32 pb-24 bg-background min-h-screen flex items-center">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            {/* Left Column - Content */}
            <div className="lg:col-span-1">
              <div className="mb-8">
                <div className="inline-flex items-center px-4 py-2 bg-legal-accent text-legal-accent-foreground rounded-lg text-sm font-medium mb-8">
                  Líderes en M&A desde 2008
                </div>
                
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-normal text-foreground mb-8 leading-tight tracking-tight">
                  Especialistas en compraventa de empresas
                </h1>
                
                <p className="text-lg text-muted-foreground mb-12 leading-relaxed font-normal max-w-xl">
                  Especialistas en compraventa de empresas con más de 15 años de experiencia. 
                  Te acompañamos en cada paso para lograr el mejor precio.
                </p>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-8 mb-12 py-8 border-t border-b border-border">
                <div className="text-center">
                  <div className="text-2xl font-medium text-foreground mb-2">€1.0B+</div>
                  <div className="text-sm text-muted-foreground font-normal">Valor Transaccional</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-medium text-foreground mb-2">200+</div>
                  <div className="text-sm text-muted-foreground font-normal">Operaciones</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-medium text-foreground mb-2">95%</div>
                  <div className="text-sm text-muted-foreground font-normal">Éxito</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <InteractiveHoverButton 
                  text="Valorar mi empresa" 
                  variant="primary" 
                  size="lg" 
                  disabled={!isOnline}
                />
                
                <InteractiveHoverButton 
                  text="Ver Casos de Éxito" 
                  variant="secondary" 
                  size="lg"
                  disabled={!isOnline}
                />
              </div>
            </div>

            {/* Right Column - Professional Overview */}
            <div className="lg:col-span-1">
              <div className="bg-card border border-border rounded-lg p-8 shadow-sm">
                <div className="mb-6">
                  <h3 className="text-xl font-normal text-foreground mb-2">Resumen de Mercado</h3>
                  <p className="text-muted-foreground text-sm font-normal">Análisis profesional actualizado</p>
                </div>
                
                {/* Professional Data */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between py-4 border-b border-border">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span className="font-normal text-foreground">Tech Startup</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-foreground">€15M</div>
                      <div className="text-sm text-success">+12%</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between py-4 border-b border-border">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-legal-accent rounded-full"></div>
                      <span className="font-normal text-foreground">Industrial Co.</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-foreground">€45M</div>
                      <div className="text-sm text-success">+8%</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between py-4 border-b border-border">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span className="font-normal text-foreground">Retail Chain</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-foreground">€32M</div>
                      <div className="text-sm text-success">+15%</div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 pt-6 border-t border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground font-normal">Transacciones Q4</span>
                    <span className="font-medium text-foreground">47 activas</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </ErrorBoundary>
  );
};
export default Hero;