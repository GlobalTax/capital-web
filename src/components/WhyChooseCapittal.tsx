
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Award, Users, Target, Clock, Shield, TrendingUp } from 'lucide-react';

const WhyChooseCapittal = () => {
  const features = [
    {
      icon: Award,
      title: 'Experiencia Comprobada',
      description: 'Más de 15 años asesorando transacciones exitosas en múltiples sectores.',
      highlight: '€1B+ en valor transaccional'
    },
    {
      icon: Users,
      title: 'Equipo Especializado',
      description: 'Profesionales senior con experiencia en banca de inversión y M&A.',
      highlight: '200+ operaciones completadas'
    },
    {
      icon: Target,
      title: 'Enfoque Personalizado',
      description: 'Cada mandato es único. Adaptamos nuestra estrategia a tus objetivos.',
      highlight: '95% tasa de éxito'
    },
    {
      icon: Clock,
      title: 'Proceso Eficiente',
      description: 'Metodología probada que optimiza tiempos sin comprometer resultados.',
      highlight: '6 meses promedio'
    },
    {
      icon: Shield,
      title: 'Máxima Confidencialidad',
      description: 'Procesos discretos que protegen tu empresa durante la transacción.',
      highlight: 'Confidencialidad garantizada'
    },
    {
      icon: TrendingUp,
      title: 'Maximización del Valor',
      description: 'Identificamos y potenciamos los aspectos que aumentan la valoración.',
      highlight: '+23% sobre valoración inicial'
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-black mb-6">
            ¿Por Qué Elegir Capittal?
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Somos el partner estratégico que necesitas para maximizar el valor de tu empresa 
            y conseguir el mejor resultado en tu transacción.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <Card key={index} className="bg-white border-0.5 border-black rounded-lg shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out group">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="p-3 bg-white border-0.5 border-black rounded-lg mr-4 group-hover:shadow-sm transition-all duration-300 ease-out">
                      <IconComponent className="h-6 w-6 text-black" />
                    </div>
                    <h3 className="text-lg font-semibold text-black">
                      {feature.title}
                    </h3>
                  </div>
                  
                  <p className="text-gray-600 mb-4 leading-relaxed text-sm">
                    {feature.description}
                  </p>

                  <div className="pt-3 border-t-0.5 border-gray-200">
                    <span className="text-sm font-medium text-black bg-white border-0.5 border-black rounded-lg px-3 py-1">
                      {feature.highlight}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-16">
          <button className="bg-white text-black border-0.5 border-black rounded-lg px-8 py-4 text-lg font-medium hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out">
            Conoce Nuestro Equipo
          </button>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseCapittal;
