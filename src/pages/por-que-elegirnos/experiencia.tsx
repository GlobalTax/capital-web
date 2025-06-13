
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Award, Users, TrendingUp, Globe } from 'lucide-react';

const Experiencia = () => {
  const achievements = [
    {
      icon: Award,
      number: "25+",
      label: "Años de experiencia",
      description: "Más de dos décadas asesorando en operaciones de M&A"
    },
    {
      icon: Users,
      number: "500+",
      label: "Transacciones completadas",
      description: "Operaciones exitosas en múltiples sectores"
    },
    {
      icon: TrendingUp,
      number: "€5B+",
      label: "Valor total gestionado",
      description: "Valor agregado total en nuestras operaciones"
    },
    {
      icon: Globe,
      number: "15",
      label: "Países",
      description: "Presencia internacional con operaciones globales"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="pt-16">
        <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h1 className="text-5xl font-bold text-black mb-6">
                Nuestra Experiencia
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Décadas de experiencia respaldando cada decisión estratégica. 
                Nuestro track record habla por sí mismo.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
              {achievements.map((achievement, index) => {
                const Icon = achievement.icon;
                return (
                  <div key={index} className="text-center">
                    <div className="bg-black text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-8 w-8" />
                    </div>
                    <div className="text-4xl font-bold text-black mb-2">
                      {achievement.number}
                    </div>
                    <div className="text-lg font-semibold text-gray-800 mb-2">
                      {achievement.label}
                    </div>
                    <p className="text-gray-600 text-sm">
                      {achievement.description}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-3xl font-bold text-black mb-6 text-center">
                Sectores de Especialización
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <h3 className="text-xl font-bold text-black mb-4">Tecnología</h3>
                  <p className="text-gray-600">SaaS, Fintech, E-commerce, Software empresarial</p>
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-black mb-4">Healthcare</h3>
                  <p className="text-gray-600">Biotecnología, Dispositivos médicos, Servicios sanitarios</p>
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-black mb-4">Industrial</h3>
                  <p className="text-gray-600">Manufacturing, Logística, Energía renovable</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default Experiencia;
