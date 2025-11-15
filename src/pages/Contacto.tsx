import React from 'react';
import UnifiedLayout from '@/components/shared/UnifiedLayout';
import Contact from '@/components/Contact';
import { SEOHead } from '@/components/seo';
import { getWebPageSchema } from '@/utils/seo';

const Contacto = () => {
  return (
    <>
      <SEOHead 
        title="Contacto - Consulta Gratuita M&A | Capittal"
        description="Contacta con los expertos de Capittal. Consulta gratuita sobre valoración, venta o compra de empresas. Primera reunión sin compromiso."
        canonical="https://capittal.es/contacto"
        keywords="contacto M&A, consulta valoración empresas, asesoría M&A España, contacto fusiones adquisiciones"
        structuredData={getWebPageSchema(
          "Contacto Capittal",
          "Contacta con nuestros expertos en M&A para una consulta gratuita",
          "https://capittal.es/contacto"
        )}
      />
      <UnifiedLayout mainClassName="pt-16">
        <Contact />
      </UnifiedLayout>
    </>
  );
};

export default Contacto;