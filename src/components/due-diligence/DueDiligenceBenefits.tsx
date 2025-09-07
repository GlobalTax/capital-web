
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Target, TrendingUp, Users, Clock, CheckCircle } from 'lucide-react';

const DueDiligenceBenefits = () => {
  const benefits = [
    {
      icon: <Shield size={32} />,
      title: "**Identificación de Riesgos Críticos**",
      description: "**Detectamos red flags y riesgos ocultos que podrían comprometer la transacción. 98% de precisión en identificación.**"
    },
    {
      icon: <Target size={32} />,
      title: "**Validación Independiente**",
      description: "**Verificamos claims del vendedor con metodología forense. Análisis imparcial respaldado por datos verificables.**"
    },
    {
      icon: <TrendingUp size={32} />,
      title: "**Maximización de Valor**",
      description: "**Buy-side: Identificamos sinergias. Vendor: Optimizamos empresa pre-venta para aumentar +15% el valor promedio.**"
    },
    {
      icon: <Users size={32} />,
      title: "**Análisis de Management**",
      description: "**Evaluación profunda del equipo directivo, key man risks y planes de retención post-transacción.**"
    },
    {
      icon: <Clock size={32} />,
      title: "**Proceso Acelerado**",
      description: "**6-8 semanas vs 12+ del mercado. Metodología probada que reduce tiempos sin comprometer calidad.**"
    },
    {
      icon: <CheckCircle size={32} />,
      title: "**Decisiones Basadas en Datos**",
      description: "**Recomendaciones Go/No-go claras respaldadas por análisis cuantitativo y cualitativo exhaustivo.**"
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-black mb-6">
            **Por Qué Elegir Nuestro Due Diligence**
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            **Experiencia probada en 150+ transacciones con enfoque especializado. 
            Identificamos lo que otros pasan por alto, tanto en Buy-side como Vendor DD.**
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

export default DueDiligenceBenefits;
