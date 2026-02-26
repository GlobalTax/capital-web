import React from 'react';
import { useLocation } from 'react-router-dom';
import UnifiedLayout from '@/components/shared/UnifiedLayout';
import { SEOHead } from '@/components/seo';
import { getServiceSchema, getBreadcrumbSchema } from '@/utils/seo';
import { useHreflang } from '@/hooks/useHreflang';
import AsesoramientoLegalHero from '@/components/asesoramiento-legal/AsesoramientoLegalHero';
import AsesoramientoLegalWhyChoose from '@/components/asesoramiento-legal/AsesoramientoLegalWhyChoose';
import AsesoramientoLegalServices from '@/components/asesoramiento-legal/AsesoramientoLegalServices';

import AsesoramientoLegalBenefits from '@/components/asesoramiento-legal/AsesoramientoLegalBenefits';
import AsesoramientoLegalFAQ from '@/components/asesoramiento-legal/AsesoramientoLegalFAQ';
import AsesoramientoLegalCTA from '@/components/asesoramiento-legal/AsesoramientoLegalCTA';

const AsesoramientoLegal = () => {
  const location = useLocation();
  useHreflang();
  
  return (
    <UnifiedLayout variant="home">
      <SEOHead 
        title="Asesoramiento Legal M&A | Capittal"
        description="Servicio legal especializado en compraventa de empresas: due diligence, contratos, disclosure, mitigación de riesgos y post‑closing."
        canonical={`https://capittal.es${location.pathname}`}
        keywords="asesoramiento legal M&A, contratos compraventa empresas, due diligence legal"
        structuredData={[
          getServiceSchema(
            "Asesoramiento Legal M&A",
            "Servicio legal integral para operaciones de fusiones y adquisiciones"
          ),
          getBreadcrumbSchema([
            { name: 'Inicio', url: 'https://capittal.es/' },
            { name: 'Servicios', url: 'https://capittal.es/servicios' },
            { name: 'Asesoramiento Legal', url: 'https://capittal.es/servicios/asesoramiento-legal' }
          ])
        ]}
      />
      <AsesoramientoLegalHero />
      <AsesoramientoLegalWhyChoose />
      <AsesoramientoLegalServices />
      
      <AsesoramientoLegalBenefits />
      <AsesoramientoLegalFAQ />
      <AsesoramientoLegalCTA />
    </UnifiedLayout>
  );
};

export default AsesoramientoLegal;