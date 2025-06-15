
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, Search, Calculator, Users, FileText, Target, Building, ShoppingCart, ArrowRight } from 'lucide-react';

const Services = () => {
  const coreServices = [
    {
      icon: <Building size={40} />,
      title: 'Vender Empresa',
      description: 'Maximizamos el valor de tu empresa con nuestro proceso probado de venta.',
      features: ['Valoración precisa', 'Proceso confidencial', 'Acceso a compradores cualificados']
    },
    {
      icon: <ShoppingCart size={40} />,
      title: 'Comprar Empresa',
      description: 'Te ayudamos a identificar, evaluar y adquirir empresas estratégicas.',
      features: ['Identificación objetivos', 'Due diligence completo', 'Negociación exitosa']
    },
    {
      icon: <Calculator size={40} />,
      title: 'Valoraciones',
      description: 'Evaluaciones precisas con metodologías probadas y análisis exhaustivo.',
      features: ['Múltiples metodologías', 'Análisis comparables', 'Informe detallado']
    },
  ];

  const complementaryServices = [
    {
      icon: <TrendingUp size={32} />,
      title: 'Fusiones y Adquisiciones',
      description: 'Asesoramiento integral en operaciones de M&A, desde la estrategia inicial hasta el cierre exitoso de la transacción.',
    },
    {
      icon: <Search size={32} />,
      title: 'Due Diligence',
      description: 'Análisis exhaustivo financiero, legal y comercial para identificar riesgos y oportunidades en cada inversión.',
    },
    {
      icon: <Users size={32} />,
      title: 'Corporate Finance',
      description: 'Estructuración financiera, levantamiento de capital y optimización de la estructura de balance.',
    },
    {
      icon: <FileText size={32} />,
      title: 'Reestructuraciones',
      description: 'Procesos de reestructuración operativa y financiera para maximizar el valor empresarial.',
    },
    {
      icon: <Target size={32} />,
      title: 'Estrategia Corporativa',
      description: 'Definición de estrategias de crecimiento inorgánico y identificación de oportunidades de mercado.',
    },
  ];

  return (
    <section id="servicios" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">
            Nuestros Servicios
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Servicios especializados en M&A y finanzas corporativas para impulsar el crecimiento de tu empresa.
          </p>
        </div>

        {/* Core Services - Enhanced Cards */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-black mb-4">
              Servicios Core Business
            </h3>
            <div className="w-24 h-1 bg-black mx-auto"></div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {coreServices.map((service, index) => (
              <div key={index} className="group relative">
                {/* Background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white rounded-2xl transform group-hover:scale-105 transition-transform duration-300"></div>
                
                {/* Main card */}
                <div className="relative bg-white border border-gray-200 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300">
                  {/* Icon */}
                  <div className="text-black mb-6 transform group-hover:scale-110 transition-transform duration-300">
                    {service.icon}
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-2xl font-bold text-black mb-4">
                    {service.title}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {service.description}
                  </p>

                  {/* Features */}
                  <div className="space-y-3 mb-8">
                    {service.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center">
                        <div className="w-2 h-2 bg-black rounded-full mr-3"></div>
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Button */}
                  <Button className="capittal-button group w-full">
                    Más información
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>

                {/* Accent line */}
                <div className="absolute top-0 left-8 right-8 h-1 bg-black rounded-b-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Complementary Services - Simplified Cards */}
        <div>
          <h3 className="text-2xl font-bold text-black text-center mb-8">
            Servicios Complementarios
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {complementaryServices.map((service, index) => (
              <Card key={index} className="capittal-card group cursor-pointer hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="text-black mb-4 group-hover:scale-110 transition-transform duration-300">
                    {service.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-black mb-3">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-sm">
                    {service.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;
