import React from 'react';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import ErrorBoundary from '@/components/ErrorBoundary';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
const Hero = () => {
  const { isOnline } = useNetworkStatus();
  
  return (
    <ErrorBoundary fallback={<div className="min-h-screen flex items-center justify-center bg-background"><p>Error cargando la sección principal</p></div>}>
      <section className="pt-32 pb-20 bg-[hsl(var(--color-bg-light))] min-h-screen flex items-center rounded-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          {/* Left Column - Content */}
          <div className="lg:col-span-7">
            <div className="inline-flex items-center px-4 py-2 bg-[hsl(var(--color-primary))] text-white rounded-lg text-sm font-medium mb-8">
              Líderes en M&A desde 2008
            </div>
            
            <h1 className="text-[var(--font-size-h1)] font-bold text-[hsl(var(--color-text))] mb-8 leading-tight">Especialistas en compraventa de empresas</h1>
            
            <p className="text-[var(--font-size-body)] text-[hsl(var(--color-text-muted))] mb-12 leading-[var(--line-height)] max-w-2xl">
              Especialistas en compraventa de empresas con más de 15 años de experiencia. 
              Te acompañamos en cada paso para lograr el mejor precio.
            </p>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-8 mb-12 py-8">
              <div className="text-center">
                <div className="text-[var(--font-size-h2)] font-bold text-[hsl(var(--color-primary))] mb-2">€1.0B+</div>
                <div className="text-sm text-[hsl(var(--color-text-muted))]">Valor Transaccional</div>
              </div>
              <div className="text-center">
                <div className="text-[var(--font-size-h2)] font-bold text-[hsl(var(--color-primary))] mb-2">200+</div>
                <div className="text-sm text-[hsl(var(--color-text-muted))]">Operaciones</div>
              </div>
              <div className="text-center">
                <div className="text-[var(--font-size-h2)] font-bold text-[hsl(var(--color-primary))] mb-2">95%</div>
                <div className="text-sm text-[hsl(var(--color-text-muted))]">Éxito</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-6">
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

          {/* Right Column - Interactive Dashboard */}
          <div className="lg:col-span-5">
            <div className="relative">
              {/* Main Dashboard Card */}
              <div className="bg-[hsl(var(--color-bg-white))] rounded-lg shadow-[var(--shadow-lg)] overflow-hidden border border-[hsl(var(--color-border))]">
                <div className="bg-[hsl(var(--color-primary))] text-white p-6">
                  <h3 className="text-lg font-semibold mb-2">Capittal Market </h3>
                  <p className="text-gray-300 text-sm">Análisis en tiempo real</p>
                </div>
                
                {/* Market Data Table */}
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-[hsl(var(--color-success))] rounded-full"></div>
                        <span className="font-medium text-[hsl(var(--color-text))]">Tech Startup</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-[hsl(var(--color-text))]">€15M</div>
                        <div className="text-sm text-[hsl(var(--color-success))]">+12%</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between py-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-[hsl(var(--color-primary))] rounded-full"></div>
                        <span className="font-medium text-[hsl(var(--color-text))]">Industrial Co.</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-[hsl(var(--color-text))]">€45M</div>
                        <div className="text-sm text-[hsl(var(--color-primary))]">+8%</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between py-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-[hsl(var(--color-accent))] rounded-full"></div>
                        <span className="font-medium text-[hsl(var(--color-text))]">Retail Chain</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-[hsl(var(--color-text))]">€32M</div>
                        <div className="text-sm text-[hsl(var(--color-accent))]">+15%</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-[hsl(var(--color-border))]">
                    <div className="flex items-center justify-between">
                      <span className="text-[hsl(var(--color-text-muted))]">Transacciones Q4</span>
                      <span className="font-bold text-[hsl(var(--color-text))]">47 activas</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating Stats */}
              <div className="absolute -top-4 -right-4 bg-[hsl(var(--color-primary))] text-white rounded-lg p-4 shadow-[var(--shadow-lg)]">
                <div className="flex items-center space-x-2">
                  <div>
                    <div className="font-bold">+23%</div>
                    <div className="text-xs text-gray-300">Este mes</div>
                  </div>
                </div>
              </div>
              
              <div className="absolute -bottom-4 -left-4 bg-[hsl(var(--color-bg-white))] border border-[hsl(var(--color-border))] rounded-lg p-4 shadow-[var(--shadow-lg)]">
                <div className="flex items-center space-x-2">
                  <div>
                    <div className="font-bold text-[hsl(var(--color-text))]">156</div>
                    <div className="text-xs text-[hsl(var(--color-text-muted))]">Empresas</div>
                  </div>
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