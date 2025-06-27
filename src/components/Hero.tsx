
import React from 'react';
import { Button } from '@/components/ui/button';
const Hero = () => {
  return <section className="pt-32 pb-20 bg-white min-h-screen flex items-center rounded-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          {/* Left Column - Content */}
          <div className="lg:col-span-7">
            <div className="inline-flex items-center px-4 py-2 bg-black text-white rounded-lg text-sm font-medium mb-8">
              Líderes en M&A desde 2008
            </div>
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-black mb-8 leading-tight">
              Especialista en compraventa de empresas
            </h1>
            
            <p className="text-lg text-gray-600 mb-12 leading-relaxed max-w-2xl">
              Especialistas en compraventa de empresas con más de 15 años de experiencia. 
              Te acompañamos en cada paso para lograr el mejor precio.
            </p>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-8 mb-12 py-8 border-t border-b border-border">
              <div className="text-center">
                <div className="text-2xl font-bold text-black mb-2">€1.0B+</div>
                <div className="text-sm text-gray-600">Valor Transaccional</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-black mb-2">200+</div>
                <div className="text-sm text-gray-600">Operaciones</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-black mb-2">95%</div>
                <div className="text-sm text-gray-600">Éxito</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-6">
              <Button className="bg-white text-black border-0.5 border-border rounded-lg px-12 py-6 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-out text-base">Valorar mi empresa</Button>
              
              <Button variant="outline" className="bg-transparent border-0.5 border-border px-12 py-6 font-normal hover:bg-black hover:text-white transition-all duration-300 shadow-sm text-sm rounded-lg">
                Ver Casos de Éxito
              </Button>
            </div>
          </div>

          {/* Right Column - Interactive Dashboard */}
          <div className="lg:col-span-5">
            <div className="relative">
              {/* Main Dashboard Card */}
              <div className="bg-white rounded-lg border-0.5 border-border shadow-lg overflow-hidden">
                <div className="bg-gray-900 text-white p-6">
                  <h3 className="text-lg font-semibold mb-2">Capittal Market </h3>
                  <p className="text-gray-300 text-sm">Análisis en tiempo real</p>
                </div>
                
                {/* Market Data Table */}
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b border-border">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="font-medium text-gray-900">Tech Startup</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900">€15M</div>
                        <div className="text-sm text-green-600">+12%</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between py-3 border-b border-border">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="font-medium text-gray-900">Industrial Co.</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900">€45M</div>
                        <div className="text-sm text-blue-600">+8%</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between py-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span className="font-medium text-gray-900">Retail Chain</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900">€32M</div>
                        <div className="text-sm text-orange-600">+15%</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-border">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Transacciones Q4</span>
                      <span className="font-bold text-gray-900">47 activas</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating Stats */}
              <div className="absolute -top-4 -right-4 bg-black text-white rounded-lg p-4 shadow-lg">
                <div className="flex items-center space-x-2">
                  <div>
                    <div className="font-bold">+23%</div>
                    <div className="text-xs text-gray-300">Este mes</div>
                  </div>
                </div>
              </div>
              
              <div className="absolute -bottom-4 -left-4 bg-white border-0.5 border-border rounded-lg p-4 shadow-lg">
                <div className="flex items-center space-x-2">
                  <div>
                    <div className="font-bold text-gray-900">156</div>
                    <div className="text-xs text-gray-500">Empresas</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>;
};
export default Hero;
