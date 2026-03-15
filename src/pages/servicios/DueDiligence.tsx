import React from 'react';
import { useLocation } from 'react-router-dom';
import UnifiedLayout from '@/components/shared/UnifiedLayout';
import { SEOHead } from '@/components/seo';
import { getServiceSchema, getBreadcrumbSchema } from '@/utils/seo';
import { useHreflang } from '@/hooks/useHreflang';
import DueDiligenceHero from '@/components/due-diligence/DueDiligenceHero';
import DueDiligenceTypes from '@/components/due-diligence/DueDiligenceTypes';
import DueDiligenceProcess from '@/components/due-diligence/DueDiligenceProcess';
import DueDiligenceBenefits from '@/components/due-diligence/DueDiligenceBenefits';
import DueDiligenceFAQ from '@/components/due-diligence/DueDiligenceFAQ';
import DueDiligenceCTA from '@/components/due-diligence/DueDiligenceCTA';
import ServiceClosedOperations from '@/components/shared/ServiceClosedOperations';

const DueDiligence = () => {
  const location = useLocation();
  useHreflang();
  
  return (
    <>
      <SEOHead 
        title="Due Diligence M&A - Análisis Exhaustivo de Empresas | Capittal"
        description="Servicio especializado de due diligence para fusiones y adquisiciones. Análisis financiero, legal, operacional y estratégico de empresas en España."
        canonical={`https://capittal.es${location.pathname}`}
        keywords="due diligence, análisis empresarial, auditoría M&A, España"
        structuredData={[
          getServiceSchema(
            "Due Diligence M&A",
            "Análisis exhaustivo de empresas para operaciones de fusión y adquisición"
          ),
          getBreadcrumbSchema([
            { name: 'Inicio', url: 'https://capittal.es/' },
            { name: 'Servicios', url: 'https://capittal.es/servicios' },
            { name: 'Due Diligence', url: 'https://capittal.es/servicios/due-diligence' }
          ])
        ]}
      />
      <UnifiedLayout variant="home">
        <DueDiligenceHero />
        <DueDiligenceTypes />
        <DueDiligenceProcess />
        <DueDiligenceBenefits />
        <DueDiligenceFAQ />
        <DueDiligenceCTA />
      </UnifiedLayout>
    </>
  );
};

export default DueDiligence;
