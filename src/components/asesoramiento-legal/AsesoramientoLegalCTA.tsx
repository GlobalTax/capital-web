
import React from 'react';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import { Link } from 'react-router-dom';

const AsesoramientoLegalCTA = () => {
  return (
    <section className="py-20 bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="space-y-8">
          <div className="space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold leading-tight">
              ¿Listo para Proteger tu Operación?
            </h2>
            <p className="text-xl text-gray-300 leading-relaxed max-w-3xl mx-auto">
              No dejes los aspectos legales al azar. Nuestro equipo de expertos en M&A 
              protegerá tus intereses en cada paso de la operación.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">200+</div>
              <div className="text-gray-400 text-sm">Operaciones Protegidas</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">€2.5B</div>
              <div className="text-gray-400 text-sm">Valor Asegurado</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">98%</div>
              <div className="text-gray-400 text-sm">Sin Litigios</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">15+</div>
              <div className="text-gray-400 text-sm">Años Experiencia</div>
            </div>
          </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contacto">
                <InteractiveHoverButton
                  text="Consulta Legal Gratuita"
                  variant="secondary"
                  size="lg"
                  className="bg-white text-black border-white hover:shadow-2xl text-lg px-12 py-4"
                />
              </Link>
              
              <Link to="/servicios/asesoramiento-legal/tecnico">
                <InteractiveHoverButton
                  text="Documentación Técnica"
                  variant="outline"
                  size="lg"
                  className="border-white text-white hover:bg-white hover:text-black text-lg px-8 py-4"
                />
              </Link>
            </div>
            
            <p className="text-gray-400 text-sm">
              Consulta inicial gratuita • Respuesta en 24h • 100% confidencial
            </p>

          <div className="pt-8 border-t border-gray-700">
            <p className="text-gray-400 mb-4">
              ¿Tienes una consulta urgente? Contacta directamente con nuestro equipo legal
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <a 
                href="tel:+34917702717"
                className="flex items-center space-x-2 text-white hover:text-gray-300 transition-colors duration-300"
              >
                <span>📞 +34 917 702 717</span>
              </a>
              <a 
                href="mailto:legal@capittal.com"
                className="flex items-center space-x-2 text-white hover:text-gray-300 transition-colors duration-300"
              >
                <span>✉️ legal@capittal.com</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AsesoramientoLegalCTA;
