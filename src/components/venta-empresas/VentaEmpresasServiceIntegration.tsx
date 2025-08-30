import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Scale, Calculator, FileText, Shield, Users, Target } from 'lucide-react';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';

const VentaEmpresasServiceIntegration = () => {
  const integratedServices = [
    {
      icon: <Scale className="h-8 w-8" />,
      title: "Asesoramiento Legal",
      description: "Due diligence legal completo, estructuración jurídica y contratos de compraventa.",
      link: "/servicios/asesoramiento-legal",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200"
    },
    {
      icon: <Calculator className="h-8 w-8" />,
      title: "Planificación Fiscal",
      description: "Optimización fiscal de la operación y minimización del impacto tributario.",
      link: "/servicios/planificacion-fiscal",
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200"
    },
    {
      icon: <FileText className="h-8 w-8" />,
      title: "Due Diligence Integral",
      description: "Análisis exhaustivo financiero, legal, comercial y operativo de la empresa.",
      link: "/servicios/due-diligence",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200"
    }
  ];

  const processIntegration = [
    {
      phase: "Preparación",
      services: ["Valoración empresarial", "Asesoramiento legal inicial", "Optimización fiscal"],
      icon: <Target className="h-6 w-6" />
    },
    {
      phase: "Due Diligence",
      services: ["Análisis financiero", "Revisión legal completa", "Auditoría fiscal"],
      icon: <Shield className="h-6 w-6" />
    },
    {
      phase: "Negociación",
      services: ["Estructura de la operación", "Aspectos legales", "Implicaciones fiscales"],
      icon: <Users className="h-6 w-6" />
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4">
        
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-6">
            Enfoque Integral M&A
          </div>
          
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Servicios <span className="text-blue-600">Integrados</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto">
            Nuestro servicio de venta de empresas se integra perfectamente con nuestras otras 
            especialidades M&A, ofreciendo un <strong>asesoramiento 360° completo</strong> para 
            maximizar el valor y minimizar los riesgos de tu operación.
          </p>
        </div>

        {/* Integrated Services Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {integratedServices.map((service, index) => (
            <div
              key={index}
              className={`p-8 rounded-2xl border-2 ${service.borderColor} ${service.bgColor} hover:shadow-xl transition-all duration-300 group`}
            >
              <div className={`${service.color} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                {service.icon}
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {service.title}
              </h3>
              
              <p className="text-gray-700 mb-6 leading-relaxed">
                {service.description}
              </p>
              
              <Link to={service.link}>
                <InteractiveHoverButton
                  variant="outline"
                  size="sm"
                  className={`w-full ${service.color} border-current hover:bg-current hover:text-white`}
                >
                  Ver Servicio
                  <ArrowRight className="ml-2 h-4 w-4" />
                </InteractiveHoverButton>
              </Link>
            </div>
          ))}
        </div>

        {/* Process Integration */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <h3 className="text-3xl font-bold text-gray-900 text-center mb-8">
            Integración por Fases del Proceso
          </h3>
          
          <div className="grid md:grid-cols-3 gap-8">
            {processIntegration.map((phase, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white">
                  {phase.icon}
                </div>
                
                <h4 className="text-xl font-bold text-gray-900 mb-4">
                  {phase.phase}
                </h4>
                
                <div className="space-y-2">
                  {phase.services.map((service, serviceIndex) => (
                    <div key={serviceIndex} className="text-gray-600 text-sm bg-gray-50 rounded-lg px-3 py-2">
                      {service}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits of Integration */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-3xl font-bold mb-6">
                Ventajas del Enfoque Integrado
              </h3>
              
              <div className="space-y-4">
                {[
                  {
                    title: "Mayor Eficiencia",
                    description: "Un solo equipo coordinado en lugar de múltiples consultores"
                  },
                  {
                    title: "Mejor Precio Final",
                    description: "Optimización integral que maximiza el valor de la operación"
                  },
                  {
                    title: "Menor Riesgo",
                    description: "Identificación temprana de contingencias en todas las áreas"
                  },
                  {
                    title: "Proceso Más Rápido",
                    description: "Coordinación perfecta entre servicios acelera los tiempos"
                  }
                ].map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex-shrink-0 mt-1 flex items-center justify-center">
                      <div className="w-2 h-2 bg-yellow-300 rounded-full"></div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg">{benefit.title}</h4>
                      <p className="text-blue-100">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="text-center">
              <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-6 border border-white border-opacity-20">
                <h4 className="text-2xl font-bold mb-4">Resultado Integrado</h4>
                <div className="text-4xl font-bold text-yellow-300 mb-2">+15-25%</div>
                <div className="text-blue-100">Incremento promedio en el precio final</div>
                <div className="text-sm text-blue-200 mt-4">
                  Comparado con operaciones sin enfoque integrado
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              ¿Quieres Conocer Más Sobre Nuestro Enfoque Integrado?
            </h3>
            <p className="text-gray-600 mb-6">
              Descubre cómo nuestros servicios integrados pueden maximizar el valor de tu operación
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/servicios">
                <InteractiveHoverButton
                  variant="outline"
                  size="lg"
                  className="text-blue-600 border-blue-600 hover:bg-blue-600 hover:text-white"
                >
                  Ver Todos los Servicios
                </InteractiveHoverButton>
              </Link>
              
              <InteractiveHoverButton
                variant="primary"
                size="lg"
                onClick={() => {
                  const element = document.getElementById('contact');
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                Solicitar Consulta Integrada
                <ArrowRight className="ml-2 h-5 w-5" />
              </InteractiveHoverButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VentaEmpresasServiceIntegration;