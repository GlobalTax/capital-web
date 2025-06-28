
import React from 'react';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import { Award, Users, TrendingUp, Shield } from 'lucide-react';
import { useCountAnimation } from '@/hooks/useCountAnimation';

const PorQueElegirnosHero = () => {
  const experienceCount = useCountAnimation(25, 2000, '+');
  const transactionsCount = useCountAnimation(500, 2500, '+');
  const valueCount = useCountAnimation(5, 2000, 'B+');
  const successCount = useCountAnimation(95, 1800, '%');

  const highlights = [
    {
      icon: Award,
      count: experienceCount,
      label: "años de experiencia",
      description: "Más de dos décadas en M&A"
    },
    {
      icon: Users,
      count: transactionsCount,
      label: "transacciones exitosas",
      description: "Operaciones completadas"
    },
    {
      icon: TrendingUp,
      count: valueCount,
      label: "en valor gestionado",
      description: "€5B+ en transacciones"
    },
    {
      icon: Shield,
      count: successCount,
      label: "tasa de éxito",
      description: "Operaciones completadas exitosamente"
    }
  ];

  return (
    <section className="bg-white py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="animate-fade-in">
            <h1 className="text-5xl lg:text-6xl font-normal text-black mb-6 leading-tight">
              Por Qué Elegir
              <span className="block text-transparent bg-gradient-to-r from-gray-600 to-black bg-clip-text">
                Capittal
              </span>
            </h1>
          </div>
          
          <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <p className="text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
              Más de dos décadas de experiencia nos avalan como líderes en asesoramiento 
              de fusiones y adquisiciones. Nuestro compromiso es maximizar el valor de tu empresa.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {highlights.map((highlight, index) => {
              const Icon = highlight.icon;
              return (
                <div 
                  key={index} 
                  className="group animate-fade-in hover:scale-105 transition-all duration-500"
                  style={{ animationDelay: `${0.4 + index * 0.1}s` }}
                >
                  <div className="bg-gradient-to-br from-black to-gray-800 text-white rounded-2xl w-20 h-20 flex items-center justify-center mb-6 mx-auto group-hover:shadow-2xl group-hover:rotate-3 transition-all duration-500">
                    <Icon className="h-10 w-10 group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <div 
                    ref={highlight.count.ref}
                    className="text-4xl font-bold text-black mb-2 group-hover:text-gray-700 transition-colors"
                  >
                    {highlight.count.count}
                  </div>
                  <div className="text-lg font-semibold text-gray-800 mb-2">
                    {highlight.label}
                  </div>
                  <p className="text-gray-600 text-sm">
                    {highlight.description}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: '0.8s' }}>
            <InteractiveHoverButton 
              text="Conocer Nuestro Equipo"
              variant="large"
              size="lg"
              className="hover:scale-105 hover:shadow-xl"
            />
            <InteractiveHoverButton 
              text="Ver Casos de Éxito"
              variant="outline"
              size="lg"
              className="hover:scale-105"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default PorQueElegirnosHero;
