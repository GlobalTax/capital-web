
import React from 'react';

const PlanificacionFiscalBenefits = () => {
  const benefits = [
    {
      title: 'Máximo Ahorro Fiscal',
      description: 'Aplicamos todas las estrategias legales disponibles para minimizar la carga tributaria de tu operación.',
      stats: 'Hasta 35% ahorro'
    },
    {
      title: 'Cumplimiento Garantizado',
      description: 'Todas nuestras estrategias están respaldadas por normativa vigente y jurisprudencia consolidada.',
      stats: '100% legal'
    },
    {
      title: 'Planificación Anticipada',
      description: 'Diseñamos estrategias fiscales antes de ejecutar la operación para maximizar los beneficios.',
      stats: '6 meses anticipación'
    },
    {
      title: 'Estructuras Internacionales',
      description: 'Aprovechamos tratados de doble imposición y estructuras internacionales cuando es beneficioso.',
      stats: 'Hasta 50% ahorro'
    },
    {
      title: 'Diferimiento Fiscal',
      description: 'Estructuramos operaciones para diferir el impacto fiscal y mejorar el flujo de caja.',
      stats: '5-10 años diferimiento'
    },
    {
      title: 'Asesoramiento Continuo',
      description: 'Seguimiento fiscal post-operación para mantener los beneficios fiscales obtenidos.',
      stats: '24 meses seguimiento'
    }
  ];

  const casosExito = [
    {
      operacion: 'Venta Tecnológica',
      ahorro: '€2.8M',
      estrategia: 'Diferimiento + Exención participación',
      porcentaje: '42%',
      highlight: true
    },
    {
      operacion: 'Fusión Industrial',
      ahorro: '€1.2M',
      estrategia: 'Régimen especial fusiones',
      porcentaje: '28%',
      highlight: false
    },
    {
      operacion: 'Spin-off Familiar',
      ahorro: '€900K',
      estrategia: 'Exención reinversión + Diferimiento',
      porcentaje: '35%',
      highlight: false
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">
            Maximiza el Valor de tu Operación
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Nuestras estrategias fiscales han generado más de €180M en ahorros 
            para nuestros clientes en los últimos 15 años.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {benefits.map((benefit, index) => (
            <div key={index} className="bg-white border border-gray-300 rounded-lg p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out text-center group">
              <div className="bg-gray-50 text-gray-300 rounded-lg w-12 h-12 flex items-center justify-center mx-auto mb-6 group-hover:bg-gray-100 transition-colors duration-300">
                <span className="text-sm font-medium">{index + 1}</span>
              </div>
              
              <h3 className="text-lg font-bold text-black mb-4">
                {benefit.title}
              </h3>
              
              <p className="text-gray-600 mb-6 leading-relaxed">
                {benefit.description}
              </p>
              
              <div className="bg-gray-50 rounded-lg py-3 px-4 border border-gray-200">
                <span className="text-sm font-bold text-black">
                  {benefit.stats}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="text-2xl font-bold text-black mb-8">
              Casos de Optimización Fiscal
            </h3>
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                <h4 className="text-lg font-bold text-green-800 mb-2">
                  💡 Testimonios de Clientes
                </h4>
                <div className="space-y-4">
                  <blockquote className="text-green-700">
                    <p className="italic">"Gracias a Capittal ahorramos €2.8M en impuestos en nuestra venta. Su planificación fiscal fue clave para maximizar el valor de la transacción."</p>
                    <footer className="text-sm font-medium mt-2">— CEO, Empresa Tecnológica (Venta €45M)</footer>
                  </blockquote>
                  <blockquote className="text-green-700">
                    <p className="italic">"El diferimiento fiscal que estructuraron nos permitió reinvertir inmediatamente en crecimiento. Altamente recomendables."</p>
                    <footer className="text-sm font-medium mt-2">— Fundador, Empresa Industrial (Fusión €25M)</footer>
                  </blockquote>
                </div>
              </div>
              {casosExito.map((caso, index) => (
                <div key={index} className={`border-l-4 ${caso.highlight ? 'border-green-500 bg-green-50' : 'border-gray-300'} pl-6 py-4 rounded-r-lg`}>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-lg text-black">{caso.operacion}</h4>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-bold">
                      -{caso.porcentaje}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-1"><strong>Ahorro:</strong> {caso.ahorro}</p>
                  <p className="text-gray-600"><strong>Estrategia:</strong> {caso.estrategia}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-gray-50 border border-gray-300 rounded-lg p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out">
            <h4 className="text-xl font-bold text-black mb-8 text-center">
              Impacto Fiscal de Nuestro Trabajo
            </h4>
            <div className="grid grid-cols-2 gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">€180M</div>
                <div className="text-gray-600 text-sm">Ahorro total generado</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-black mb-2">200+</div>
                <div className="text-gray-600 text-sm">Operaciones optimizadas</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">23%</div>
                <div className="text-gray-600 text-sm">Ahorro promedio</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-black mb-2">100%</div>
                <div className="text-gray-600 text-sm">Compliance garantizado</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PlanificacionFiscalBenefits;
