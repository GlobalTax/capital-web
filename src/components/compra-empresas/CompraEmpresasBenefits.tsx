import React from 'react';
import { CheckCircle } from 'lucide-react';

const CompraEmpresasBenefits = () => {
  const benefits = [
    {
      title: "Acceso Exclusivo a Oportunidades",
      description: "Red privada de empresas en venta no disponibles públicamente",
      stats: "80% off-market"
    },
    {
      title: "Due Diligence Integral", 
      description: "Análisis completo financiero, legal, fiscal y operacional",
      stats: "100+ checkpoints"
    },
    {
      title: "Negociación Especializada",
      description: "Expertise en estructuración y optimización de términos",
      stats: "15% ahorro promedio"
    },
    {
      title: "Integración Post-Compra",
      description: "Acompañamiento en la fusión e integración operativa",
      stats: "6 meses incluidos"
    }
  ];

  const successCases = [
    {
      company: "SaaS B2B",
      sector: "Tecnología",
      value: "€12M",
      multiple: "8.5x EBITDA",
      outcome: "ROI 25% primer año"
    },
    {
      company: "Distribución Industrial", 
      sector: "Industrial",
      value: "€8.5M",
      multiple: "6.2x EBITDA", 
      outcome: "Sinergias €2M anuales"
    },
    {
      company: "Servicios Profesionales",
      sector: "Servicios", 
      value: "€5.2M",
      multiple: "4.8x EBITDA",
      outcome: "Expansión 5 mercados"
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
            ¿Por Qué Elegir Nuestro Servicio?
          </h2>
          <p className="text-lg text-slate-700 max-w-3xl mx-auto">
            Expertise especializado en adquisiciones que garantiza resultados excepcionales
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {benefits.map((benefit, index) => (
            <div key={index} className="bg-white rounded-xl p-6 text-center hover:shadow-lg transition-shadow">
              <div className="text-3xl font-bold text-blue-600 mb-2">{benefit.stats}</div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">{benefit.title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{benefit.description}</p>
            </div>
          ))}
        </div>

        {/* Success Cases */}
        <div>
          <h3 className="text-2xl font-bold text-slate-900 text-center mb-12">
            Casos de Éxito Recientes
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {successCases.map((case_, index) => (
              <div key={index} className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                    {case_.sector}
                  </span>
                  <span className="text-xl font-bold text-slate-900">{case_.value}</span>
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-2">{case_.company}</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <span className="text-slate-600">Múltiplo: {case_.multiple}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <span className="text-slate-600">{case_.outcome}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Key Results */}
        <div className="mt-16 bg-slate-900 rounded-2xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-8">Resultados que Hablan por Sí Solos</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="text-3xl font-bold mb-2">150+</div>
              <div className="text-sm text-gray-300">Adquisiciones completadas</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">€902M</div>
              <div className="text-sm text-gray-300">Valor total gestionado</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">98,7%</div>
              <div className="text-sm text-gray-300">Tasa de éxito en cierres</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">4.2x</div>
              <div className="text-sm text-gray-300">ROI promedio conseguido</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CompraEmpresasBenefits;