import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { SEOHead } from '@/components/seo';
import { getServiceSchema } from '@/utils/seo';
import ValoracionesHero from '@/components/valoraciones/ValoracionesHero';
import ValoracionesMethodology from '@/components/valoraciones/ValoracionesMethodology';
import ValoracionesMultiples from '@/components/valoraciones/ValoracionesMultiples';
import ValoracionesProcess from '@/components/valoraciones/ValoracionesProcess';
import ValoracionesBenefits from '@/components/valoraciones/ValoracionesBenefits';
import ValoracionesFAQNew from '@/components/valoraciones/ValoracionesFAQNew';
import ValoracionesCTANew from '@/components/valoraciones/ValoracionesCTANew';

const Valoraciones = () => {
  console.log('🟢 VALORACIONES PAGE IS RENDERING - This should appear in console');
  
  return (
    <div className="min-h-screen bg-white">
      <SEOHead 
        title="Valoración de Empresas - Métodos DCF, Múltiplos y Comparables | Capittal"
        description="Valoración profesional de empresas con métodos DCF, múltiplos sectoriales y comparables. Informes certificados para M&A, herencias y disputas societarias."
        canonical="https://capittal.es/servicios/valoraciones"
        keywords="valoración de empresas, DCF, múltiplos de valoración, España"
        structuredData={getServiceSchema(
          "Valoración de Empresas",
          "Valoraciones profesionales con metodologías reconocidas internacionalmente"
        )}
      />
      <Header />
      <ValoracionesHero />
      <ValoracionesMethodology />
      <ValoracionesMultiples />
      <ValoracionesProcess />
      <ValoracionesBenefits />
      <ValoracionesFAQNew />
      <ValoracionesCTANew />
      <Footer />
    </div>
  );
};

export default Valoraciones;