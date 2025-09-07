
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Search, FileText, BarChart3, CheckCircle } from 'lucide-react';

const DueDiligenceProcess = () => {
  const processSteps = [
    {
      icon: <Search size={32} />,
      title: "**Kick-off y Análisis Preliminar**",
      description: "**Definimos alcance (Buy-side/Vendor), revisamos documentación inicial y establecemos áreas críticas según el tipo de DD.**",
      duration: "1 semana"
    },
    {
      icon: <FileText size={32} />,
      title: "**Due Diligence Detallado**",
      description: "**Investigación exhaustiva adaptada: Buy-side enfocado en riesgos, Vendor en optimización y preparación para venta.**",
      duration: "3-4 semanas"
    },
    {
      icon: <BarChart3 size={32} />,
      title: "**Análisis e Interpretación**",
      description: "**Valoración específica: impacto en decisión de compra (Buy-side) o plan de mejoras pre-venta (Vendor).**",
      duration: "1-2 semanas"
    },
    {
      icon: <CheckCircle size={32} />,
      title: "**Informe y Plan de Acción**",
      description: "**Entrega de informe específico con recomendaciones: Go/No-go (Buy-side) o roadmap de mejoras (Vendor).**",
      duration: "1 semana"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-black mb-6">
            **Metodología Probada en 150+ Transacciones**
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            **Proceso sistemático que combina experiencia tradicional con tecnología 
            avanzada para análisis completos y precisos, adaptado a Buy-side o Vendor DD.**
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
              Tiempo Total
            </h3>
            <div className="text-3xl font-bold text-black mb-2">6-8 semanas</div>
            <p className="text-gray-600">
              Duración completa del proceso
            </p>
          </div>
          
          <div className="bg-gray-50 border border-gray-300 rounded-lg p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out text-center">
            <h3 className="text-xl font-bold text-black mb-4">
              Áreas Analizadas
            </h3>
            <div className="text-3xl font-bold text-black mb-2">12+</div>
            <p className="text-gray-600">
              Aspectos clave evaluados
            </p>
          </div>
          
          <div className="bg-gray-50 border border-gray-300 rounded-lg p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out text-center">
            <h3 className="text-xl font-bold text-black mb-4">
              Precisión
            </h3>
            <div className="text-3xl font-bold text-green-600 mb-2">98%</div>
            <p className="text-gray-600">
              Exactitud en identificación de riesgos
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DueDiligenceProcess;
