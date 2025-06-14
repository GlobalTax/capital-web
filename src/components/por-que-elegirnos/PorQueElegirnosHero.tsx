
import React from 'react';
import { Button } from '@/components/ui/button';
import { Award, Users, TrendingUp, Shield } from 'lucide-react';

const PorQueElegirnosHero = () => {
  const highlights = [
    {
      icon: Award,
      text: "25+ años de experiencia"
    },
    {
      icon: Users,
      text: "500+ transacciones exitosas"
    },
    {
      icon: TrendingUp,
      text: "€5B+ en valor gestionado"
    },
    {
      icon: Shield,
      text: "95% tasa de éxito"
    }
  ];

  return (
    <section className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-5xl lg:text-6xl font-normal text-black mb-6 leading-tight">
            Por Qué Elegir
            <span className="block text-gray-600">Capittal</span>
          </h1>
          
          <p className="text-2xl text-gray-600 mb-8 max-w-4xl mx-auto leading-relaxed">
            Más de dos décadas de experiencia nos avalan como líderes en asesoramiento 
            de fusiones y adquisiciones. Nuestro compromiso es maximizar el valor de tu empresa.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {highlights.map((highlight, index) => {
              const Icon = highlight.icon;
              return (
                <div key={index} className="flex flex-col items-center">
                  <div className="bg-black text-white rounded-full w-16 h-16 flex items-center justify-center mb-4">
                    <Icon className="h-8 w-8" />
                  </div>
                  <span className="text-lg font-semibold text-gray-800 text-center">
                    {highlight.text}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="capittal-button text-lg px-8 py-4">
              Conocer Nuestro Equipo
            </Button>
            <Button variant="outline" className="text-lg px-8 py-4 border-black hover:bg-gray-50">
              Ver Casos de Éxito
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PorQueElegirnosHero;
