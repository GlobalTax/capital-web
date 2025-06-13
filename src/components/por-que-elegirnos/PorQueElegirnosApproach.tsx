
import React from 'react';
import { Users, Shield, Clock, Target } from 'lucide-react';

const PorQueElegirnosApproach = () => {
  const approaches = [
    {
      icon: Users,
      title: "Enfoque Personalizado",
      description: "Cada empresa es única. Adaptamos nuestra estrategia a las necesidades específicas de tu negocio.",
      points: ["Análisis detallado del negocio", "Estrategia personalizada", "Equipo dedicado"]
    },
    {
      icon: Shield,
      title: "Confidencialidad Total",
      description: "Protegemos tu empresa durante todo el proceso con estrictos protocolos de confidencialidad.",
      points: ["Acuerdos de confidencialidad", "Proceso discreto", "Protección de información"]
    },
    {
      icon: Clock,
      title: "Eficiencia Temporal",
      description: "Optimizamos los tiempos sin comprometer la calidad del proceso de venta.",
      points: ["Procesos optimizados", "Comunicación fluida", "Cierre eficiente"]
    },
    {
      icon: Target,
      title: "Maximización de Valor",
      description: "Nuestro objetivo es obtener el mejor precio y términos posibles para tu empresa.",
      points: ["Valoración optimizada", "Múltiples ofertas", "Negociación experta"]
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
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
              <div key={index} className="bg-white rounded-xl shadow-lg p-8">
                <div className="flex items-center mb-6">
                  <div className="bg-black text-white rounded-full w-12 h-12 flex items-center justify-center mr-4">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-2xl font-bold text-black">
                    {approach.title}
                  </h3>
                </div>
                
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {approach.description}
                </p>
                
                <ul className="space-y-2">
                  {approach.points.map((point, pointIndex) => (
                    <li key={pointIndex} className="flex items-center text-gray-700">
                      <div className="w-2 h-2 bg-black rounded-full mr-3"></div>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PorQueElegirnosApproach;
