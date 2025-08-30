import React from 'react';
import { Users, FileText, Calculator, Shield } from 'lucide-react';

const PlanificacionFiscalIntegration = () => {
  const integrationAspects = [
    {
      icon: Users,
      title: "Equipo Multidisciplinar",
      description: "Colaboramos con abogados, auditores y asesores financieros"
    },
    {
      icon: FileText,
      title: "Coordinación Legal",
      description: "Integración con aspectos jurídicos y contractuales de la operación"
    },
    {
      icon: Calculator,
      title: "Modelado Financiero",
      description: "Impacto fiscal incorporado en modelos de valoración y estructura"
    },
    {
      icon: Shield,
      title: "Compliance Integral",
      description: "Supervisión de todos los aspectos regulatorios y de cumplimiento"
    }
  ];

  return (
    <section className="py-16 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Solución Integral M&A
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Capittal trabaja junto a expertos legales y financieros para ofrecerte 
            una solución integral en todas las fases de tu operación.
          </p>
          
          <div className="bg-white/10 border border-white/20 rounded-lg p-6 max-w-4xl mx-auto">
            <p className="text-white text-lg font-medium mb-2">
              "La planificación fiscal no es un elemento aislado"
            </p>
            <p className="text-gray-300">
              Integramos la optimización fiscal con la estrategia legal, financiera y operativa 
              para maximizar el valor de tu transacción desde todos los ángulos.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {integrationAspects.map((aspect, index) => (
            <div key={index} className="bg-white/5 border border-white/20 rounded-lg p-6 hover:bg-white/10 transition-all duration-300 text-center">
              <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <aspect.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white mb-3">
                {aspect.title}
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                {aspect.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">360°</div>
              <div className="text-gray-400">Enfoque integral</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">50+</div>
              <div className="text-gray-400">Asesores colaboradores</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">100%</div>
              <div className="text-gray-400">Coordinación garantizada</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PlanificacionFiscalIntegration;