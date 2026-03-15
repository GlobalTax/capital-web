import React from 'react';
import { useLocation } from 'react-router-dom';
import UnifiedLayout from '@/components/shared/UnifiedLayout';
import { SEOHead } from '@/components/seo';
import { getServiceSchema, getBreadcrumbSchema } from '@/utils/seo';
import { useHreflang } from '@/hooks/useHreflang';
import ValoracionesHero from '@/components/valoraciones/ValoracionesHero';
import ValoracionesMethodology from '@/components/valoraciones/ValoracionesMethodology';
import ValoracionesMultiples from '@/components/valoraciones/ValoracionesMultiples';
import ValoracionesProcess from '@/components/valoraciones/ValoracionesProcess';
import ValoracionesBenefits from '@/components/valoraciones/ValoracionesBenefits';
import ValoracionesFAQNew from '@/components/valoraciones/ValoracionesFAQNew';
import ValoracionesCTANew from '@/components/valoraciones/ValoracionesCTANew';

const Valoraciones = () => {
  const location = useLocation();
  useHreflang();
  
  return (
    <>
      <SEOHead 
        title="Valoración de Empresas - Métodos DCF, Múltiplos y Comparables | Capittal"
        description="Valoración profesional de empresas con métodos DCF, múltiplos sectoriales y comparables. Informes certificados para M&A, herencias y disputas societarias."
        canonical={`https://capittal.es${location.pathname}`}
        keywords="valoración de empresas, DCF, múltiplos de valoración, España"
        structuredData={[
          getServiceSchema(
            "Valoración de Empresas",
            "Valoraciones profesionales con metodologías reconocidas internacionalmente"
          ),
          getBreadcrumbSchema([
            { name: 'Inicio', url: 'https://capittal.es/' },
            { name: 'Servicios', url: 'https://capittal.es/servicios' },
            { name: 'Valoraciones', url: 'https://capittal.es/servicios/valoraciones' }
          ])
        ]}
      />
      <UnifiedLayout variant="home">
        <ValoracionesHero />
        <ValoracionesMethodology />
        <ValoracionesMultiples />
        <ValoracionesProcess />
        <ValoracionesBenefits />
        <ValoracionesFAQNew />
        <ValoracionesCTANew />
      </UnifiedLayout>
    </>
  );
};

export default Valoraciones;
