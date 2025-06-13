
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
    { sector: 'Tecnología/SaaS', range: '4x - 8x', median: '6x' },
    { sector: 'Healthcare', range: '3x - 6x', median: '4.5x' },
    { sector: 'Manufacturing', range: '2x - 4x', median: '3x' },
    { sector: 'Retail/Consumer', range: '1.5x - 3x', median: '2.25x' },
    { sector: 'Financial Services', range: '2x - 5x', median: '3.5x' },
    { sector: 'Industrial', range: '2.5x - 4.5x', median: '3.5x' }
  ];

  return (
    <section className="carta-section bg-muted/30">
      <div className="carta-container">
        <div className="text-center mb-16">
          <h2 className="font-semibold text-foreground mb-6">
            Factores que Determinan la Valoración
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Entender qué factores influyen en el valor de tu empresa te ayudará a 
            prepararte mejor para la venta y maximizar el precio final.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div>
            <h3 className="text-2xl font-semibold text-foreground mb-8">
              Principales Factores de Valoración
            </h3>
            <div className="space-y-6">
              {factors.map((factor, index) => {
                const Icon = factor.icon;
                return (
                  <div key={index} className="carta-card">
                    <div className="flex items-start space-x-4">
                      <div className="bg-primary text-primary-foreground rounded-lg w-12 h-12 flex items-center justify-center flex-shrink-0">
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="text-lg font-semibold text-foreground">{factor.title}</h4>
                          <div className="text-right">
                            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                              factor.impact === 'Alto' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                            }`}>
                              {factor.impact}
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">{factor.weight}</div>
                          </div>
                        </div>
                        <p className="text-muted-foreground">{factor.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-semibold text-foreground mb-8">
              Múltiplos por Sector
            </h3>
            <div className="carta-card">
              <div className="space-y-4">
                {multiples.map((multiple, index) => (
                  <div key={index} className="flex justify-between items-center py-3 border-b border-border last:border-b-0">
                    <div>
                      <div className="font-semibold text-foreground">{multiple.sector}</div>
                      <div className="text-sm text-muted-foreground">Rango típico</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg text-foreground">{multiple.median}</div>
                      <div className="text-sm text-muted-foreground">{multiple.range}</div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>Nota:</strong> Los múltiplos están basados en EBITDA y pueden variar 
                  significativamente según el tamaño, crecimiento y características específicas de cada empresa.
                </p>
              </div>
            </div>

            <div className="mt-8 carta-card">
              <h4 className="text-xl font-semibold text-foreground mb-4">
                Optimiza el Valor de tu Empresa
              </h4>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-center space-x-2">
                  <Rocket className="h-5 w-5 text-emerald-600" />
                  <span>Diversifica tu base de clientes</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Rocket className="h-5 w-5 text-emerald-600" />
                  <span>Profesionaliza la gestión</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Rocket className="h-5 w-5 text-emerald-600" />
                  <span>Mejora los márgenes operativos</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Rocket className="h-5 w-5 text-emerald-600" />
                  <span>Documenta procesos y sistemas</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Rocket className="h-5 w-5 text-emerald-600" />
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
