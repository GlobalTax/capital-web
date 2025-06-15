
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
            {/* Chart Container - Same style as homepage */}
            <div className="bg-white rounded-2xl p-8 shadow-2xl border border-gray-100 relative overflow-hidden">
              {/* Header */}
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-xl font-bold text-black">Ingresos 2024</h3>
                  <p className="text-gray-500 text-sm">Crecimiento mensual</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-black">€2.4M</div>
                  <div className="text-sm text-green-600">+12%</div>
                </div>
              </div>

              {/* Chart Area */}
              <div className="h-64 relative mb-8">
                {/* Background Grid */}
                <div className="absolute inset-0 grid grid-cols-6 gap-4 opacity-20">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="border-r border-gray-200 last:border-r-0"></div>
                  ))}
                </div>
                
                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-400 -ml-8">
                  <span>500k</span>
                  <span>400k</span>
                  <span>300k</span>
                  <span>200k</span>
                  <span>100k</span>
                  <span>0</span>
                </div>
                
                {/* Chart Bars */}
                <div className="flex items-end justify-between h-full pt-4 px-2">
                  <div className="flex flex-col items-center space-y-2 flex-1">
                    <div className="bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-md shadow-lg" 
                         style={{height: '60%', width: '24px'}}></div>
                    <span className="text-xs text-gray-600 font-medium">Ene</span>
                  </div>
                  <div className="flex flex-col items-center space-y-2 flex-1">
                    <div className="bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t-md shadow-lg" 
                         style={{height: '75%', width: '24px'}}></div>
                    <span className="text-xs text-gray-600 font-medium">Feb</span>
                  </div>
                  <div className="flex flex-col items-center space-y-2 flex-1">
                    <div className="bg-gradient-to-t from-amber-500 to-amber-400 rounded-t-md shadow-lg" 
                         style={{height: '45%', width: '24px'}}></div>
                    <span className="text-xs text-gray-600 font-medium">Mar</span>
                  </div>
                  <div className="flex flex-col items-center space-y-2 flex-1">
                    <div className="bg-gradient-to-t from-purple-500 to-purple-400 rounded-t-md shadow-lg" 
                         style={{height: '90%', width: '24px'}}></div>
                    <span className="text-xs text-gray-600 font-medium">Abr</span>
                  </div>
                  <div className="flex flex-col items-center space-y-2 flex-1">
                    <div className="bg-gradient-to-t from-rose-500 to-rose-400 rounded-t-md shadow-lg" 
                         style={{height: '65%', width: '24px'}}></div>
                    <span className="text-xs text-gray-600 font-medium">May</span>
                  </div>
                  <div className="flex flex-col items-center space-y-2 flex-1">
                    <div className="bg-gradient-to-t from-indigo-500 to-indigo-400 rounded-t-md shadow-lg" 
                         style={{height: '85%', width: '24px'}}></div>
                    <span className="text-xs text-gray-600 font-medium">Jun</span>
                  </div>
                </div>
              </div>
              
              {/* Bottom Stats */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
                <div className="text-center">
                  <div className="text-lg font-bold text-black">24</div>
                  <div className="text-xs text-gray-500">Clientes</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-black">98%</div>
                  <div className="text-xs text-gray-500">Satisfacción</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-black">15</div>
                  <div className="text-xs text-gray-500">Años exp.</div>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -top-2 -right-2 w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full opacity-60"></div>
              <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-gradient-to-tr from-emerald-100 to-blue-100 rounded-full opacity-40"></div>
            </div>
            
            {/* Floating indicators - Same style as homepage */}
            <div className="absolute -top-6 -right-6 bg-black text-white rounded-xl p-4 shadow-xl">
              <div className="text-center">
                <div className="text-lg font-bold">+23%</div>
                <div className="text-xs text-gray-300">Crecimiento</div>
              </div>
            </div>
            
            <div className="absolute -bottom-6 -left-6 bg-white border-2 border-green-500 rounded-xl p-4 shadow-xl">
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">€2.4M</div>
                <div className="text-xs text-gray-600">Ingresos</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VentaEmpresasHero;
