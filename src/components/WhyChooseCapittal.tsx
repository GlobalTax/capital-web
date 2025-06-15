
import React from 'react';
import { Button } from '@/components/ui/button';
import { Shield, Users, TrendingUp, Award, Clock, Target, ArrowRight, CheckCircle } from 'lucide-react';

const WhyChooseCapittal = () => {
  const reasons = [
    {
      icon: <Award className="w-8 h-8" />,
      title: "Experiencia Probada",
      description: "Más de 15 años especializados exclusivamente en M&A, con un track record excepcional.",
      highlight: "200+ operaciones"
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Máximo Valor",
      description: "Conseguimos valoraciones superiores a la media del mercado gracias a nuestro proceso optimizado.",
      highlight: "40% más valor"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Equipo Dedicado",
      description: "Un equipo senior exclusivo para tu operación, sin delegar en juniors.",
      highlight: "100% senior"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Confidencialidad Total",
      description: "Proceso completamente confidencial que protege tu empresa durante toda la operación.",
      highlight: "0 filtraciones"
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "Rapidez y Eficiencia",
      description: "Procesos optimizados que reducen los tiempos sin comprometer la calidad.",
      highlight: "6-8 meses"
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Enfoque Personalizado",
      description: "Estrategia específica para tu sector y características únicas de tu empresa.",
      highlight: "100% personalizado"
    }
  ];

  const benefits = [
    "Acceso a nuestra red exclusiva de compradores internacionales",
    "Valoración gratuita y sin compromiso de tu empresa",
    "Acompañamiento completo desde la preparación hasta el cierre",
    "Negociación experta que maximiza precio y términos",
    "Due diligence coordinado para minimizar disrupciones"
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 via-white to-gray-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50/30 to-purple-50/30"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-black text-white rounded-full text-sm font-medium mb-6">
            <Award className="w-4 h-4 mr-2" />
            La Diferencia Capittal
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-black mb-6">
            Por Qué Elegir
            <br />
            <span className="text-black">Capittal</span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            No somos una consultora generalista. Somos especialistas en M&A que vivimos 
            y respiramos compraventa de empresas todos los días.
          </p>
        </div>

        {/* Main reasons grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {reasons.map((reason, index) => (
            <div 
              key={index} 
              className="group bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-2xl hover:-translate-y-3 transition-all duration-500 relative overflow-hidden"
            >
              {/* Background gradient on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative z-10">
                {/* Icon and highlight */}
                <div className="flex items-center justify-between mb-6">
                  <div className="text-black group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                    {reason.icon}
                  </div>
                  <div className="bg-black text-white px-3 py-1 rounded-full text-sm font-bold">
                    {reason.highlight}
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-black mb-4 group-hover:text-gray-800 transition-colors">
                  {reason.title}
                </h3>
                
                <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors">
                  {reason.description}
                </p>
              </div>

              {/* Hover line effect */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-black to-gray-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
            </div>
          ))}
        </div>

        {/* Benefits section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left side - Benefits list */}
          <div>
            <h3 className="text-3xl font-bold text-black mb-8">
              Lo Que Incluye Nuestro Servicio
            </h3>
            
            <div className="space-y-6">
              {benefits.map((benefit, index) => (
                <div 
                  key={index} 
                  className="flex items-start space-x-4 group"
                >
                  <div className="bg-green-100 rounded-full p-2 group-hover:bg-green-200 transition-colors duration-300">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <p className="text-gray-700 leading-relaxed group-hover:text-black transition-colors duration-300">
                    {benefit}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right side - CTA Card */}
          <div className="bg-gradient-to-br from-black via-gray-900 to-black text-white rounded-3xl p-8 relative overflow-hidden shadow-2xl">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
            
            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-4">
                ¿Quieres Saber Cuánto Vale tu Empresa?
              </h3>
              
              <p className="text-lg mb-6 opacity-90">
                Obtén una valoración profesional gratuita y sin compromiso
              </p>
              
              <div className="space-y-4">
                <Button className="bg-white text-black hover:bg-gray-100 w-full py-4 text-lg font-semibold hover:scale-105 transition-all duration-300">
                  Valoración Gratuita
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                
                <Button 
                  variant="outline" 
                  className="border-2 border-white text-white hover:bg-white hover:text-black w-full py-4 text-lg font-semibold hover:scale-105 transition-all duration-300"
                >
                  Solicitar Reunión
                </Button>
              </div>
              
              <div className="flex items-center justify-center mt-6 pt-6 border-t border-gray-600">
                <div className="flex items-center space-x-4 text-sm">
                  <span className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    24h respuesta
                  </span>
                  <span className="flex items-center">
                    <Shield className="w-4 h-4 mr-1" />
                    100% confidencial
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseCapittal;
