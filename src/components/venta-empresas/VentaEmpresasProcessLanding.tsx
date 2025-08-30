import React from 'react';
import { Search, FileText, Users, Handshake, CheckCircle } from 'lucide-react';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';

const VentaEmpresasProcessLanding = () => {
  const scrollToContact = () => {
    const element = document.getElementById('contact');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const steps = [
    {
      number: "1",
      icon: <Search className="h-8 w-8" />,
      title: "¡VALORACIÓN GRATUITA!",
      description: "En 48h sabrás EXACTAMENTE cuánto vale tu empresa. ¡Sin compromisos!",
      duration: "48 horas",
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200"
    },
    {
      number: "2",
      icon: <FileText className="h-8 w-8" />,
      title: "PREPARACIÓN PERFECTA",
      description: "Optimizamos tu empresa para conseguir el MÁXIMO precio. ¡Cada detalle cuenta!",
      duration: "2-4 semanas",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200"
    },
    {
      number: "3",
      icon: <Users className="h-8 w-8" />,
      title: "BÚSQUEDA DE COMPRADORES",
      description: "Encontramos a los compradores perfectos que pagarán MÁS por tu empresa.",
      duration: "4-8 semanas",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200"
    },
    {
      number: "4",
      icon: <Handshake className="h-8 w-8" />,
      title: "NEGOCIACIÓN EXPERTA",
      description: "Negociamos como leones para conseguir las MEJORES condiciones para ti.",
      duration: "2-4 semanas",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200"
    },
    {
      number: "5",
      icon: <CheckCircle className="h-8 w-8" />,
      title: "¡CIERRE EXITOSO!",
      description: "¡Cobras tu dinero y celebramos juntos el éxito! Misión cumplida.",
      duration: "2-3 semanas",
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200"
    }
  ];

  return (
    <section id="proceso" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            ¡Proceso <span className="text-blue-600">Súper Fácil</span>!
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            <strong>¡Solo 5 pasos sencillos!</strong> En 6-9 meses tendrás tu dinero en el banco. 
            Nosotros nos encargamos de TODO para que tú solo tengas que firmar y cobrar.
          </p>
          
          {/* Time Guarantee */}
          <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full text-lg font-bold">
            ⚡ GARANTÍA: ¡Proceso completo en 6-9 meses o NO COBRAS! ⚡
          </div>
        </div>

        {/* Process Steps */}
        <div className="relative">
          {/* Connection Line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-300 to-purple-300 hidden lg:block"></div>

          <div className="space-y-12">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className={`flex flex-col lg:flex-row items-center gap-8 ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}>
                  
                  {/* Step Content */}
                  <div className="flex-1">
                    <div className={`p-8 rounded-2xl border-2 ${step.borderColor} ${step.bgColor} shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer`}>
                      <div className="flex items-start space-x-4">
                        <div className={`flex-shrink-0 w-16 h-16 ${step.bgColor} ${step.color} rounded-full flex items-center justify-center border-2 ${step.borderColor} group-hover:scale-110 transition-transform duration-300`}>
                          {step.icon}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <h3 className="text-2xl font-bold text-gray-900">
                              {step.title}
                            </h3>
                            <span className={`px-3 py-1 ${step.bgColor} ${step.color} rounded-full text-sm font-bold border ${step.borderColor}`}>
                              {step.duration}
                            </span>
                          </div>
                          
                          <p className="text-gray-700 text-lg leading-relaxed">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Step Number (Center) */}
                  <div className="flex-shrink-0 lg:absolute lg:left-1/2 lg:transform lg:-translate-x-1/2">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg">
                      {step.number}
                    </div>
                  </div>

                  {/* Spacer for alternating layout */}
                  <div className="flex-1 hidden lg:block"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Success Summary */}
        <div className="mt-16 bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 text-white text-center">
          <h3 className="text-3xl font-bold mb-6">¡Resultados que Hablan por Sí Solos!</h3>
          
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="space-y-2">
              <div className="text-3xl font-bold text-green-400">6-9</div>
              <div className="text-lg font-semibold">Meses promedio</div>
              <div className="text-sm text-gray-300">Proceso completo</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-blue-400">95%</div>
              <div className="text-lg font-semibold">Tasa de éxito</div>
              <div className="text-sm text-gray-300">Operaciones cerradas</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-purple-400">+35%</div>
              <div className="text-lg font-semibold">Más dinero</div>
              <div className="text-sm text-gray-300">Vs. competencia</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-yellow-400">48h</div>
              <div className="text-lg font-semibold">Valoración</div>
              <div className="text-sm text-gray-300">Completamente gratis</div>
            </div>
          </div>

          <InteractiveHoverButton
            variant="primary"
            size="lg"
            onClick={scrollToContact}
            className="text-lg px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-xl"
          >
            🚀 ¡EMPEZAR AHORA - VALORACIÓN GRATUITA!
          </InteractiveHoverButton>
        </div>
      </div>
    </section>
  );
};

export default VentaEmpresasProcessLanding;