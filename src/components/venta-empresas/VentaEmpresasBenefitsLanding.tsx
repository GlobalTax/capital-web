import React from 'react';
import { TrendingUp, Shield, Clock, Target, Users, Award } from 'lucide-react';

const VentaEmpresasBenefitsLanding = () => {
  const benefits = [
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: "¡MÁXIMO PRECIO GARANTIZADO!",
      description: "Conseguimos hasta un 35% más que la competencia. ¡Tu empresa vale más de lo que crees!",
      highlight: "+35% vs competencia",
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200"
    },
    {
      icon: <Clock className="h-8 w-8" />,
      title: "PROCESO ULTRA-RÁPIDO",
      description: "Valoración gratuita en 48h. Venta completa en 6-9 meses. ¡No pierdas más tiempo!",
      highlight: "48h valoración",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200"
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "100% CONFIDENCIAL",
      description: "Tu privacidad es sagrada. Proceso totalmente discreto y profesional.",
      highlight: "Confidencialidad total",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200"
    },
    {
      icon: <Target className="h-8 w-8" />,
      title: "ÉXITO GARANTIZADO",
      description: "95% de nuestras operaciones se cierran exitosamente. ¡Los números hablan!",
      highlight: "95% éxito",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200"
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "EXPERTOS DEDICADOS",
      description: "Equipo 100% dedicado a TU operación. Atención personalizada de principio a fin.",
      highlight: "Equipo dedicado",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      borderColor: "border-indigo-200"
    },
    {
      icon: <Award className="h-8 w-8" />,
      title: "200+ OPERACIONES EXITOSAS",
      description: "Respaldo comprobado. Más de €2.5B en transacciones gestionadas exitosamente.",
      highlight: "€2.5B+ gestionados",
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            ¿Por Qué Elegir <span className="text-blue-600">Capittal</span>?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            <strong>¡Porque conseguimos resultados extraordinarios!</strong> Más de 200 empresarios han confiado en nosotros para vender sus empresas al máximo precio.
          </p>
          
          {/* Urgency Banner */}
          <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-full text-lg font-bold animate-pulse">
            🔥 ¡SOLO 3 PLAZAS DISPONIBLES ESTE MES! 🔥
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className={`group p-8 rounded-2xl border-2 ${benefit.borderColor} ${benefit.bgColor} hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer`}
            >
              <div className={`${benefit.color} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                {benefit.icon}
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {benefit.title}
              </h3>
              
              <p className="text-gray-700 mb-4 leading-relaxed">
                {benefit.description}
              </p>
              
              <div className={`inline-flex items-center px-3 py-1 ${benefit.bgColor} ${benefit.color} rounded-full text-sm font-bold border ${benefit.borderColor}`}>
                ⭐ {benefit.highlight}
              </div>
            </div>
          ))}
        </div>

        {/* Social Proof Section */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-6">¡Nuestros Clientes lo Confirman!</h3>
          
          <div className="grid md:grid-cols-3 gap-8 mb-6">
            <div className="space-y-2">
              <div className="text-3xl font-bold text-yellow-400">⭐⭐⭐⭐⭐</div>
              <div className="text-lg font-semibold">4.9/5</div>
              <div className="text-sm text-gray-300">Valoración clientes</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-green-400">98%</div>
              <div className="text-lg font-semibold">Satisfacción</div>
              <div className="text-sm text-gray-300">Clientes satisfechos</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-blue-400">100%</div>
              <div className="text-lg font-semibold">Recomendación</div>
              <div className="text-sm text-gray-300">Nos recomiendan</div>
            </div>
          </div>

          <div className="italic text-lg text-gray-300 max-w-2xl mx-auto">
            "Capittal consiguió vender mi empresa por €2.3M, cuando otras consultoras me ofrecían €1.7M máximo. 
            ¡Increíble equipo y resultados espectaculares!"
          </div>
          <div className="mt-4 text-yellow-400 font-semibold">
            - María González, Fundadora TechSolutions
          </div>
        </div>
      </div>
    </section>
  );
};

export default VentaEmpresasBenefitsLanding;