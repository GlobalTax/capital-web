
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, Search, Calculator, Users, FileText, Target } from 'lucide-react';

const Services = () => {
  const services = [
    {
      icon: <TrendingUp size={32} />,
      title: 'Fusiones y Adquisiciones',
      description: 'Asesoramiento integral en operaciones de M&A, desde la estrategia inicial hasta el cierre exitoso de la transacción.',
    },
    {
      icon: <Search size={32} />,
      title: 'Due Diligence',
      description: 'Análisis exhaustivo financiero, legal y comercial para identificar riesgos y oportunidades en cada inversión.',
    },
    {
      icon: <Calculator size={32} />,
      title: 'Valoraciones Empresariales',
      description: 'Evaluaciones precisas y metodologías probadas para determinar el valor real de su empresa o target.',
    },
    {
      icon: <Users size={32} />,
      title: 'Corporate Finance',
      description: 'Estructuración financiera, levantamiento de capital y optimización de la estructura de balance.',
    },
    {
      icon: <FileText size={32} />,
      title: 'Reestructuraciones',
      description: 'Procesos de reestructuración operativa y financiera para maximizar el valor empresarial.',
    },
    {
      icon: <Target size={32} />,
      title: 'Estrategia Corporativa',
      description: 'Definición de estrategias de crecimiento inorgánico y identificación de oportunidades de mercado.',
    },
  ];

  return (
    <section id="servicios" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">
            Nuestros Servicios
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Ofrecemos un conjunto integral de servicios especializados en M&A y finanzas corporativas 
            para impulsar el crecimiento de su empresa.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <Card key={index} className="capittal-card group cursor-pointer">
              <CardContent className="p-6">
                <div className="text-black mb-4 group-hover:scale-110 transition-transform duration-300">
                  {service.icon}
                </div>
                <h3 className="text-xl font-semibold text-black mb-3">
                  {service.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {service.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
