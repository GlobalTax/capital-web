
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
              **¿Listo para Decisiones Basadas en Datos?**
            </h2>
            <p className="text-xl text-gray-300 leading-relaxed max-w-3xl mx-auto">
              **No dejes tu inversión al azar. Buy-side o Vendor Due Diligence 
              con la experiencia de 150+ transacciones y €1.8B analizados.**
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
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contacto">
                <InteractiveHoverButton
                  text="**Buy-side Due Diligence**"
                  variant="secondary"
                  size="lg"
                  className="bg-blue-600 text-white border-blue-600 hover:bg-blue-700 hover:shadow-2xl text-lg px-8 py-4"
                />
              </Link>
              <Link to="/contacto">
                <InteractiveHoverButton
                  text="**Vendor Due Diligence**"
                  variant="secondary"
                  size="lg"
                  className="bg-purple-600 text-white border-purple-600 hover:bg-purple-700 hover:shadow-2xl text-lg px-8 py-4"
                />
              </Link>
            </div>
            
            <p className="text-gray-400 text-sm">
              **Consulta inicial gratuita • Informe en 4-8 semanas • 100% confidencial**
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
