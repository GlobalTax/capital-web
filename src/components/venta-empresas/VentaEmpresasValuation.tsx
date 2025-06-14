
import React from 'react';
import { BarChart3, DollarSign, Users2, Zap, Shield, Rocket } from 'lucide-react';

const VentaEmpresasValuation = () => {
  const factors = [
    {
      icon: BarChart3,
      title: 'Rentabilidad y Crecimiento',
      description: 'EBITDA, márgenes, tendencia de crecimiento y proyecciones futuras',
      impact: 'Alto',
      weight: '30%'
    },
    {
      icon: DollarSign,
      title: 'Flujo de Caja',
      description: 'Generación de caja libre, predictibilidad y estabilidad de ingresos',
      impact: 'Alto',
      weight: '25%'
    },
    {
      icon: Users2,
      title: 'Equipo Directivo',
      description: 'Calidad del management, dependencia del fundador y estructura organizativa',
      impact: 'Medio',
      weight: '15%'
    },
    {
      icon: Zap,
      title: 'Posición Competitiva',
      description: 'Cuota de mercado, diferenciación, barreras de entrada y ventajas competitivas',
      impact: 'Alto',
      weight: '20%'
    },
    {
      icon: Shield,
      title: 'Diversificación',
      description: 'Base de clientes, proveedores, productos y diversificación geográfica',
      impact: 'Medio',
      weight: '10%'
    }
  ];

  const multiples = [
    { sector: 'Salud', range: '3.6x - 8.3x', median: '7.2x', description: 'Múltiplos más altos del mercado' },
    { sector: 'Tecnología', range: '3.4x - 7.8x', median: '6.8x', description: 'Sector de alto crecimiento' },
    { sector: 'Finanzas', range: '3.2x - 7.5x', median: '6.3x', description: 'Estabilidad y regulación' },
    { sector: 'Manufactura', range: '3.3x - 7.2x', median: '6.2x', description: 'Capital intensivo' },
    { sector: 'Servicios', range: '2.9x - 6.7x', median: '5.8x', description: 'Amplio espectro' },
    { sector: 'Retail', range: '2.6x - 6.4x', median: '5.2x', description: 'Competencia intensa' }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-black mb-6">
            Factores que Determinan la Valoración
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Entender qué factores influyen en el valor de tu empresa te ayudará a 
            prepararte mejor para la venta y maximizar el precio final.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div>
            <h3 className="text-2xl font-bold text-black mb-8">
              Principales Factores de Valoración
            </h3>
            <div className="space-y-6">
              {factors.map((factor, index) => {
                const Icon = factor.icon;
                return (
                  <div key={index} className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start space-x-4">
                      <div className="bg-black text-white rounded-lg w-12 h-12 flex items-center justify-center flex-shrink-0">
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="text-lg font-bold text-black">{factor.title}</h4>
                          <div className="text-right">
                            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                              factor.impact === 'Alto' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {factor.impact}
                            </div>
                            <div className="text-sm text-gray-500 mt-1">{factor.weight}</div>
                          </div>
                        </div>
                        <p className="text-gray-600">{factor.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-bold text-black mb-8">
              Múltiplos EBITDA por Sector
            </h3>
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="space-y-4">
                {multiples.map((multiple, index) => (
                  <div key={index} className="flex justify-between items-center py-3 border-b border-gray-200 last:border-b-0">
                    <div>
                      <div className="font-semibold text-black">{multiple.sector}</div>
                      <div className="text-sm text-gray-600">{multiple.description}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg text-black">{multiple.median}</div>
                      <div className="text-sm text-gray-600">{multiple.range}</div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Nota:</strong> Los múltiplos varían significativamente según el tamaño de la empresa, 
                  crecimiento y características específicas. El sector salud presenta los múltiplos más altos del mercado.
                </p>
              </div>
            </div>

            <div className="mt-8 capittal-card">
              <h4 className="text-xl font-bold text-black mb-4">
                Optimiza el Valor de tu Empresa
              </h4>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-center space-x-2">
                  <Rocket className="h-5 w-5 text-green-600" />
                  <span>Diversifica tu base de clientes</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Rocket className="h-5 w-5 text-green-600" />
                  <span>Profesionaliza la gestión</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Rocket className="h-5 w-5 text-green-600" />
                  <span>Mejora los márgenes operativos</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Rocket className="h-5 w-5 text-green-600" />
                  <span>Documenta procesos y sistemas</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Rocket className="h-5 w-5 text-green-600" />
                  <span>Reduce la dependencia del fundador</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VentaEmpresasValuation;
