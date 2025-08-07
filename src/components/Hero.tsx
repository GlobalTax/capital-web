import React from 'react';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import ErrorBoundary from '@/components/ErrorBoundary';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
const Hero = () => {
  const { isOnline } = useNetworkStatus();
  
  return (
    <ErrorBoundary fallback={<div className="min-h-screen flex items-center justify-center bg-background"><p>Error cargando la sección principal</p></div>}>
      <section className="pt-32 pb-20 bg-white min-h-screen flex items-center rounded-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          {/* Left Column - Content */}
          <div className="lg:col-span-7">
            <div className="inline-flex items-center px-4 py-2 bg-black text-white rounded-lg text-sm font-medium mb-8">
              Líderes en M&A desde 2008
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-black mb-12 leading-tight tracking-tight">Especialistas en compraventa de empresas</h1>
            
            <p className="text-xl md:text-2xl text-gray-700 mb-16 leading-relaxed max-w-3xl font-medium">
              Maximizamos el valor de tu empresa con resultados garantizados
            </p>

            {/* Stats Row - Simplified */}
            <div className="grid grid-cols-2 gap-16 mb-16 py-12">
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-black mb-4">€1.0B+</div>
                <div className="text-base text-gray-600 font-medium">Valor Transaccional</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-black mb-4">95%</div>
                <div className="text-base text-gray-600 font-medium">Tasa de Éxito</div>
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
              {/* Minimalist Dashboard Card */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gray-900 text-white px-8 py-6">
                  <h3 className="text-xl font-semibold">Capittal Market</h3>
                </div>
                
                {/* Simplified Market Data */}
                <div className="px-8 py-10">
                  <div className="space-y-8">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="font-semibold text-gray-900 text-lg">Tech Startup</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900 text-xl">€15M</div>
                        <div className="text-sm text-green-600 font-medium">+12%</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="font-semibold text-gray-900 text-lg">Industrial Co.</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900 text-xl">€45M</div>
                        <div className="text-sm text-blue-600 font-medium">+8%</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                        <span className="font-semibold text-gray-900 text-lg">Retail Chain</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900 text-xl">€32M</div>
                        <div className="text-sm text-purple-600 font-medium">+15%</div>
                      </div>
                    </div>
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