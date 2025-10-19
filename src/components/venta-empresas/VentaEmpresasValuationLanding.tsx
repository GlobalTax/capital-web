import React from 'react';
import { Calculator } from 'lucide-react';
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
            <div className="space-y-4">
              {[
                {
                  emoji: "⚡",
                  text: "Valoración profesional en 48 horas",
                  highlight: "GRATIS",
                  highlightColor: "bg-yellow-500/20 text-yellow-300 border border-yellow-500/50"
                },
                {
                  emoji: "📈",
                  text: "Identificamos oportunidades de mejora del valor",
                  highlight: "+35%",
                  highlightColor: "bg-green-500/20 text-green-300 border border-green-500/50"
                },
                {
                  emoji: "🧮",
                  text: "Múltiples metodologías de valoración",
                  highlight: "PRECISIÓN",
                  highlightColor: "bg-blue-500/20 text-blue-300 border border-blue-500/50"
                },
                {
                  emoji: "💰",
                  text: "Estrategias para maximizar el precio final",
                  highlight: "MÁXIMO €",
                  highlightColor: "bg-purple-500/20 text-purple-300 border border-purple-500/50"
                }
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-4">
                  <span className="text-2xl">{item.emoji}</span>
                  <span className="text-blue-100 flex-1 font-medium">{item.text}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${item.highlightColor}`}>
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
                className="w-full sm:w-auto text-lg px-8 py-6 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-extrabold shadow-2xl rounded-xl"
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
                  <div className="bg-white/10 p-4 rounded-xl border border-white/20 hover:border-yellow-400/50 transition-all">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-semibold text-blue-200">TechStart SL</span>
                      <span className="text-xs bg-green-500/20 text-green-300 px-3 py-1 rounded-full font-bold border border-green-500/50">+47%</span>
                    </div>
                    <div className="text-left space-y-1">
                      <div className="text-sm text-blue-300">Expectativa inicial: <span className="font-semibold">€850K</span></div>
                      <div className="text-lg font-bold text-yellow-400">Precio final: €1.25M 🎉</div>
                    </div>
                  </div>

                  <div className="bg-white/10 p-4 rounded-xl border border-white/20 hover:border-yellow-400/50 transition-all">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-semibold text-blue-200">Servicios Pro SA</span>
                      <span className="text-xs bg-green-500/20 text-green-300 px-3 py-1 rounded-full font-bold border border-green-500/50">+52%</span>
                    </div>
                    <div className="text-left space-y-1">
                      <div className="text-sm text-blue-300">Expectativa inicial: <span className="font-semibold">€2.1M</span></div>
                      <div className="text-lg font-bold text-yellow-400">Precio final: €3.2M 🚀</div>
                    </div>
                  </div>

                  <div className="bg-white/10 p-4 rounded-xl border border-white/20 hover:border-yellow-400/50 transition-all">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-semibold text-blue-200">E-commerce Plus</span>
                      <span className="text-xs bg-green-500/20 text-green-300 px-3 py-1 rounded-full font-bold border border-green-500/50">+38%</span>
                    </div>
                    <div className="text-left space-y-1">
                      <div className="text-sm text-blue-300">Expectativa inicial: <span className="font-semibold">€1.6M</span></div>
                      <div className="text-lg font-bold text-yellow-400">Precio final: €2.2M 💰</div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-6 -right-6 bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-5 py-2.5 rounded-full text-sm font-extrabold animate-bounce shadow-xl border-2 border-white/30">
              ¡GRATIS!
            </div>
            
            <div className="absolute -bottom-6 -left-6 bg-gradient-to-r from-green-400 to-emerald-500 text-black px-5 py-2.5 rounded-full text-sm font-extrabold shadow-xl border-2 border-white/30">
              48 HORAS
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VentaEmpresasValuationLanding;