import React from 'react';
import UnifiedLayout from '@/components/shared/UnifiedLayout';
import CaseStudies from '@/components/CaseStudies';
import { SEOHead } from '@/components/seo';
import { getWebPageSchema } from '@/utils/seo';

const CasosExito = () => {
  return (
    <>
      <SEOHead 
        title="Casos de Éxito M&A - Más de 200 Transacciones | Capittal"
        description="Descubre nuestros casos de éxito en M&A. Más de 200 transacciones exitosas con resultados excepcionales para nuestros clientes en España."
        canonical="https://capittal.es/casos-exito"
        keywords="casos éxito M&A, transacciones exitosas, resultados M&A España, portfolio transacciones"
        structuredData={getWebPageSchema(
          "Casos de Éxito Capittal",
          "Más de 200 transacciones exitosas en fusiones y adquisiciones",
          "https://capittal.es/casos-exito"
        )}
      />
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
    </>
  );
};

export default CasosExito;