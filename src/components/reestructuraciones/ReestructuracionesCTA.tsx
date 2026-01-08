
import React from 'react';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import { Link } from 'react-router-dom';

const ReestructuracionesCTA = () => {
  return (
    <section className="py-20 bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="space-y-8">
          <div className="space-y-6">
            <h2 className="text-4xl md:text-5xl font-normal leading-tight">
              ¿Tu Empresa Necesita una Transformación?
            </h2>
            <p className="text-xl text-gray-300 leading-relaxed max-w-3xl mx-auto">
              No esperes a que sea demasiado tarde. Nuestro equipo de expertos puede ayudarte 
              a transformar los desafíos en oportunidades de crecimiento sostenible.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">87%</div>
              <div className="text-gray-400 text-sm">Tasa de Éxito</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">€450M</div>
              <div className="text-gray-400 text-sm">Valor Recuperado</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">32%</div>
              <div className="text-gray-400 text-sm">Ahorro Promedio</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">18</div>
              <div className="text-gray-400 text-sm">Meses Recuperación</div>
            </div>
          </div>


          <div className="pt-8 border-t border-gray-700">
            <p className="text-gray-400 mb-4">
              ¿Situación urgente? Contacta directamente con nuestros especialistas
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <a 
                href="tel:+34695717490"
                className="flex items-center space-x-2 text-white hover:text-gray-300 transition-colors duration-300"
              >
                <span>📞 +34 695 717 490</span>
              </a>
              <a 
                href="mailto:samuel@capittal.es"
                className="flex items-center space-x-2 text-white hover:text-gray-300 transition-colors duration-300"
              >
                <span>✉️ samuel@capittal.es</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReestructuracionesCTA;
