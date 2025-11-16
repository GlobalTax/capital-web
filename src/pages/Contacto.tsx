import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import UnifiedLayout from '@/components/shared/UnifiedLayout';
import Contact from '@/components/Contact';
import { SEOHead } from '@/components/seo';
import { getWebPageSchema } from '@/utils/seo';
import { useI18n } from '@/shared/i18n/I18nProvider';

const Contacto = () => {
  const { t, setLang } = useI18n();
  const location = useLocation();
  
  // Detect language from URL
  useEffect(() => {
    const path = location.pathname;
    if (path === '/contacte') {
      setLang('ca');
    } else if (path === '/contact') {
      setLang('en');
    } else {
      setLang('es');
    }
  }, [location.pathname, setLang]);
  
  // Add hreflang links
  useEffect(() => {
    const hreflangUrls = {
      'es': 'https://capittal.es/contacto',
      'ca': 'https://capittal.es/contacte',
      'en': 'https://capittal.es/contact',
      'x-default': 'https://capittal.es/contacto'
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
    <>
      <SEOHead 
        title={t('contacto.seo.title')}
        description={t('contacto.seo.description')}
        canonical="https://capittal.es/contacto"
        keywords={t('contacto.seo.keywords')}
        structuredData={getWebPageSchema(
          t('contacto.seo.title'),
          t('contacto.seo.description'),
          "https://capittal.es/contacto"
        )}
      />
      <UnifiedLayout mainClassName="pt-16">
        <Contact />
      </UnifiedLayout>
    </>
  );
};

export default Contacto;