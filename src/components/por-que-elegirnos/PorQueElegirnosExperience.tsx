
import React from 'react';
import { Building, Globe, Award, TrendingUp } from 'lucide-react';

const PorQueElegirnosExperience = () => {
  const experiences = [
    {
      icon: Building,
      title: "Experiencia Sectorial",
      description: "Profundo conocimiento en tecnología, healthcare, industrial y servicios financieros."
    },
    {
      icon: Globe,
      title: "Alcance Internacional",
      description: "Red global de contactos con presencia en Europa, América y Asia-Pacífico."
    },
    {
      icon: Award,
      title: "Reconocimiento",
      description: "Múltiples premios y reconocimientos por excelencia en asesoramiento M&A."
    },
    {
      icon: TrendingUp,
      title: "Resultados Probados",
      description: "Track record consistente con múltiplos superiores a la media del mercado."
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-black mb-6">
            Una Experiencia que Marca la Diferencia
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Nuestro equipo combina experiencia sectorial profunda con un enfoque 
            personalizado para cada cliente y operación.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {experiences.map((experience, index) => {
            const Icon = experience.icon;
            return (
              <div key={index} className="capittal-card">
                <div className="flex items-start space-x-4">
                  <div className="bg-black text-white rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-black mb-3">
                      {experience.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {experience.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PorQueElegirnosExperience;
