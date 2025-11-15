import React from 'react';
import UnifiedLayout from '@/components/shared/UnifiedLayout';
import { SEOHead } from '@/components/seo';
import { getOrganizationSchema, getWebPageSchema } from '@/utils/seo';
import Hero from '@/components/Hero';
import SocialProofCompact from '@/components/SocialProofCompact';
import Services from '@/components/Services';
import EcosistemaIntegral from '@/components/EcosistemaIntegral';
import CaseStudiesCompact from '@/components/CaseStudiesCompact';

import WhyChooseCapittal from '@/components/WhyChooseCapittal';
import Contact from '@/components/Contact';

const Index = () => {
  return (
    <UnifiedLayout variant="home">
      <SEOHead 
        title="Capittal - Especialistas en M&A, Valoraciones y Due Diligence en España"
        description="Capittal es tu socio estratégico en fusiones y adquisiciones. Más de 200 operaciones exitosas en M&A, valoraciones empresariales, due diligence y reestructuraciones en España."
        canonical="https://capittal.es/"
        keywords="M&A España, fusiones y adquisiciones, valoración de empresas, due diligence, venta de empresas"
        structuredData={[
          getOrganizationSchema(),
          getWebPageSchema(
            "Capittal - Especialistas en M&A",
            "Servicios especializados en fusiones y adquisiciones, valoraciones empresariales, due diligence y reestructuraciones en España",
            "https://capittal.es/"
          )
        ]}
      />
      <Hero />
      <SocialProofCompact />
      <Services />
      <EcosistemaIntegral />
      <CaseStudiesCompact />
      <WhyChooseCapittal />
      <Contact />
    </UnifiedLayout>
  );
};

export default Index;
