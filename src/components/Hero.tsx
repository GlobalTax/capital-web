import React from 'react';
import { Link } from 'react-router-dom';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import ErrorBoundary from '@/components/ErrorBoundary';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

const Hero = () => {
  const { isOnline } = useNetworkStatus();

  const benefits = [
    { text: "Máximo precio de venta garantizado" },
    { text: "Proceso 100% confidencial" },
    { text: "Experiencia en +200 operaciones" },
    { text: "Equipo multidisciplinar de 60+ profesionales" }
  ];

  return (
    <ErrorBoundary fallback={<div className="min-h-screen flex items-center justify-center bg-background"><p>Error cargando la sección principal</p></div>}>
      <section className="relative py-20 md:py-32 bg-background overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            
            {/* Content Left */}
            <div className="text-center lg:text-left">
              <div className="flex flex-col sm:flex-row gap-3 mb-8">
                <div className="inline-flex items-center bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
                  Antes Looper · Ahora Capittal
                </div>
                <div className="inline-flex items-center bg-muted border border-border text-slate-900 px-4 py-2 rounded-full text-sm font-medium">
                  Líderes en M&A desde 2008
                </div>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
                Especialistas en{" "}
                <span className="text-primary">compraventa</span>{" "}
                de empresas
              </h1>
              
              <p className="text-lg md:text-xl text-slate-600 mb-8 max-w-2xl mx-auto lg:mx-0">
                Maximizamos el valor de tu empresa con un equipo multidisciplinar 
                de más de 60 profesionales y resultados garantizados.
              </p>

              {/* Benefits */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center justify-center lg:justify-start">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mr-3"></div>
                    <span className="text-sm font-medium text-slate-700">{benefit.text}</span>
                  </div>
                ))}
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-2 gap-8 mb-10">
                <div>
                  <div className="text-3xl font-bold text-slate-900 mb-2">€902M</div>
                  <div className="text-slate-600">Valor Transaccional</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-slate-900 mb-2">98,7%</div>
                  <div className="text-slate-600">Tasa de Éxito</div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to="/lp/calculadora">
                  <InteractiveHoverButton 
                    text="Valorar Empresa" 
                    variant="primary" 
                    size="lg" 
                    disabled={!isOnline} 
                  />
                </Link>
                <Link to="/casos-exito">
                  <InteractiveHoverButton 
                    text="Ver Casos" 
                    variant="secondary" 
                    size="lg" 
                    disabled={!isOnline} 
                  />
                </Link>
              </div>
            </div>

            {/* Enhanced Visual Right */}
            <div className="relative">
              {/* Floating Badge - Top */}
              <div className="absolute -top-3 -left-3 z-10">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium shadow-lg">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
                  🎯 Líderes en M&A
                </div>
              </div>

              {/* Floating Badge - Bottom Right */}
              <div className="absolute -bottom-3 -right-3 z-10">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-sm font-medium shadow-lg">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
                  ✅ Resultados Garantizados
                </div>
              </div>

              {/* Enhanced Dashboard Card */}
              <div className="bg-card border border-border rounded-xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-slate-900">Capittal Market</h3>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-slate-600 font-medium">Live</span>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-4 text-center mb-6">
                    <div>
                      <div className="text-2xl font-bold text-slate-900">200+</div>
                      <div className="text-xs text-slate-600">Operaciones</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-slate-900">€902M</div>
                      <div className="text-xs text-slate-600">Valor Total</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-slate-900">60+</div>
                      <div className="text-xs text-slate-600">Especialistas</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                        <span className="font-medium text-slate-900">Industrial Tech</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-slate-900">€45M</div>
                        <div className="text-sm text-emerald-600 font-medium">+15%</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="font-medium text-slate-900">Retail Chain</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-slate-900">€32M</div>
                        <div className="text-sm text-blue-600 font-medium">+12%</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                        <span className="font-medium text-slate-900">SaaS Platform</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-slate-900">€28M</div>
                        <div className="text-sm text-purple-600 font-medium">+18%</div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-border pt-4">
                    <div className="text-sm font-medium text-slate-900 mb-2">Sectores Activos</div>
                    <div className="flex flex-wrap gap-2">
                      {['Industrial', 'Tech', 'Retail', 'SaaS'].map((sector) => (
                        <span key={sector} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                          {sector}
                        </span>
                      ))}
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