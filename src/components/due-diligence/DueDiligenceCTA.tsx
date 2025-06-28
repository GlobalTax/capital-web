
import React from 'react';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import { Link } from 'react-router-dom';

const DueDiligenceCTA = () => {
  return (
    <section className="py-20 bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="space-y-8">
          <div className="space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold leading-tight">
              ¿Listo para un Análisis Completo?
            </h2>
            <p className="text-xl text-gray-300 leading-relaxed max-w-3xl mx-auto">
              No tomes decisiones de inversión a ciegas. Nuestro due diligence te proporciona 
              la información completa que necesitas para invertir con confianza.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">150+</div>
              <div className="text-gray-400 text-sm">Due Diligence Realizados</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">€1.8B</div>
              <div className="text-gray-400 text-sm">Valor Analizado</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">98%</div>
              <div className="text-gray-400 text-sm">Precisión</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">12</div>
              <div className="text-gray-400 text-sm">Áreas Analizadas</div>
            </div>
          </div>

          <div className="space-y-6">
            <Link to="/contacto">
              <InteractiveHoverButton
                text="Solicitar Due Diligence"
                variant="secondary"
                size="lg"
                className="bg-white text-black border-white hover:shadow-2xl text-lg px-12 py-4"
              />
            </Link>
            
            <p className="text-gray-400 text-sm">
              Análisis inicial gratuito • Informe en 6-8 semanas • 100% confidencial
            </p>
          </div>

          <div className="pt-8 border-t border-gray-700">
            <p className="text-gray-400 mb-4">
              ¿Necesitas un análisis urgente? Contacta directamente con nuestro equipo
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <a 
                href="tel:+34917702717"
                className="flex items-center space-x-2 text-white hover:text-gray-300 transition-colors duration-300"
              >
                <span>📞 +34 917 702 717</span>
              </a>
              <a 
                href="mailto:dd@capittal.com"
                className="flex items-center space-x-2 text-white hover:text-gray-300 transition-colors duration-300"
              >
                <span>✉️ dd@capittal.com</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DueDiligenceCTA;
