import React, { useEffect } from 'react';
import UnifiedLayout from '@/components/shared/UnifiedLayout';
import { UnifiedCalculator } from '@/features/valuation/components/UnifiedCalculator';
import { V2_META_CONFIG } from '@/features/valuation/configs/calculator.configs';
import LanguageSelector from '@/components/i18n/LanguageSelector';
import { I18nProvider, useI18n } from '@/shared/i18n/I18nProvider';
import CapittalBrief from '@/components/landing/CapittalBrief';
import ConfidentialityBlock from '@/components/landing/ConfidentialityBlock';
import { SEOHead } from '@/components/seo';
import { getServiceSchema, getWebPageSchema } from '@/utils/seo/schemas';

const LandingCalculatorMetaInner = () => {
  const { t } = useI18n();

  // Hreflang management for multilanguage support
  useEffect(() => {
    const existingHreflang = document.querySelectorAll('link[rel="alternate"][hreflang]');
    existingHreflang.forEach(link => link.remove());

    const hreflangUrls = {
      'es': 'https://capittal.es/lp/calculadora-meta',
      'ca': 'https://capittal.es/lp/calculadora-meta',
      'val': 'https://capittal.es/lp/calculadora-meta',
      'gl': 'https://capittal.es/lp/calculadora-meta',
      'x-default': 'https://capittal.es/lp/calculadora-meta'
    };

    Object.entries(hreflangUrls).forEach(([hreflang, href]) => {
      const hreflangLink = document.createElement('link');
      hreflangLink.setAttribute('rel', 'alternate');
      hreflangLink.setAttribute('hreflang', hreflang);
      hreflangLink.setAttribute('href', href);
      document.head.appendChild(hreflangLink);
    });

    return () => {
      const links = document.querySelectorAll('link[rel="alternate"][hreflang]');
      links.forEach(link => link.remove());
    };
  }, []);

  return (
    <>
      <SEOHead 
        title={t('landing.title')}
        description={t('landing.description')}
        canonical="https://capittal.es/lp/calculadora-meta"
        keywords="calculadora valoración empresas, valorar empresa online, calculadora empresarial España"
        ogImage="https://capittal.es/src/assets/calculadora-social-preview.jpg"
        structuredData={[
          getServiceSchema(
            t('landing.title'),
            t('landing.description'),
            "Business Valuation Service"
          ),
          getWebPageSchema(
            t('landing.title'),
            t('landing.description'),
            "https://capittal.es/lp/calculadora-meta"
          )
        ]}
      />
      <UnifiedLayout variant="landing">
        <div className="max-w-6xl mx-auto px-4 flex justify-end">
          <LanguageSelector />
        </div>
        <h1 className="sr-only">{t('landing.h1')}</h1>
        <UnifiedCalculator config={V2_META_CONFIG} />
        <ConfidentialityBlock />
        <CapittalBrief />
      </UnifiedLayout>
    </>
  );
};

const LandingCalculatorMeta = () => {
  return (
    <I18nProvider>
      <LandingCalculatorMetaInner />
    </I18nProvider>
  );
};

export default LandingCalculatorMeta;
