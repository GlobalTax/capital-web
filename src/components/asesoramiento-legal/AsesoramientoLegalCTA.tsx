
import React from 'react';
import { SimpleButton } from '@/components/ui/simple-button';
import { Link } from 'react-router-dom';

const AsesoramientoLegalCTA = () => {
  return (
    <section className="py-20 bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="space-y-8">
          <div className="space-y-6">
            <h2 className="text-4xl md:text-5xl font-normal leading-tight">
              ¿Listo para Proteger tu Operación?
            </h2>
            <p className="text-xl text-gray-300 leading-relaxed max-w-3xl mx-auto">
              No dejes los aspectos legales al azar. Nuestro equipo de expertos en M&A 
              protegerá tus intereses en cada paso de la operación.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">+100</div>
              <div className="text-gray-400 text-sm">Operaciones Protegidas</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">905 millones</div>
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

            <div className="flex justify-center">
              <Link to="/contacto">
                <SimpleButton
                  text="Consulta"
                  variant="secondary"
                  size="lg"
                  className="bg-white text-black border-white hover:shadow-2xl text-lg px-12 py-4"
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

export default AsesoramientoLegalCTA;
