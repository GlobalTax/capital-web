
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Target, TrendingUp, Users, Clock, CheckCircle } from 'lucide-react';

const DueDiligenceBenefits = () => {
  const benefits = [
    {
      icon: <Shield size={32} />,
      title: "Identificación de Riesgos",
      description: "Detectamos riesgos ocultos que podrían afectar el valor o viabilidad de la inversión."
    },
    {
      icon: <Target size={32} />,
      title: "Validación de Información",
      description: "Verificamos la exactitud de la información financiera y comercial proporcionada."
    },
    {
      icon: <TrendingUp size={32} />,
      title: "Oportunidades de Mejora",
      description: "Identificamos áreas de optimización y sinergias potenciales post-adquisición."
    },
    {
      icon: <Users size={32} />,
      title: "Análisis de Equipo",
      description: "Evaluamos la calidad del management y dependencias clave de personal."
    },
    {
      icon: <Clock size={32} />,
      title: "Proceso Eficiente",
      description: "Metodología probada que optimiza tiempos sin comprometer la calidad del análisis."
    },
    {
      icon: <CheckCircle size={32} />,
      title: "Recomendaciones Estratégicas",
      description: "Proporcionamos recomendaciones claras para la toma de decisiones informadas."
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-normal text-black mb-6">
            Beneficios de Nuestro Due Diligence
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Un análisis completo que te proporciona la información necesaria 
            para tomar decisiones de inversión con total confianza.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <Card key={index} className="border border-gray-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out h-full">
              <CardContent className="p-6">
                <div className="text-black mb-4">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-normal text-black mb-3">
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

export default DueDiligenceBenefits;
