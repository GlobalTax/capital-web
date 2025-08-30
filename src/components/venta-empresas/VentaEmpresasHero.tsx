import React from 'react';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import { Badge } from '@/components/ui/badge';

const VentaEmpresasHero = () => {
  const benefits = [
    "Maximizamos el valor de tu empresa",
    "Proceso confidencial y profesional", 
    "Red de compradores cualificados",
    "Acompañamiento integral"
  ];

  const empresasEnVenta = [
    {
      nombre: "TechSolutions SL",
      valor: "€2.5M",
      crecimiento: "+15%",
      tipo: "SaaS"
    },
    {
      nombre: "Industrial Parts SA",
      valor: "€1.8M", 
      crecimiento: "+8%",
      tipo: "Manufacturing"
    },
    {
      nombre: "RetailFlow SL",
      valor: "€3.2M",
      crecimiento: "+22%",
      tipo: "E-commerce"
    },
    {
      nombre: "Consulting Pro SA", 
      valor: "€1.1M",
      crecimiento: "+12%",
      tipo: "Services"
    }
  ];

  return (
    <section className="relative py-20 overflow-hidden bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Content Section */}
          <div className="space-y-8">
            <div>
              {/* Success Badge */}
              <Badge className="mb-6 bg-green-50 text-green-700 border-green-200 px-4 py-2 text-sm font-medium">
                🏆 +200 operaciones completadas
              </Badge>
              
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
                Vende tu Empresa al Mejor Precio, con{' '}
                <span className="text-blue-600">Confidencialidad y Resultados</span>
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                En Capittal acompañamos a empresarios en procesos de venta con una metodología 
                contrastada que maximiza el valor y minimiza riesgos.
              </p>
              
              <ul className="space-y-3 mb-8">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center text-gray-700">
                    <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <InteractiveHoverButton 
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold"
                onClick={() => document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' })}
              >
                📊 Solicitar Valoración Gratuita
              </InteractiveHoverButton>
              
              <InteractiveHoverButton 
                variant="outline" 
                className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-4 text-lg font-semibold"
              >
                📞 Hablar con un Experto
              </InteractiveHoverButton>
            </div>
          </div>

          {/* Dashboard Visualization */}
          <div className="relative">
            <div className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-100">
              
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Capittal Market Dashboard</h3>
                <div className="flex items-center text-green-600 text-sm font-medium">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  +12% este mes
                </div>
              </div>

              {/* Companies List */}
              <div className="space-y-4 mb-6">
                {empresasEnVenta.map((empresa, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">{empresa.nombre}</div>
                      <div className="text-sm text-gray-500">{empresa.tipo}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">{empresa.valor}</div>
                      <div className="text-sm text-green-600">{empresa.crecimiento}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer Stats */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">47</div>
                  <div className="text-sm text-gray-500">Empresas</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">€89M</div>
                  <div className="text-sm text-gray-500">Transacciones</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">23</div>
                  <div className="text-sm text-gray-500">Activas</div>
                </div>
              </div>
            </div>

            {/* Floating indicators */}
            <div className="absolute -top-4 -right-4 bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
              Valor Total: €12.6M
            </div>
            
            <div className="absolute -bottom-4 -left-4 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
              3 Vendidas
            </div>

            {/* Gradient decorations */}
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 to-purple-500/5 rounded-2xl -z-10 transform rotate-1"></div>
            <div className="absolute inset-0 bg-gradient-to-bl from-green-500/5 to-blue-500/5 rounded-2xl -z-20 transform -rotate-1"></div>
          </div>
        </div>
      </div>
    </section>
  );
};
export default VentaEmpresasHero;