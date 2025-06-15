
import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight, TrendingUp } from 'lucide-react';

const VentaEmpresasHero = () => {
  const benefits = [
    'Maximizamos el valor de tu empresa',
    'Proceso confidencial y profesional',
    'Acceso a compradores cualificados',
    'Asesoramiento integral durante todo el proceso'
  ];

  return (
    <section className="bg-white py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center bg-gray-100 rounded-full px-4 py-2 mb-6">
              <TrendingUp className="h-4 w-4 text-black mr-2" />
              <span className="text-sm font-medium text-black">Especialistas en M&A</span>
            </div>

            <h1 className="text-3xl lg:text-4xl font-bold text-black mb-6 leading-tight">
              Vende tu Empresa al
              <span className="block text-gray-600">Mejor Precio</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Más de 15 años de experiencia ayudando a empresarios a obtener 
              el máximo valor por sus negocios. Proceso confidencial y resultados garantizados.
            </p>

            <div className="space-y-4 mb-10">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">{benefit}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="capittal-button text-lg px-8 py-4 group">
                Solicitar Valoración Gratuita
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="outline" className="text-lg px-8 py-4 border-black hover:bg-gray-50">
                Descargar Guía
              </Button>
            </div>
          </div>

          <div className="relative">
            {/* Main Dashboard Card */}
            <div className="bg-white rounded-lg border border-gray-300 shadow-lg overflow-hidden">
              <div className="bg-gray-900 text-white p-6">
                <h3 className="text-lg font-semibold mb-2">Panel de Ventas M&A</h3>
                <p className="text-gray-300 text-sm">Transacciones en proceso</p>
              </div>
              
              {/* Market Data Table */}
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-gray-300">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="font-medium text-gray-900">SaaS Platform</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900">€8.5M</div>
                      <div className="text-sm text-green-600">En proceso</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between py-3 border-b border-gray-300">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="font-medium text-gray-900">Manufacturing</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900">€25M</div>
                      <div className="text-sm text-blue-600">Due Diligence</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span className="font-medium text-gray-900">E-commerce</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900">€12M</div>
                      <div className="text-sm text-orange-600">Negociación</div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-300">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Ventas completadas Q4</span>
                    <span className="font-bold text-gray-900">12 cerradas</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating Stats */}
            <div className="absolute -top-4 -right-4 bg-black text-white rounded-lg p-4 shadow-lg">
              <div className="flex items-center space-x-2">
                <div>
                  <div className="font-bold">€45M</div>
                  <div className="text-xs text-gray-300">Vendido</div>
                </div>
              </div>
            </div>
            
            <div className="absolute -bottom-4 -left-4 bg-white border border-gray-300 rounded-lg p-4 shadow-lg">
              <div className="flex items-center space-x-2">
                <div>
                  <div className="font-bold text-gray-900">4.2x</div>
                  <div className="text-xs text-gray-500">Múltiplo</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VentaEmpresasHero;
