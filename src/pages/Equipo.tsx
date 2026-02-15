import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Team from '@/components/Team';
import UnifiedLayout from '@/components/shared/UnifiedLayout';
import { SEOHead } from '@/components/seo';
import { getWebPageSchema } from '@/utils/seo/schemas';
import { useI18n } from '@/shared/i18n/I18nProvider';

const Equipo = () => {
  const { t, setLang } = useI18n();
  const location = useLocation();
  
  useEffect(() => {
    const path = location.pathname;
    if (path === '/equip') {
      setLang('ca');
    } else if (path === '/team') {
      setLang('en');
    } else {
      setLang('es');
    }
  }, [location.pathname, setLang]);

  useEffect(() => {
    const hreflangUrls = {
      'es': 'https://capittal.es/equipo',
      'ca': 'https://capittal.es/equip',
      'en': 'https://capittal.es/team',
      'x-default': 'https://capittal.es/equipo'
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
        title={t('equipo.seo.title')}
        description={t('equipo.seo.description')}
        canonical={`https://capittal.es${location.pathname}`}
        keywords={t('equipo.seo.keywords')}
        structuredData={getWebPageSchema(
          t('equipo.seo.title'),
          t('equipo.seo.description'),
          `https://capittal.es${location.pathname}`
        )}
      />
      <UnifiedLayout>
        <Team />
      </UnifiedLayout>
    </>
  );
};

export default Equipo;