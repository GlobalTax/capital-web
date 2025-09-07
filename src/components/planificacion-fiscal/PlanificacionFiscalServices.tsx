import React from 'react';

const PlanificacionFiscalServices = () => {
  const services = [
    {
      title: "Estructuración Fiscal",
      description: "Diseñamos estructuras fiscalmente eficientes para operaciones de M&A y reorganizaciones empresariales, optimizando la carga tributaria desde la fase de planificación.",
      features: ["Análisis de estructuras", "Optimización tributaria", "Coordinación multidisciplinar"]
    },
    {
      title: "Optimización Tributaria",
      description: "Identificamos y aplicamos todos los beneficios fiscales, deducciones y créditos disponibles para minimizar el impacto fiscal de tu operación.",
      features: ["Deducciones aplicables", "Beneficios fiscales", "Créditos disponibles"]
    },
    {
      title: "Due Diligence Fiscal",
      description: "Realizamos un análisis exhaustivo de contingencias fiscales y diseñamos estrategias de mitigación para proteger tu inversión.",
      features: ["Análisis de riesgos", "Contingencias fiscales", "Estrategias de mitigación"]
    },
    {
      title: "Diferidos y Reorganizaciones",
      description: "Aplicamos regímenes especiales para diferir la tributación en reorganizaciones empresariales y mejorar el flujo de caja.",
      features: ["Regímenes especiales", "Diferimiento fiscal", "Mejora cash flow"]
    },
    {
      title: "Planificación Impuesto Sociedades",
      description: "Optimizamos la base imponible del Impuesto de Sociedades mediante ajustes en amortizaciones, provisiones y otros conceptos deducibles.",
      features: ["Ajustes base imponible", "Amortizaciones", "Provisiones deducibles"]
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">
            Nuestros Servicios de Planificación Fiscal
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Servicios especializados para optimizar la carga tributaria en operaciones 
            corporativas, siempre dentro del marco legal vigente.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div key={index} className="bg-white border border-gray-300 rounded-lg p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out group">
              <h3 className="text-xl font-bold text-black mb-4">
                {service.title}
              </h3>
              
              <p className="text-gray-600 mb-6 leading-relaxed">
                {service.description}
              </p>
              
              <ul className="space-y-2">
                {service.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="text-sm text-gray-600 flex items-center">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-3"></span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-gray-50 border border-gray-300 rounded-lg p-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-black mb-4">
              Enfoque Integral y Personalizado
            </h3>
            <p className="text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Cada operación es única. Nuestro equipo de especialistas fiscales trabaja 
              estrechamente contigo para diseñar estrategias personalizadas que maximicen 
              el valor de tu transacción mientras garantizan el cumplimiento normativo.
            </p>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-black mb-1">15+ años</div>
                <div className="text-gray-600 text-sm">Experiencia en M&A</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-black mb-1">200+</div>
                <div className="text-gray-600 text-sm">Operaciones fiscales</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-black mb-1">€180M</div>
                <div className="text-gray-600 text-sm">Ahorro generado</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PlanificacionFiscalServices;