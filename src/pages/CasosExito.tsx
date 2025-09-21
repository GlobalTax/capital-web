import React, { useEffect } from 'react';
import UnifiedLayout from '@/components/shared/UnifiedLayout';
import CaseStudies from '@/components/CaseStudies';

const CasosExito = () => {
  useEffect(() => {
    document.title = 'Casos de Éxito - Capittal';
    
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', 'Descubre nuestros casos de éxito en M&A. Más de 200 transacciones exitosas con resultados excepcionales para nuestros clientes.');
  }, []);

  return (
    <UnifiedLayout>
      <div className="pt-16">
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-5xl font-bold text-black mb-6">
                Casos de Éxito
              </h1>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Más de 200 transacciones exitosas que demuestran nuestra capacidad para maximizar 
                el valor en cada operación. Descubre cómo hemos ayudado a nuestros clientes.
              </p>
            </div>
          </div>
        </section>
        <CaseStudies />
      </div>
    </UnifiedLayout>
  );
};

export default CasosExito;