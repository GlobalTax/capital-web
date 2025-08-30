
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Calculator, FileText, TrendingUp, Shield } from 'lucide-react';

const PlanificacionFiscalProcess = () => {
  const processSteps = [
    {
      icon: <Calculator size={32} />,
      title: "Diagnóstico Inicial",
      description: "Análisis de la situación fiscal actual y objetivos. Identificación de oportunidades de optimización y estructuración.",
      duration: "1-2 semanas"
    },
    {
      icon: <FileText size={32} />,
      title: "Diseño de Estrategia",
      description: "Propuesta de estructuras y beneficios fiscales. Modelado del impacto fiscal y alternativas de optimización.",
      duration: "2-3 semanas"
    },
    {
      icon: <TrendingUp size={32} />,
      title: "Due Diligence Fiscal",
      description: "Identificación de contingencias y oportunidades. Análisis exhaustivo de riesgos fiscales y estrategias de mitigación.",
      duration: "2-4 semanas"
    },
    {
      icon: <Shield size={32} />,
      title: "Implementación y Negociación", 
      description: "Coordinación con asesores legales y financieros. Estructuración final y negociación de términos fiscales.",
      duration: "3-5 semanas"
    },
    {
      icon: <Shield size={32} />,
      title: "Cierre y Cumplimiento",
      description: "Formalización, reporting y seguimiento de obligaciones. Aseguramiento del cumplimiento post-operación.",
      duration: "1 semana"
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">
            Nuestro Proceso de Planificación Fiscal
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Un enfoque sistemático que maximiza el ahorro fiscal mientras garantiza 
            el pleno cumplimiento de todas las obligaciones tributarias.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {processSteps.map((step, index) => (
            <Card key={index} className="border border-gray-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out text-center h-full">
              <CardContent className="p-6">
                <div className="text-black mb-4 flex justify-center">
                  {step.icon}
                </div>
                <h3 className="text-lg font-bold text-black mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                  {step.description}
                </p>
                <div className="bg-black text-white px-3 py-1 rounded-full text-xs font-medium">
                  {step.duration}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="bg-white border border-gray-300 rounded-lg p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-black mb-6">
              Duración Total del Proceso
            </h3>
            <div className="text-4xl font-bold text-black mb-2">6-12 semanas</div>
            <p className="text-gray-600 mb-8">
              Dependiendo de la complejidad de la operación y estructura fiscal requerida
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-2">23%</div>
                <div className="text-gray-600 text-sm">Ahorro promedio</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-black mb-2">100%</div>
                <div className="text-gray-600 text-sm">Compliance garantizado</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-2">15:1</div>
                <div className="text-gray-600 text-sm">ROI del servicio</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PlanificacionFiscalProcess;
