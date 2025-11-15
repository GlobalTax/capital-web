import React from 'react';
import Team from '@/components/Team';
import UnifiedLayout from '@/components/shared/UnifiedLayout';
import { SEOHead } from '@/components/seo';
import { getWebPageSchema } from '@/utils/seo/schemas';

const Equipo = () => {
  return (
    <>
      <SEOHead 
        title="Nuestro Equipo - Expertos en M&A | Capittal"
        description="Conoce al equipo de expertos en M&A de Capittal. Profesionales con experiencia global y resultados probados en transacciones empresariales."
        canonical="https://capittal.es/equipo"
        keywords="equipo M&A, expertos fusiones adquisiciones, profesionales M&A España"
        structuredData={getWebPageSchema(
          "Equipo Capittal",
          "Equipo de expertos en fusiones y adquisiciones",
          "https://capittal.es/equipo"
        )}
      />
      <UnifiedLayout>
        <Team />
      </UnifiedLayout>
    </>
  );
};

export default Equipo;