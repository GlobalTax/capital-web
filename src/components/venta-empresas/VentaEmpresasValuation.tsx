
import React from 'react';

const VentaEmpresasValuation = () => {
  const factors = [
    {
      title: 'Rentabilidad y Crecimiento',
      description: 'EBITDA, márgenes, tendencia de crecimiento y proyecciones futuras',
      impact: 'Alto',
      weight: '30%'
    },
    {
      title: 'Flujo de Caja',
      description: 'Generación de caja libre, predictibilidad y estabilidad de ingresos',
      impact: 'Alto',
      weight: '25%'
    },
    {
      title: 'Equipo Directivo',
      description: 'Calidad del management, dependencia del fundador y estructura organizativa',
      impact: 'Medio',
      weight: '15%'
    },
    {
      title: 'Posición Competitiva',
      description: 'Cuota de mercado, diferenciación, barreras de entrada y ventajas competitivas',
      impact: 'Alto',
      weight: '20%'
    },
    {
      title: 'Diversificación',
      description: 'Base de clientes, proveedores, productos y diversificación geográfica',
      impact: 'Medio',
      weight: '10%'
    }
  ];

  const multiples = [
    { sector: 'Manufactura', range: '3.3x - 7.2x', median: '6.2x', description: 'Empresas familiares sólidas' },
    { sector: 'Servicios', range: '2.9x - 6.7x', median: '5.8x', description: 'Base amplia de PyMEs' },
    { sector: 'Construcción', range: '2.8x - 6.2x', median: '5.5x', description: 'Sector tradicional español' },
    { sector: 'Retail', range: '2.6x - 6.4x', median: '5.2x', description: 'Comercio familiar' },
    { sector: 'Alimentación', range: '3.1x - 6.8x', median: '5.9x', description: 'Industria agroalimentaria' },
    { sector: 'Tecnología', range: '3.4x - 7.8x', median: '6.8x', description: 'Sector de alto crecimiento' }
  ];

  const optimizaciones = [
    'Diversifica tu base de clientes',
    'Profesionaliza la gestión',
    'Mejora los márgenes operativos',
    'Documenta procesos y sistemas',
    'Reduce la dependencia del fundador'
  ];

  return (
    <section id="valoracion" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-black mb-6">
            Factores que Determinan la Valoración
          </h2>
          <p className="text-lg text-black max-w-3xl mx-auto">
            Entender qué factores influyen en el valor de tu empresa te ayudará a 
            prepararte mejor para la venta y maximizar el precio final.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-16">
          <div>
            <h3 className="text-xl font-bold text-black mb-8">
              Principales Factores de Valoración
            </h3>
            <div className="space-y-6">
              {factors.map((factor, index) => {
                return (
                  <div key={index} className="bg-white border border-gray-300 rounded-lg shadow-sm p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out">
                    <div className="flex items-start space-x-4">
                      <div className="bg-gray-50 text-gray-300 rounded-lg w-8 h-8 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-medium">{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="text-base font-bold text-black">{factor.title}</h4>
                          <div className="text-right">
                            <div className="px-3 py-1 rounded-full text-xs font-medium bg-muted text-foreground">
                              {factor.impact}
                            </div>
                            <div className="text-xs text-black mt-1">{factor.weight}</div>
                          </div>
                        </div>
                        <p className="text-black text-sm">{factor.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold text-black mb-8">
              Múltiplos EBITDA por Sector
            </h3>
            <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out bg-gray-50 mb-8">
              <div className="space-y-4">
                {multiples.map((multiple, index) => (
                  <div key={index} className="flex justify-between items-center py-3 border-b border-gray-200 last:border-b-0">
                    <div>
                      <div className="font-semibold text-black">{multiple.sector}</div>
                      <div className="text-sm text-black">{multiple.description}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg text-black">{multiple.median}</div>
                      <div className="text-sm text-black">{multiple.range}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out">
              <h4 className="text-lg font-bold text-black mb-6">
                Optimiza el Valor de tu Empresa
              </h4>
              <ul className="space-y-3">
                {optimizaciones.map((opt, index) => (
                  <li key={index} className="flex items-center space-x-3">
                    <div className="w-1.5 h-1.5 bg-gray-300 rounded-full flex-shrink-0" />
                    <span className="text-black">{opt}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VentaEmpresasValuation;
