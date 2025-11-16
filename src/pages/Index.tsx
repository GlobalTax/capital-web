import React from 'react';
import UnifiedLayout from '@/components/shared/UnifiedLayout';
import { SEOHead } from '@/components/seo';
import { getOrganizationSchema, getWebPageSchema } from '@/utils/seo';
import { useI18n } from '@/shared/i18n/I18nProvider';
import Hero from '@/components/Hero';
import SocialProofCompact from '@/components/SocialProofCompact';
import Services from '@/components/Services';
import EcosistemaIntegral from '@/components/EcosistemaIntegral';
import CaseStudiesCompact from '@/components/CaseStudiesCompact';
import WhyChooseCapittal from '@/components/WhyChooseCapittal';
import Contact from '@/components/Contact';

const Index = () => {
  const { t } = useI18n();
  
  return (
    <UnifiedLayout variant="home">
      <SEOHead 
        title={t('home.seo.title')}
        description={t('home.seo.description')}
        canonical="https://capittal.es/"
        keywords={t('home.seo.keywords')}
        structuredData={[
          getOrganizationSchema(),
          getWebPageSchema(
            t('home.seo.title'),
            t('home.seo.description'),
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
