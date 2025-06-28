
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Calculator, FileText, TrendingUp, Shield } from 'lucide-react';

const PlanificacionFiscalProcess = () => {
  const processSteps = [
    {
      icon: <Calculator size={32} />,
      title: "Análisis Fiscal",
      description: "Evaluación completa de la situación fiscal actual y identificación de oportunidades de optimización.",
      duration: "1 semana"
    },
    {
      icon: <FileText size={32} />,
      title: "Estrategia Personalizada",
      description: "Diseño de estrategias fiscales específicas adaptadas a tu operación y objetivos empresariales.",
      duration: "1-2 semanas"
    },
    {
      icon: <TrendingUp size={32} />,
      title: "Implementación",
      description: "Ejecución de las estrategias fiscales con coordinación entre equipos legales, contables y financieros.",
      duration: "2-3 semanas"
    },
    {
      icon: <Shield size={32} />,
      title: "Monitoreo y Compliance",
      description: "Seguimiento continuo para asegurar el cumplimiento normativo y maximizar los beneficios fiscales.",
      duration: "Continuo"
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
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

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white border border-gray-300 rounded-lg p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out text-center">
            <h3 className="text-xl font-bold text-black mb-4">
              Ahorro Promedio
            </h3>
            <div className="text-3xl font-bold text-green-600 mb-2">23%</div>
            <p className="text-gray-600">
              Reducción media de la carga fiscal
            </p>
          </div>
          
          <div className="bg-white border border-gray-300 rounded-lg p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out text-center">
            <h3 className="text-xl font-bold text-black mb-4">
              Cumplimiento
            </h3>
            <div className="text-3xl font-bold text-black mb-2">100%</div>
            <p className="text-gray-600">
              Garantía de compliance fiscal
            </p>
          </div>
          
          <div className="bg-white border border-gray-300 rounded-lg p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out text-center">
            <h3 className="text-xl font-bold text-black mb-4">
              ROI del Servicio
            </h3>
            <div className="text-3xl font-bold text-green-600 mb-2">15:1</div>
            <p className="text-gray-600">
              Retorno por cada euro invertido
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PlanificacionFiscalProcess;
