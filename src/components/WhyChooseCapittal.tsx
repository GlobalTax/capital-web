
import React from 'react';
import { Button } from '@/components/ui/button';
import { Shield, Users, TrendingUp, Award, Clock, Target, ArrowRight, CheckCircle } from 'lucide-react';

const WhyChooseCapittal = () => {
  const reasons = [
    {
      icon: <Award className="w-6 h-6" />,
      title: "Experiencia Probada",
      description: "Más de 15 años especializados exclusivamente en M&A, con un track record excepcional.",
      highlight: "200+ operaciones"
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Máximo Valor",
      description: "Conseguimos valoraciones superiores a la media del mercado gracias a nuestro proceso optimizado.",
      highlight: "40% más valor"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Equipo Dedicado",
      description: "Un equipo senior exclusivo para tu operación, sin delegar en juniors.",
      highlight: "100% senior"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Confidencialidad Total",
      description: "Proceso completamente confidencial que protege tu empresa durante toda la operación.",
      highlight: "0 filtraciones"
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Rapidez y Eficiencia",
      description: "Procesos optimizados que reducen los tiempos sin comprometer la calidad.",
      highlight: "6-8 meses"
    },
    {
      icon: <Target className="w-6 h-6" />,
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
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-black text-white rounded-full text-sm font-medium mb-8">
            <Award className="w-4 h-4 mr-2" />
            La Diferencia Capittal
          </div>
          
          <h2 className="text-5xl md:text-7xl font-normal text-black mb-8 leading-tight tracking-tight">
            Por Qué Elegir
            <br />
            <span className="text-black">Capittal</span>
          </h2>
          
          <p className="text-xl text-gray-600 leading-relaxed font-normal max-w-3xl mx-auto">
            No somos una consultora generalista. Somos especialistas en M&A que vivimos 
            y respiramos compraventa de empresas todos los días.
          </p>
        </div>

        {/* Main reasons grid - estilo dashboard limpio */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {reasons.map((reason, index) => (
            <div 
              key={index} 
              className="bg-white rounded-2xl border border-gray-200 shadow-2xl overflow-hidden"
            >
              {/* Header con fondo gris como el dashboard */}
              <div className="bg-gray-900 text-white p-6">
                <div className="flex items-center justify-between">
                  <div className="text-white">
                    {reason.icon}
                  </div>
                  <div className="bg-white text-black px-3 py-1 rounded-full text-xs font-bold">
                    {reason.highlight}
                  </div>
                </div>
                <h3 className="text-lg font-semibold mt-3 mb-1">
                  {reason.title}
                </h3>
                <p className="text-gray-300 text-sm">
                  Análisis especializado
                </p>
              </div>
              
              {/* Contenido con estilo limpio */}
              <div className="p-6">
                <p className="text-gray-600 leading-relaxed">
                  {reason.description}
                </p>
              </div>
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
                  className="flex items-start space-x-4"
                >
                  <div className="bg-green-100 rounded-full p-2 mt-1">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <p className="text-gray-600 leading-relaxed text-lg">
                    {benefit}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right side - CTA Card con estilo dashboard */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl overflow-hidden">
            <div className="bg-gray-900 text-white p-6">
              <h3 className="text-lg font-semibold mb-2">
                Valoración Empresarial
              </h3>
              <p className="text-gray-300 text-sm">
                Análisis en tiempo real
              </p>
            </div>
            
            <div className="p-6">
              <h4 className="text-xl font-bold text-black mb-4">
                ¿Quieres Saber Cuánto Vale tu Empresa?
              </h4>
              
              <p className="text-gray-600 mb-6">
                Obtén una valoración profesional gratuita y sin compromiso
              </p>
              
              <div className="space-y-4">
                <Button className="capittal-button text-lg px-8 py-4 w-full">
                  Valoración Gratuita
                  <ArrowRight className="ml-2" size={20} />
                </Button>
                
                <Button 
                  variant="outline" 
                  className="bg-transparent border-0.5 border-black rounded-lg px-8 py-4 text-lg font-normal hover:bg-black hover:text-white transition-all duration-300 w-full"
                >
                  Solicitar Reunión
                </Button>
              </div>
              
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
                <span className="text-gray-600 text-sm">Respuesta garantizada</span>
                <span className="font-bold text-gray-900 text-sm">24h</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseCapittal;
