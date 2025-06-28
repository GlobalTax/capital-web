
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Scale, Shield, CheckCircle } from 'lucide-react';

const AsesoramientoLegalProcess = () => {
  const processSteps = [
    {
      icon: <FileText size={32} />,
      title: "Análisis Legal Inicial",
      description: "Revisión completa de la estructura legal, contratos principales y documentación corporativa de la empresa.",
      duration: "1-2 semanas"
    },
    {
      icon: <Scale size={32} />,
      title: "Due Diligence Legal",
      description: "Investigación exhaustiva de aspectos legales, laborales, fiscales y regulatorios que puedan afectar la operación.",
      duration: "2-4 semanas"
    },
    {
      icon: <Shield size={32} />,
      title: "Estructuración Legal",
      description: "Diseño de la estructura legal óptima para la operación, incluyendo aspectos fiscales y de gobierno corporativo.",
      duration: "1-2 semanas"
    },
    {
      icon: <CheckCircle size={32} />,
      title: "Cierre y Ejecución",
      description: "Redacción de contratos, coordinación del cierre y seguimiento post-operación para garantizar el cumplimiento.",
      duration: "2-3 semanas"
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">
            Nuestro Proceso Legal
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Un enfoque sistemático que protege tus intereses en cada etapa de la operación, 
            minimizando riesgos y asegurando el cumplimiento normativo.
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

        <div className="mt-16 text-center">
          <div className="bg-white border border-gray-300 rounded-lg p-8 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out inline-block">
            <h3 className="text-xl font-bold text-black mb-4">
              Tiempo Total del Proceso
            </h3>
            <div className="text-3xl font-bold text-black mb-2">6-11 semanas</div>
            <p className="text-gray-600">
              Duración promedio completa desde análisis inicial hasta cierre
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AsesoramientoLegalProcess;
