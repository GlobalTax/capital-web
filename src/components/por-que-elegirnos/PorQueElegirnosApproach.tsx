
import React from 'react';
import { Users, Shield, Clock, Target } from 'lucide-react';

const PorQueElegirnosApproach = () => {
  const approaches = [
    {
      icon: Users,
      title: "Enfoque Personalizado",
      description: "Cada empresa es única. Adaptamos nuestra estrategia a las necesidades específicas de tu negocio.",
      points: ["Análisis detallado del negocio", "Estrategia personalizada", "Equipo dedicado"],
      gradient: "from-blue-50 to-blue-100",
      iconColor: "from-blue-500 to-blue-600"
    },
    {
      icon: Shield,
      title: "Confidencialidad Total",
      description: "Protegemos tu empresa durante todo el proceso con estrictos protocolos de confidencialidad.",
      points: ["Acuerdos de confidencialidad", "Proceso discreto", "Protección de información"],
      gradient: "from-green-50 to-green-100",
      iconColor: "from-green-500 to-green-600"
    },
    {
      icon: Clock,
      title: "Eficiencia Temporal",
      description: "Optimizamos los tiempos sin comprometer la calidad del proceso de venta.",
      points: ["Procesos optimizados", "Comunicación fluida", "Cierre eficiente"],
      gradient: "from-purple-50 to-purple-100",
      iconColor: "from-purple-500 to-purple-600"
    },
    {
      icon: Target,
      title: "Maximización de Valor",
      description: "Nuestro objetivo es obtener el mejor precio y términos posibles para tu empresa.",
      points: ["Valoración optimizada", "Múltiples ofertas", "Negociación experta"],
      gradient: "from-orange-50 to-orange-100",
      iconColor: "from-orange-500 to-orange-600"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-black mb-6">
            Nuestro Enfoque
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Un método probado que combina experiencia técnica con un servicio 
            personalizado para cada cliente.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {approaches.map((approach, index) => {
            const Icon = approach.icon;
            return (
              <div 
                key={index} 
                className="group bg-white rounded-3xl shadow-lg p-8 border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 relative overflow-hidden"
              >
                {/* Background gradient on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${approach.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                
                <div className="relative z-10">
                  <div className="flex items-center mb-6">
                    <div className={`bg-gradient-to-br ${approach.iconColor} text-white rounded-2xl w-16 h-16 flex items-center justify-center mr-6 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-lg`}>
                      <Icon className="h-8 w-8" />
                    </div>
                    <h3 className="text-2xl font-bold text-black group-hover:text-gray-800 transition-colors">
                      {approach.title}
                    </h3>
                  </div>
                  
                  <p className="text-gray-600 mb-6 leading-relaxed group-hover:text-gray-700 transition-colors">
                    {approach.description}
                  </p>
                  
                  <ul className="space-y-3">
                    {approach.points.map((point, pointIndex) => (
                      <li 
                        key={pointIndex} 
                        className="flex items-center text-gray-700 group-hover:text-gray-800 transition-all duration-300"
                        style={{ transitionDelay: `${pointIndex * 100}ms` }}
                      >
                        <div className="w-3 h-3 bg-gradient-to-br from-black to-gray-600 rounded-full mr-4 group-hover:scale-125 transition-transform duration-300"></div>
                        <span className="group-hover:translate-x-1 transition-transform duration-300">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PorQueElegirnosApproach;
