import React from 'react';
import { useLocation } from 'react-router-dom';
import UnifiedLayout from '@/components/shared/UnifiedLayout';
import { SEOHead } from '@/components/seo';
import { getServiceSchema, getBreadcrumbSchema } from '@/utils/seo';
import { useHreflang } from '@/hooks/useHreflang';
import ReestructuracionesHero from '@/components/reestructuraciones/ReestructuracionesHero';
import ReestructuracionesProcess from '@/components/reestructuraciones/ReestructuracionesProcess';
import ReestructuracionesBenefits from '@/components/reestructuraciones/ReestructuracionesBenefits';
import ReestructuracionesFAQ from '@/components/reestructuraciones/ReestructuracionesFAQ';
import ReestructuracionesCTA from '@/components/reestructuraciones/ReestructuracionesCTA';
import ServiceClosedOperations from '@/components/shared/ServiceClosedOperations';

const Reestructuraciones = () => {
  const location = useLocation();
  useHreflang();
  
  return (
    <>
      <SEOHead 
        title="Reestructuraciones Empresariales y Financieras | Capittal"
        description="Servicios de reestructuración empresarial y financiera. Optimización de capital, refinanciación de deuda y planes de viabilidad en España."
        canonical={`https://capittal.es${location.pathname}`}
        keywords="reestructuración empresarial, refinanciación, viabilidad financiera"
        structuredData={[
          getServiceSchema(
            "Reestructuraciones Empresariales",
            "Reestructuración de capital y optimización financiera"
          ),
          getBreadcrumbSchema([
            { name: 'Inicio', url: 'https://capittal.es/' },
            { name: 'Servicios', url: 'https://capittal.es/servicios' },
            { name: 'Reestructuraciones', url: 'https://capittal.es/servicios/reestructuraciones' }
          ])
        ]}
      />
      <UnifiedLayout variant="home">
        <ReestructuracionesHero />
        <ReestructuracionesProcess />
        <ReestructuracionesBenefits />
        <ReestructuracionesFAQ />
        <ReestructuracionesCTA />
      </UnifiedLayout>
    </>
  );
};

export default Reestructuraciones;
