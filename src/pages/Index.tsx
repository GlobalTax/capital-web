import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
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
  
  // Add hreflang links
  useEffect(() => {
    const hreflangUrls = {
      'es': 'https://capittal.es/',
      'ca': 'https://capittal.es/ca',
      'en': 'https://capittal.es/en',
      'x-default': 'https://capittal.es/'
    };
    
    document.querySelectorAll('link[rel="alternate"]').forEach(link => link.remove());
    Object.entries(hreflangUrls).forEach(([lang, url]) => {
      const link = document.createElement('link');
      link.rel = 'alternate';
      link.hreflang = lang;
      link.href = url;
      document.head.appendChild(link);
    });
  }, []);
  
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
