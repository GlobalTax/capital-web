
import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight, TrendingUp, Eye, Users, Target } from 'lucide-react';

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

            <h1 className="text-2xl font-bold text-black mb-6 leading-tight">
              Vende tu Empresa al Mejor Precio
            </h1>
            
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
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
            {/* Modern Card-based Dashboard */}
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 shadow-2xl border border-gray-100">
              {/* Header with metrics */}
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-xl font-bold text-black mb-1">Ventas Activas</h3>
                  <p className="text-gray-500 text-sm">Transacciones Q4 2024</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-black">€87M</div>
                  <div className="text-sm text-green-600">+23% vs Q3</div>
                </div>
              </div>
              
              {/* Progress cards */}
              <div className="space-y-4 mb-8">
                <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                      <span className="font-semibold text-gray-900">TechFlow Solutions</span>
                    </div>
                    <Eye className="h-4 w-4 text-gray-400" />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-black">€15.2M</span>
                    <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-medium">
                      Cierre próximo
                    </span>
                  </div>
                  <div className="mt-3 bg-gray-100 rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{width: '85%'}}></div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="font-semibold text-gray-900">Industrial Group</span>
                    </div>
                    <Users className="h-4 w-4 text-gray-400" />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-black">€32M</span>
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                      Due Diligence
                    </span>
                  </div>
                  <div className="mt-3 bg-gray-100 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{width: '60%'}}></div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                      <span className="font-semibold text-gray-900">RetailMax Chain</span>
                    </div>
                    <Target className="h-4 w-4 text-gray-400" />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-black">€8.7M</span>
                    <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-medium">
                      Negociación
                    </span>
                  </div>
                  <div className="mt-3 bg-gray-100 rounded-full h-2">
                    <div className="bg-amber-500 h-2 rounded-full" style={{width: '40%'}}></div>
                  </div>
                </div>
              </div>
              
              {/* Bottom stats */}
              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-200">
                <div className="text-center">
                  <div className="text-lg font-bold text-black">18</div>
                  <div className="text-xs text-gray-500">Operaciones activas</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-black">4.8x</div>
                  <div className="text-xs text-gray-500">Múltiplo promedio</div>
                </div>
              </div>
            </div>
            
            {/* Floating indicators */}
            <div className="absolute -top-6 -right-6 bg-black text-white rounded-xl p-4 shadow-xl">
              <div className="text-center">
                <div className="text-lg font-bold">€125M</div>
                <div className="text-xs text-gray-300">Pipeline total</div>
              </div>
            </div>
            
            <div className="absolute -bottom-6 -left-6 bg-white border-2 border-green-500 rounded-xl p-4 shadow-xl">
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">92%</div>
                <div className="text-xs text-gray-600">Tasa éxito</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VentaEmpresasHero;
