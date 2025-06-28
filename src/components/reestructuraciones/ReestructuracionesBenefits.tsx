
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { RefreshCw, TrendingDown, Shield, Users, Clock, Target } from 'lucide-react';

const ReestructuracionesBenefits = () => {
  const benefits = [
    {
      icon: <RefreshCw size={32} />,
      title: "Recuperación Integral",
      description: "Transformación completa de la empresa abordando todos los aspectos operativos y financieros."
    },
    {
      icon: <TrendingDown size={32} />,
      title: "Reducción de Costes",
      description: "Optimización significativa de la estructura de costes manteniendo la calidad operativa."
    },
    {
      icon: <Shield size={32} />,
      title: "Estabilidad Financiera",
      description: "Reestructuración de deuda y mejora del flujo de caja para asegurar viabilidad futura."
    },
    {
      icon: <Users size={32} />,
      title: "Gestión del Cambio",
      description: "Acompañamiento en la transformación organizacional y gestión de stakeholders."
    },
    {
      icon: <Clock size={32} />,
      title: "Implementación Rápida",
      description: "Ejecución eficiente del plan con resultados visibles en el corto plazo."
    },
    {
      icon: <Target size={32} />,
      title: "Sostenibilidad",
      description: "Soluciones diseñadas para mantener la viabilidad y crecimiento a largo plazo."
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">
            Beneficios de Nuestras Reestructuraciones
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Transformamos empresas en dificultades en organizaciones eficientes 
            y sostenibles mediante soluciones integrales y personalizadas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <Card key={index} className="border border-gray-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out h-full">
              <CardContent className="p-6">
                <div className="text-black mb-4">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-bold text-black mb-3">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {benefit.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ReestructuracionesBenefits;
