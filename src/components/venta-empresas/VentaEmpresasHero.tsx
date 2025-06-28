
import React from 'react';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';

const VentaEmpresasHero = () => {
  const benefits = [
    'Maximizamos el valor de tu empresa',
    'Proceso confidencial y profesional',
    'Acceso a compradores cualificados',
    'Asesoramiento integral durante todo el proceso'
  ];

  const empresasEnVenta = [
    { nombre: 'Tech Startup', valor: '€15M', crecimiento: '+12%', tipo: 'Tecnología' },
    { nombre: 'Industrial Co.', valor: '€45M', crecimiento: '+8%', tipo: 'Industrial' },
    { nombre: 'Retail Chain', valor: '€32M', crecimiento: '+15%', tipo: 'Retail' },
    { nombre: 'Healthcare Ltd.', valor: '€28M', crecimiento: '+10%', tipo: 'Salud' },
    { nombre: 'Energy Solutions', valor: '€67M', crecimiento: '+6%', tipo: 'Energía' }
  ];

  return (
    <section className="pt-32 pb-20 bg-white min-h-screen flex items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center bg-gray-100 rounded-full px-4 py-2 mb-6">
              <span className="text-sm font-medium text-black">Especialistas en M&A</span>
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-black mb-6 leading-tight">
              Vende tu Empresa al Mejor Precio
            </h1>
            
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Más de 15 años de experiencia ayudando a empresarios a obtener 
              el máximo valor por sus negocios. Proceso confidencial y resultados garantizados.
            </p>

            <div className="space-y-4 mb-10">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full flex-shrink-0" />
                  <span className="text-gray-600">{benefit}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <InteractiveHoverButton 
                text="Solicitar Valoración Gratuita"
                variant="primary"
                size="lg"
              />
              <InteractiveHoverButton 
                text="Descargar Guía"
                variant="outline"
                size="lg"
              />
            </div>
          </div>

          <div className="relative">
            {/* Market Dashboard Container */}
            <div className="bg-white rounded-2xl p-8 shadow-2xl border border-gray-100 relative overflow-hidden">
              {/* Header */}
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-xl font-bold text-black">Capittal Market Dashboard</h3>
                  <p className="text-gray-500 text-sm">Análisis en tiempo real</p>
                </div>
                <div className="bg-gray-100 rounded-lg px-3 py-1 text-sm font-semibold text-black">
                  +23% Este mes
                </div>
              </div>

              {/* Empresas List */}
              <div className="space-y-4 mb-8">
                {empresasEnVenta.map((empresa, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <div className="w-5 h-5 bg-white rounded-sm" />
                      </div>
                      <div>
                        <div className="font-semibold text-black">{empresa.nombre}</div>
                        <div className="text-xs text-gray-500">{empresa.tipo}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-black">{empresa.valor}</div>
                      <div className="text-green-600 text-sm font-semibold">{empresa.crecimiento}</div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Bottom Stats */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
                <div className="text-center">
                  <div className="text-lg font-bold text-black">156</div>
                  <div className="text-xs text-gray-500">Empresas</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-black">Q4 2024</div>
                  <div className="text-xs text-gray-500">Transacciones</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-black">47</div>
                  <div className="text-xs text-gray-500">Activas</div>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -top-2 -right-2 w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full opacity-60"></div>
              <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-gradient-to-tr from-emerald-100 to-blue-100 rounded-full opacity-40"></div>
            </div>
            
            {/* Floating indicators */}
            <div className="absolute -top-6 -right-6 bg-black text-white rounded-xl p-4 shadow-xl">
              <div className="text-center">
                <div className="text-lg font-bold">€187M</div>
                <div className="text-xs text-gray-300">Valor Total</div>
              </div>
            </div>
            
            <div className="absolute -bottom-6 -left-6 bg-white border-2 border-green-500 rounded-xl p-4 shadow-xl">
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">23</div>
                <div className="text-xs text-gray-600">Vendidas</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VentaEmpresasHero;
