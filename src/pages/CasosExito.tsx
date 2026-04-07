import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import UnifiedLayout from '@/components/shared/UnifiedLayout';
import CaseStudies from '@/components/CaseStudies';
import { SEOHead } from '@/components/seo';
import { getWebPageSchema } from '@/utils/seo';
import { useI18n } from '@/shared/i18n/I18nProvider';

const CasosExito = () => {
  const { t, setLang } = useI18n();
  const location = useLocation();
  
  // Detect language from URL
  useEffect(() => {
    const path = location.pathname;
    if (path === '/casos-exit') {
      setLang('ca');
    } else if (path === '/success-stories') {
      setLang('en');
    } else {
      setLang('es');
    }
  }, [location.pathname, setLang]);
  
  // Hreflang managed by useHreflang hook (via routeMap)
  
  return (
    <>
      <SEOHead 
        title={t('casosExito.seo.title')}
        description={t('casosExito.seo.description')}
        canonical={`https://capittal.es${location.pathname}`}
        keywords={t('casosExito.seo.keywords')}
        structuredData={getWebPageSchema(
          t('casosExito.seo.title'),
          t('casosExito.seo.description'),
          `https://capittal.es${location.pathname}`
        )}
      />
      <UnifiedLayout>
      <div className="pt-16">
        <section className="py-20 md:py-32 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-normal text-slate-900 mb-6">
                {t('casosExito.title')}
              </h1>
              <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                {t('casosExito.subtitle')}
              </p>
            </div>
          </div>
        </section>
        <CaseStudies />
      </div>
      </UnifiedLayout>
    </>
  );
};

export default CasosExito;