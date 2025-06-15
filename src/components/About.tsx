
import React from 'react';
import { Button } from '@/components/ui/button';
import { Award, Globe, Users, Clock } from 'lucide-react';

const About = () => {
  const features = [
    {
      icon: <Award size={24} />,
      title: 'Experiencia Probada',
      description: 'Más de 15 años asesorando en las transacciones más complejas del mercado.',
    },
    {
      icon: <Globe size={24} />,
      title: 'Alcance Internacional',
      description: 'Red global de contactos y experiencia en mercados internacionales.',
    },
    {
      icon: <Users size={24} />,
      title: 'Equipo Multidisciplinar',
      description: 'Profesionales expertos en finanzas, legal, fiscal y sectorial.',
    },
    {
      icon: <Clock size={24} />,
      title: 'Ejecución Eficiente',
      description: 'Procesos optimizados para minimizar tiempos y maximizar resultados.',
    },
  ];

  return (
    <section id="nosotros" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-black mb-6">
              Quiénes Somos
            </h2>
            
            <p className="text-base text-gray-600 mb-8 leading-relaxed">
              Capittal es una boutique de inversión especializada en fusiones y adquisiciones 
              con un enfoque personalizado y resultados excepcionales. Nuestro equipo combina 
              décadas de experiencia en banca de inversión con un profundo conocimiento sectorial.
            </p>

            <p className="text-base text-gray-600 mb-8 leading-relaxed">
              Trabajamos exclusivamente con empresas medianas y grandes, proporcionando 
              asesoramiento estratégico de primer nivel y ejecutando transacciones complejas 
              con la máxima confidencialidad y eficiencia.
            </p>

            <Button className="bg-white text-black border-0.5 border-black rounded-[10px] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out text-base px-6 py-3">
              Conocer Más
            </Button>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="bg-white border-0.5 border-black rounded-[10px] p-6 shadow-sm hover:shadow-lg hover:-translate-y-2 transition-all duration-300 ease-out">
                <div className="text-black mb-3">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-black mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-black mb-2">98%</div>
            <div className="text-gray-600 font-medium text-base">Tasa de Éxito</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-black mb-2">45</div>
            <div className="text-gray-600 font-medium text-base">Días Promedio</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-black mb-2">25+</div>
            <div className="text-gray-600 font-medium text-base">Sectores</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-black mb-2">12</div>
            <div className="text-gray-600 font-medium text-base">Países</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
