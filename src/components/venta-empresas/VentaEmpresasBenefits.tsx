
import React from 'react';

const VentaEmpresasBenefits = () => {
  const benefits = [
    {
      title: '+25% incremento de valoración promedio',
      description: 'Utilizamos técnicas avanzadas de valoración y posicionamiento estratégico para obtener el mejor precio posible.',
      icon: '📈',
      stats: '+25%'
    },
    {
      title: 'Confidencialidad total en todas las fases',
      description: 'Proceso completamente confidencial que protege tu empresa, empleados y clientes durante toda la operación.',
      icon: '🔒',
      stats: '100%'
    },
    {
      title: 'Más de 500 compradores activos en nuestra red',
      description: 'Acceso a nuestra extensa red de compradores estratégicos, fondos de inversión y family offices.',
      icon: '🌐',
      stats: '+500'
    },
    {
      title: 'Optimización fiscal y legal para cada operación',
      description: 'Estructuración de la operación para minimizar el impacto fiscal y maximizar el beneficio neto.',
      icon: '⚖️',
      stats: '15% ahorro'
    }
  ];

  const casos = [
    {
      tipo: 'Empresa Tecnológica',
      detalle: 'SaaS B2B - 12M€ facturación',
      resultado: 'Vendida por 48M€ (4x múltiplo)',
      highlight: true
    },
    {
      tipo: 'Distribuidora Industrial',
      detalle: 'Sector industrial - 25M€ facturación',
      resultado: 'Vendida por 65M€ (2.6x múltiplo)',
      highlight: false
    },
    {
      tipo: 'Cadena de Retail',
      detalle: '15 tiendas - 8M€ facturación',
      resultado: 'Vendida por 22M€ (2.75x múltiplo)',
      highlight: false
    }
  ];

  return (
    <section id="beneficios" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            ¿Por Qué Elegir Capittal?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Nuestros resultados hablan por sí solos. Descubre por qué somos la 
            elección preferida de empresarios exitosos.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {benefits.map((benefit, index) => (
            <div key={index} className="text-center group">
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <div className="text-4xl mb-4">{benefit.icon}</div>
                <div className="text-3xl font-bold text-blue-600 mb-2">{benefit.stats}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="text-2xl font-bold text-black mb-8">
              Casos de Éxito Recientes
            </h3>
            <div className="space-y-6">
              {casos.map((caso, index) => (
                <div key={index} className={`border-l-4 ${caso.highlight ? 'border-black bg-gray-50' : 'border-gray-300'} pl-6 py-4 rounded-r-lg`}>
                  <h4 className="font-bold text-lg text-black">{caso.tipo}</h4>
                  <p className="text-gray-600 mb-2">{caso.detalle}</p>
                  <p className="text-green-600 font-semibold">{caso.resultado}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out bg-gray-50">
            <h4 className="text-xl font-bold text-black mb-8 text-center">
              Nuestros Resultados
            </h4>
            <div className="grid grid-cols-2 gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-black mb-2">200+</div>
                <div className="text-gray-600 text-sm">Empresas vendidas</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-black mb-2">€2.5B</div>
                <div className="text-gray-600 text-sm">Valor total</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-black mb-2">85%</div>
                <div className="text-gray-600 text-sm">Tasa de éxito</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-black mb-2">4.2x</div>
                <div className="text-gray-600 text-sm">Múltiplo promedio</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VentaEmpresasBenefits;
