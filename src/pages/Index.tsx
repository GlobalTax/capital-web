import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import UnifiedLayout from '@/components/shared/UnifiedLayout';
import { SEOHead } from '@/components/seo';
import { getOrganizationSchema, getWebPageSchema, getFinancialServiceSchema } from '@/utils/seo';
import { useI18n } from '@/shared/i18n/I18nProvider';
import Hero from '@/components/Hero';
import SocialProofCompact from '@/components/SocialProofCompact';
import LaFirmaSection from '@/components/home/LaFirmaSection';
import SearchFundsCTA from '@/components/home/SearchFundsCTA';
import PracticeAreasSection from '@/components/home/PracticeAreasSection';
import EcosistemaIntegral from '@/components/EcosistemaIntegral';
import CaseStudiesCompact from '@/components/CaseStudiesCompact';
import WhyChooseCapittal from '@/components/WhyChooseCapittal';
import MANewsSection from '@/components/home/MANewsSection';
import GuideDownloadSection from '@/components/home/GuideDownloadSection';
import Contact from '@/components/Contact';

const Index = () => {
  const { t, setLang } = useI18n();
  const location = useLocation();
  
  // Detect language from URL
  useEffect(() => {
    const path = location.pathname;
    if (path === '/ca' || path === '/inici') {
      setLang('ca');
    } else if (path === '/en' || path === '/home') {
      setLang('en');
    } else {
      setLang('es');
    }
  }, [location.pathname, setLang]);
  
  // Hreflang managed by useHreflang hook (via routeMap)
  
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
          ),
          getFinancialServiceSchema()
        ]}
      />
      <Hero />
      <SocialProofCompact />
      <LaFirmaSection />
      <SearchFundsCTA />
      <PracticeAreasSection />
      <EcosistemaIntegral />
      <CaseStudiesCompact />
      <MANewsSection />
      <GuideDownloadSection />
      <WhyChooseCapittal />
      <Contact />
    </UnifiedLayout>
  );
};

export default Index;
