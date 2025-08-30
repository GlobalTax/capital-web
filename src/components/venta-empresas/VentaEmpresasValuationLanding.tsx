import React from 'react';
import { Calculator, TrendingUp, DollarSign, Zap } from 'lucide-react';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';

const VentaEmpresasValuationLanding = () => {
  const scrollToContact = () => {
    const element = document.getElementById('contact');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="py-20 bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 text-white">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Content */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 bg-green-500 bg-opacity-20 text-green-300 rounded-full text-sm font-medium border border-green-500">
              🎯 VALORACIÓN GRATUITA GARANTIZADA
            </div>

            <h2 className="text-4xl lg:text-5xl font-bold leading-tight">
              ¡Descubre Cuánto
              <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent"> Vale Tu Empresa</span>!
            </h2>

            <p className="text-xl text-blue-100 leading-relaxed">
              <strong className="text-white">¡Tu empresa vale MÁS de lo que crees!</strong> 
              Nuestro método exclusivo ha conseguido valoraciones hasta un 45% superiores 
              a las expectativas iniciales de nuestros clientes.
            </p>

            {/* Value Propositions */}
            <div className="space-y-4">
              {[
                {
                  icon: <Zap className="h-6 w-6 text-yellow-400" />,
                  text: "Valoración profesional en 48 horas",
                  highlight: "GRATIS"
                },
                {
                  icon: <TrendingUp className="h-6 w-6 text-green-400" />,
                  text: "Identificamos oportunidades de mejora del valor",
                  highlight: "+35%"
                },
                {
                  icon: <Calculator className="h-6 w-6 text-blue-400" />,
                  text: "Múltiples metodologías de valoración",
                  highlight: "PRECISIÓN"
                },
                {
                  icon: <DollarSign className="h-6 w-6 text-purple-400" />,
                  text: "Estrategias para maximizar el precio final",
                  highlight: "MÁXIMO €"
                }
              ].map((item, index) => (
                <div key={index} className="flex items-center space-x-4">
                  {item.icon}
                  <span className="text-blue-100 flex-1">{item.text}</span>
                  <span className="px-2 py-1 bg-white bg-opacity-20 rounded-full text-xs font-bold text-yellow-300">
                    {item.highlight}
                  </span>
                </div>
              ))}
            </div>

            {/* Urgency Call to Action */}
            <div className="space-y-4">
              <InteractiveHoverButton
                variant="primary"
                size="lg"
                onClick={scrollToContact}
                className="w-full sm:w-auto text-lg px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold shadow-2xl"
              >
                🚀 ¡SOLICITAR VALORACIÓN GRATUITA AHORA!
              </InteractiveHoverButton>
              
              <p className="text-sm text-blue-200">
                ⏰ <strong>Oferta limitada:</strong> Solo las primeras 10 solicitudes este mes reciben análisis completo gratuito
              </p>
            </div>
          </div>

          {/* Right Visual */}
          <div className="relative">
            {/* Main Card */}
            <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-8 border border-white border-opacity-20 shadow-2xl">
              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mx-auto flex items-center justify-center shadow-lg">
                  <Calculator className="h-10 w-10 text-white" />
                </div>

                <h3 className="text-2xl font-bold">¡Casos de Éxito Reales!</h3>

                {/* Success Cases */}
                <div className="space-y-4">
                  <div className="bg-white bg-opacity-10 p-4 rounded-lg border border-white border-opacity-20">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-blue-200">TechStart SL</span>
                      <span className="text-xs bg-green-500 bg-opacity-20 text-green-300 px-2 py-1 rounded-full">+47%</span>
                    </div>
                    <div className="text-left">
                      <div className="text-sm text-blue-300">Expectativa inicial: €850K</div>
                      <div className="text-lg font-bold text-yellow-400">Precio final: €1.25M 🎉</div>
                    </div>
                  </div>

                  <div className="bg-white bg-opacity-10 p-4 rounded-lg border border-white border-opacity-20">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-blue-200">Servicios Pro SA</span>
                      <span className="text-xs bg-green-500 bg-opacity-20 text-green-300 px-2 py-1 rounded-full">+52%</span>
                    </div>
                    <div className="text-left">
                      <div className="text-sm text-blue-300">Expectativa inicial: €2.1M</div>
                      <div className="text-lg font-bold text-yellow-400">Precio final: €3.2M 🚀</div>
                    </div>
                  </div>

                  <div className="bg-white bg-opacity-10 p-4 rounded-lg border border-white border-opacity-20">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-blue-200">E-commerce Plus</span>
                      <span className="text-xs bg-green-500 bg-opacity-20 text-green-300 px-2 py-1 rounded-full">+38%</span>
                    </div>
                    <div className="text-left">
                      <div className="text-sm text-blue-300">Expectativa inicial: €1.6M</div>
                      <div className="text-lg font-bold text-yellow-400">Precio final: €2.2M 💰</div>
                    </div>
                  </div>
                </div>

                {/* Guarantee */}
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 bg-opacity-20 p-4 rounded-lg border border-green-400">
                  <p className="text-sm font-bold text-green-300">
                    🛡️ GARANTÍA TOTAL: Si no conseguimos más valor del que esperabas, 
                    no cobramos ni un euro. ¡Así de seguros estamos!
                  </p>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-6 -right-6 bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-4 py-2 rounded-full text-sm font-bold animate-bounce shadow-lg">
              ¡GRATIS!
            </div>
            
            <div className="absolute -bottom-6 -left-6 bg-gradient-to-r from-green-400 to-emerald-500 text-black px-4 py-2 rounded-full text-sm font-bold shadow-lg">
              48 HORAS
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VentaEmpresasValuationLanding;