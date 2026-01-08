
import React from 'react';
import { Building, Globe, Award, TrendingUp } from 'lucide-react';

const PorQueElegirnosExperience = () => {
  const experiences = [
    {
      icon: Building,
      title: "Experiencia Sectorial",
      description: "Profundo conocimiento en tecnología, healthcare, industrial y servicios financieros.",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: Globe,
      title: "Alcance Internacional",
      description: "Red global de contactos con presencia en Europa, América y Asia-Pacífico.",
      color: "from-green-500 to-green-600"
    },
    {
      icon: Award,
      title: "Reconocimiento",
      description: "Múltiples premios y reconocimientos por excelencia en asesoramiento M&A.",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: TrendingUp,
      title: "Resultados Probados",
      description: "Track record consistente con múltiplos superiores a la media del mercado.",
      color: "from-black to-gray-800"
    }
  ];

  return (
    <section className="py-20 bg-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-transparent"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-normal text-black mb-6">
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
              <div 
                key={index} 
                className="group bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-2xl hover:-translate-y-3 transition-all duration-500 hover:border-gray-200"
              >
                <div className="flex items-start space-x-6">
                  <div className={`bg-gradient-to-br ${experience.color} text-white rounded-2xl w-16 h-16 flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg`}>
                    <Icon className="h-8 w-8" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-normal text-black mb-4 group-hover:text-gray-700 transition-colors">
                      {experience.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors">
                      {experience.description}
                    </p>
                  </div>
                </div>
                
                {/* Hover effect line */}
                <div className="mt-6 h-1 bg-gradient-to-r from-gray-200 to-transparent rounded-full">
                  <div className={`h-full bg-gradient-to-r ${experience.color} rounded-full w-0 group-hover:w-full transition-all duration-700`}></div>
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
