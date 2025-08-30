import React from 'react';
import { TrendingDown, DollarSign, Shield } from 'lucide-react';

const PlanificacionFiscalWhyOptimize = () => {
  const benefits = [
    {
      icon: TrendingDown,
      title: "Reducción de Impuestos",
      description: "Aprovechamos todas las deducciones y exenciones fiscales disponibles para minimizar tu carga tributaria de forma legal y estratégica.",
      highlight: "Hasta 35% ahorro"
    },
    {
      icon: DollarSign,
      title: "Eficiencia en Cash Flow",
      description: "Optimizamos el flujo de caja post-operación estructurando pagos diferidos y mejorando la liquidez empresarial.",
      highlight: "Mejora liquidez"
    },
    {
      icon: Shield,
      title: "Cumplimiento Normativo",
      description: "Evitamos sanciones y contingencias futuras asegurando el pleno cumplimiento de todas las obligaciones fiscales.",
      highlight: "100% compliance"
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">
            ¿Por qué Optimizar la Fiscalidad en M&A?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            La planificación fiscal adecuada puede representar millones de euros en ahorros 
            y marcar la diferencia entre una operación exitosa y una oportunidad perdida.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div key={index} className="bg-white border border-gray-300 rounded-lg p-8 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out text-center group">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-gray-100 transition-colors duration-300">
                <benefit.icon className="w-8 h-8 text-black" />
              </div>
              
              <h3 className="text-xl font-bold text-black mb-4">
                {benefit.title}
              </h3>
              
              <p className="text-gray-600 mb-6 leading-relaxed">
                {benefit.description}
              </p>
              
              <div className="bg-green-50 border border-green-200 rounded-lg py-2 px-4">
                <span className="text-sm font-bold text-green-800">
                  {benefit.highlight}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="bg-white border border-gray-300 rounded-lg p-8 inline-block">
            <p className="text-lg font-semibold text-black mb-2">
              +200 empresas han optimizado su tributación con Capittal
            </p>
            <p className="text-gray-600">
              Generando más de €180M en ahorros fiscales desde 2008
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PlanificacionFiscalWhyOptimize;