import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { SEOHead } from '@/components/seo';
import { getWebPageSchema } from '@/utils/seo';
import { useI18n } from '@/shared/i18n/I18nProvider';
import MinimalistHero from '@/components/por-que-elegirnos/MinimalistHero';
import MinimalistDifferentiators from '@/components/por-que-elegirnos/MinimalistDifferentiators';
import MinimalistTestimonials from '@/components/por-que-elegirnos/MinimalistTestimonials';
import MinimalistCTA from '@/components/por-que-elegirnos/MinimalistCTA';

const PorQueElegirnos = () => {
  const { t, setLang } = useI18n();
  const location = useLocation();
  
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('per-que-triar-nos')) {
      setLang('ca');
    } else if (path.includes('why-choose-us')) {
      setLang('en');
    } else {
      setLang('es');
    }
  }, [location.pathname, setLang]);

  useEffect(() => {
    const hreflangUrls = {
      'es': 'https://capittal.es/por-que-elegirnos',
      'ca': 'https://capittal.es/per-que-triar-nos',
      'en': 'https://capittal.es/why-choose-us',
      'x-default': 'https://capittal.es/por-que-elegirnos'
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
    <div className="min-h-screen bg-white">
      <SEOHead 
        title={t('porQueElegirnos.seo.title')}
        description={t('porQueElegirnos.seo.description')}
        canonical="https://capittal.es/por-que-elegirnos"
        keywords={t('porQueElegirnos.seo.keywords')}
        structuredData={getWebPageSchema(
          t('porQueElegirnos.seo.title'),
          t('porQueElegirnos.seo.description'),
          "https://capittal.es/por-que-elegirnos"
        )}
      />
      <Header />
      <div className="pt-16">
        <MinimalistHero />
        <MinimalistDifferentiators />
        <MinimalistTestimonials />
        <MinimalistCTA />
      </div>
      <Footer />
    </div>
  );
};

export default PorQueElegirnos;
