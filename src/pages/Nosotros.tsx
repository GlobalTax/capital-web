import React, { useEffect } from 'react';
import UnifiedLayout from '@/components/shared/UnifiedLayout';
import About from '@/components/About';
import OurGroup from '@/components/OurGroup';

const Nosotros = () => {
  useEffect(() => {
    document.title = 'Nosotros - Capittal';
    
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', 'Conoce Capittal y el Grupo Navarro. Más de 15 años de experiencia en M&A con un ecosistema integral de servicios profesionales.');
  }, []);

  return (
    <UnifiedLayout variant="home">
      <div className="pt-16">
        <section className="py-32 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-24">
              <h1 className="text-4xl md:text-5xl font-bold text-black mb-6">
                Nosotros
              </h1>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed mb-16">
                Especialistas en M&A respaldados por el ecosistema integral del Grupo Navarro 
                para garantizar el éxito de cada transacción con más de dos décadas de experiencia.
              </p>
              
              {/* Unified Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div className="text-center">
                  <div className="text-4xl font-light text-black mb-2">25+</div>
                  <div className="text-sm text-gray-600 uppercase tracking-wide">Años Experiencia</div>
                </div>
                
                <div className="text-center">
                  <div className="text-4xl font-light text-black mb-2">100+</div>
                  <div className="text-sm text-gray-600 uppercase tracking-wide">Transacciones</div>
                </div>
                
                <div className="text-center">
                  <div className="text-4xl font-light text-black mb-2">€900M</div>
                  <div className="text-sm text-gray-600 uppercase tracking-wide">Valor Gestionado</div>
                </div>
                
                <div className="text-center">
                  <div className="text-4xl font-light text-black mb-2">98,7%</div>
                  <div className="text-sm text-gray-600 uppercase tracking-wide">Tasa Éxito</div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <About />
        <OurGroup />
      </div>
    </UnifiedLayout>
  );
};

export default Nosotros;