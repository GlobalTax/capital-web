import React from 'react';

const CompraEmpresasProcess = () => {
  const steps = [
    {
      title: "Estrategia & Criterios",
      description: "Definimos juntos tu estrategia de crecimiento y establecemos criterios específicos de búsqueda: sector, tamaño, ubicación y perfil financiero.",
      duration: "1-2 semanas"
    },
    {
      title: "Identificación & Due Diligence", 
      description: "Búsqueda proactiva de oportunidades y análisis exhaustivo financiero, legal y operacional de los candidatos objetivo.",
      duration: "4-8 semanas"
    },
    {
      title: "Negociación & Cierre",
      description: "Negociación de términos óptimos, structuración de la transacción y acompañamiento hasta el cierre exitoso.",
      duration: "6-12 semanas"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-normal text-slate-900 mb-6">
            Proceso de Adquisición
          </h2>
          <p className="text-lg text-slate-700 max-w-3xl mx-auto">
            Metodología probada que minimiza riesgos y maximiza el valor de tu inversión
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center group">
              <div className="bg-slate-900 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 text-xl font-bold group-hover:bg-blue-600 transition-colors">
                {index + 1}
              </div>
              <div className="mb-2">
                <span className="text-sm text-blue-600 font-medium bg-blue-50 px-3 py-1 rounded-full">
                  {step.duration}
                </span>
              </div>
              <h3 className="text-xl font-normal text-slate-900 mb-4">
                {step.title}
              </h3>
              <p className="text-slate-600 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="mt-16 text-center bg-gray-50 rounded-2xl p-8">
          <h3 className="text-xl font-normal text-slate-900 mb-4">
            Duración Total del Proceso: 3-6 meses
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            <div>
              <div className="text-2xl font-bold text-slate-900">98,7%</div>
              <div className="text-sm text-slate-600">Tasa de éxito en cierres</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">4.2x</div>
              <div className="text-sm text-slate-600">ROI promedio conseguido</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">€902M</div>
              <div className="text-sm text-slate-600">Valor total gestionado</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CompraEmpresasProcess;