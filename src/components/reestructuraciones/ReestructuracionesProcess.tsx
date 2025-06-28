
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Search, FileText, Cog, TrendingUp } from 'lucide-react';

const ReestructuracionesProcess = () => {
  const processSteps = [
    {
      icon: <Search size={32} />,
      title: "Diagnóstico Integral",
      description: "Análisis exhaustivo de la situación financiera, operativa y estratégica para identificar las causas de los problemas.",
      duration: "2-3 semanas"
    },
    {
      icon: <FileText size={32} />,
      title: "Plan de Reestructuración",
      description: "Diseño de plan detallado que incluye medidas operativas, financieras y estratégicas para la recuperación.",
      duration: "2-4 semanas"
    },
    {
      icon: <Cog size={32} />,
      title: "Implementación",
      description: "Ejecución del plan con seguimiento continuo, incluyendo negociación con stakeholders y gestión del cambio.",
      duration: "6-12 meses"
    },
    {
      icon: <TrendingUp size={32} />,
      title: "Monitoreo y Ajustes",
      description: "Seguimiento de resultados, ajustes del plan según evolución y consolidación de las mejoras implementadas.",
      duration: "Continuo"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">
            Nuestro Proceso de Reestructuración
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Metodología probada que combina análisis riguroso con implementación práctica 
            para transformar empresas en dificultades en organizaciones sostenibles.
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
          <div className="bg-gray-50 border border-gray-300 rounded-lg p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out text-center">
            <h3 className="text-xl font-bold text-black mb-4">
              Tasa de Éxito
            </h3>
            <div className="text-3xl font-bold text-green-600 mb-2">87%</div>
            <p className="text-gray-600">
              Empresas recuperadas exitosamente
            </p>
          </div>
          
          <div className="bg-gray-50 border border-gray-300 rounded-lg p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out text-center">
            <h3 className="text-xl font-bold text-black mb-4">
              Ahorro Promedio
            </h3>
            <div className="text-3xl font-bold text-black mb-2">32%</div>
            <p className="text-gray-600">
              Reducción de costes operativos
            </p>
          </div>
          
          <div className="bg-gray-50 border border-gray-300 rounded-lg p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out text-center">
            <h3 className="text-xl font-bold text-black mb-4">
              Tiempo de Recuperación
            </h3>
            <div className="text-3xl font-bold text-black mb-2">18</div>
            <p className="text-gray-600">
              Meses promedio hasta estabilización
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReestructuracionesProcess;
