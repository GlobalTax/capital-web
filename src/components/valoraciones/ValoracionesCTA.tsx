
import React from 'react';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import { Calculator, Clock, TrendingUp, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

const ValoracionesCTA = () => {
  const garantias = [
    { icon: Clock, texto: '5 minutos o menos' },
    { icon: Shield, texto: '100% confidencial' },
    { icon: Calculator, texto: 'Metodología profesional' },
    { icon: TrendingUp, texto: 'Reporte completo PDF' }
  ];

  return (
    <section className="py-20 bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="space-y-8">
          <div className="space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold leading-tight">
              ¿Listo para Conocer el Valor de tu Empresa?
            </h2>
            <p className="text-xl text-gray-300 leading-relaxed max-w-3xl mx-auto">
              Únete a más de 500 empresarios que ya han descubierto el valor real 
              de sus negocios con nuestra calculadora profesional.
            </p>
          </div>

          {/* Garantías */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8">
            {garantias.map((garantia, index) => {
              const Icon = garantia.icon;
              return (
                <div key={index} className="flex flex-col items-center space-y-2">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-sm text-gray-300 text-center">{garantia.texto}</span>
                </div>
              );
            })}
          </div>

          {/* CTAs */}
          <div className="space-y-6">
            <Link to="/calculadora-valoracion">
              <InteractiveHoverButton
                text="Calcular Valoración Gratuita"
                variant="secondary"
                size="lg"
                className="bg-white text-black border-white hover:shadow-2xl text-lg px-12 py-4"
              />
            </Link>
            
            <p className="text-gray-400 text-sm">
              Sin registro requerido • Resultado inmediato • 100% gratuito
            </p>
          </div>

          {/* Social Proof */}
          <div className="pt-8 border-t border-gray-700">
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">500+</div>
                <div className="text-gray-400 text-sm">Empresas valoradas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">€2.8B+</div>
                <div className="text-gray-400 text-sm">Valor analizado</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">95%</div>
                <div className="text-gray-400 text-sm">Precisión</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">15+</div>
                <div className="text-gray-400 text-sm">Años experiencia</div>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="pt-8">
            <p className="text-gray-400 mb-4">
              ¿Necesitas ayuda o tienes preguntas específicas?
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <a 
                href="tel:+34917702717"
                className="flex items-center space-x-2 text-white hover:text-gray-300 transition-colors duration-300"
              >
                <span>📞 +34 917 702 717</span>
              </a>
              <a 
                href="mailto:contacto@capittal.com"
                className="flex items-center space-x-2 text-white hover:text-gray-300 transition-colors duration-300"
              >
                <span>✉️ contacto@capittal.com</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ValoracionesCTA;
