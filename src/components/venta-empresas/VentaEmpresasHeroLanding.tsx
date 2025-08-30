import React from 'react';
import { CheckCircle, Phone, ArrowRight } from 'lucide-react';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';

const VentaEmpresasHeroLanding = () => {
  const scrollToContact = () => {
    const element = document.getElementById('contact');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const callExpert = () => {
    window.open('tel:+34900123456', '_self');
  };

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center">
      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              🚀 ¡OFERTA LIMITADA! Valoración Gratuita + Consulta Express
            </div>

            {/* Main Headline */}
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                ¡Vende Tu Empresa al
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Máximo Precio!</span>
              </h1>
              <p className="text-xl text-gray-600">
                <strong>Garantizamos el mejor precio</strong> para tu empresa. Más de <strong>200 operaciones exitosas</strong> nos respaldan. 
                <span className="text-green-600 font-semibold"> ¡Valoración gratuita en 48 horas!</span>
              </p>
            </div>

            {/* Benefits List */}
            <div className="grid md:grid-cols-2 gap-3">
              {[
                "✅ Máximo precio de venta",
                "⚡ Valoración en 48h",
                "🔒 Confidencialidad 100%",
                "🏆 +200 operaciones exitosas"
              ].map((benefit, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <span className="text-lg">{benefit}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <InteractiveHoverButton
                variant="primary"
                size="lg"
                onClick={scrollToContact}
                className="text-lg px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-xl"
              >
                🚀 ¡SOLICITAR VALORACIÓN GRATUITA!
                <ArrowRight className="ml-2 h-5 w-5" />
              </InteractiveHoverButton>
              
              <InteractiveHoverButton
                variant="outline"
                size="lg"
                onClick={callExpert}
                className="text-lg px-6 py-4 border-2 border-gray-900"
              >
                <Phone className="mr-2 h-5 w-5" />
                Hablar con Experto AHORA
              </InteractiveHoverButton>
            </div>

            {/* Trust Indicators */}
            <div className="pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500 mb-3">Confianza garantizada:</p>
              <div className="flex flex-wrap gap-6 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>+15 años experiencia</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>€2.5B+ en transacciones</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>98% satisfacción</span>
                </div>
              </div>
            </div>
          </div>

          {/* Visual Card */}
          <div className="relative">
            <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
              <div className="text-center space-y-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto flex items-center justify-center">
                  <span className="text-2xl text-white font-bold">€</span>
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900">¡Resultados Garantizados!</h3>
                
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">+25%</div>
                    <div className="text-sm text-gray-600">Precio promedio vs. competencia</div>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">6-9</div>
                    <div className="text-sm text-gray-600">Meses proceso</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">Sectores Estrella 🌟</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>• Tecnología (+35% premium)</div>
                    <div>• E-commerce (+30% premium)</div>
                    <div>• Servicios Profesionales (+25%)</div>
                    <div>• Salud y Wellness (+28%)</div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-orange-100 to-red-100 p-3 rounded-lg">
                  <p className="text-sm font-medium text-orange-800">
                    ⏰ <strong>¡Solo quedan 3 plazas este mes!</strong>
                  </p>
                </div>
              </div>
            </div>

            {/* Floating badges */}
            <div className="absolute -top-4 -right-4 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
              ¡OFERTA!
            </div>
            <div className="absolute -bottom-4 -left-4 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
              GRATUITO
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VentaEmpresasHeroLanding;