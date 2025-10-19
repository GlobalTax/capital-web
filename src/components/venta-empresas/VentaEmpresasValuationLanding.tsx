import React from 'react';
import { Calculator, Zap, TrendingUp, DollarSign } from 'lucide-react';
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
            <div className="inline-flex items-center px-4 py-2 bg-green-500/20 text-green-300 rounded-full text-sm font-bold border border-green-500/50">
              🎯 VALORACIÓN GRATUITA GARANTIZADA
            </div>

            <h2 className="text-4xl lg:text-5xl font-bold leading-tight">
              ¡Descubre Cuánto{" "}
              <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                Vale Tu Empresa
              </span>!
            </h2>

            <p className="text-xl text-blue-100 leading-relaxed">
              <strong className="text-white">¡Tu empresa vale MÁS de lo que crees!</strong> 
              Nuestro método exclusivo ha conseguido valoraciones hasta un <strong className="text-yellow-400">45% superiores</strong> a las expectativas iniciales de nuestros clientes.
            </p>

            {/* Value Propositions */}
            <div className="space-y-5">
              {[
                {
                  icon: Zap,
                  iconBg: "bg-yellow-500/20 border-yellow-500/30",
                  iconColor: "text-yellow-400",
                  text: "Valoración profesional en 48 horas",
                  highlight: "GRATIS",
                  highlightColor: "bg-yellow-500/20 text-yellow-300 border border-yellow-500/50"
                },
                {
                  icon: TrendingUp,
                  iconBg: "bg-green-500/20 border-green-500/30",
                  iconColor: "text-green-400",
                  text: "Identificamos oportunidades de mejora del valor",
                  highlight: "+35%",
                  highlightColor: "bg-green-500/20 text-green-300 border border-green-500/50"
                },
                {
                  icon: Calculator,
                  iconBg: "bg-blue-500/20 border-blue-500/30",
                  iconColor: "text-blue-400",
                  text: "Múltiples metodologías de valoración",
                  highlight: "PRECISIÓN",
                  highlightColor: "bg-blue-500/20 text-blue-300 border border-blue-500/50"
                },
                {
                  icon: DollarSign,
                  iconBg: "bg-purple-500/20 border-purple-500/30",
                  iconColor: "text-purple-400",
                  text: "Estrategias para maximizar el precio final",
                  highlight: "MÁXIMO €",
                  highlightColor: "bg-purple-500/20 text-purple-300 border border-purple-500/50"
                }
              ].map((item, index) => {
                const IconComponent = item.icon;
                return (
                  <div key={index} className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full ${item.iconBg} flex items-center justify-center border`}>
                      <IconComponent className={`w-6 h-6 ${item.iconColor}`} />
                    </div>
                    <span className="text-blue-100 flex-1 font-medium">{item.text}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${item.highlightColor}`}>
                      {item.highlight}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Urgency Call to Action */}
            <div className="space-y-4">
              <InteractiveHoverButton
                variant="primary"
                size="lg"
                onClick={scrollToContact}
                className="w-full sm:w-auto text-lg px-8 py-6 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-extrabold shadow-2xl hover:shadow-3xl rounded-xl transition-all duration-300"
              >
                🚀 ¡SOLICITAR VALORACIÓN GRATUITA AHORA!
              </InteractiveHoverButton>
              
              <p className="text-sm text-blue-200 font-medium">
                ⏰ <strong className="font-bold">Oferta limitada:</strong> Solo las primeras 10 solicitudes este mes reciben análisis completo gratuito
              </p>
            </div>
          </div>

          {/* Right Visual */}
          <div className="relative">
            {/* Main Card */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl">
              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mx-auto flex items-center justify-center shadow-lg">
                  <Calculator className="h-10 w-10 text-white" />
                </div>

                <h3 className="text-2xl font-bold">¡Casos de Éxito Reales!</h3>

                {/* Success Cases */}
                <div className="space-y-4">
                  <div className="bg-white/10 p-5 rounded-xl border border-white/20 hover:border-yellow-400/50 hover:scale-105 transition-all duration-300 cursor-pointer">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-semibold text-white">TechStart SL</span>
                      <span className="text-xs bg-green-500/20 text-green-300 px-3 py-1 rounded-full font-bold border border-green-500/50">+47%</span>
                    </div>
                    <div className="text-left space-y-1">
                      <div className="text-sm text-blue-200">Expectativa inicial: <span className="font-semibold text-blue-100">€850K</span></div>
                      <div className="text-xl font-extrabold text-yellow-400">Precio final: €1.25M 🎉</div>
                    </div>
                  </div>

                  <div className="bg-white/10 p-5 rounded-xl border border-white/20 hover:border-yellow-400/50 hover:scale-105 transition-all duration-300 cursor-pointer">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-semibold text-white">Servicios Pro SA</span>
                      <span className="text-xs bg-green-500/20 text-green-300 px-3 py-1 rounded-full font-bold border border-green-500/50">+52%</span>
                    </div>
                    <div className="text-left space-y-1">
                      <div className="text-sm text-blue-200">Expectativa inicial: <span className="font-semibold text-blue-100">€2.1M</span></div>
                      <div className="text-xl font-extrabold text-yellow-400">Precio final: €3.2M 🚀</div>
                    </div>
                  </div>

                  <div className="bg-white/10 p-5 rounded-xl border border-white/20 hover:border-yellow-400/50 hover:scale-105 transition-all duration-300 cursor-pointer">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-semibold text-white">E-commerce Plus</span>
                      <span className="text-xs bg-green-500/20 text-green-300 px-3 py-1 rounded-full font-bold border border-green-500/50">+38%</span>
                    </div>
                    <div className="text-left space-y-1">
                      <div className="text-sm text-blue-200">Expectativa inicial: <span className="font-semibold text-blue-100">€1.6M</span></div>
                      <div className="text-xl font-extrabold text-yellow-400">Precio final: €2.2M 💰</div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-6 -right-6 bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-6 py-3 rounded-full text-base font-extrabold animate-bounce shadow-2xl border-2 border-white/30">
              ¡GRATIS!
            </div>
            
            <div className="absolute -bottom-6 -left-6 bg-gradient-to-r from-green-400 to-emerald-500 text-black px-6 py-3 rounded-full text-base font-extrabold shadow-2xl border-2 border-white/30">
              48 HORAS
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VentaEmpresasValuationLanding;