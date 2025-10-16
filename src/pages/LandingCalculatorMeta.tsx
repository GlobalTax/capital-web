import React, { useEffect } from 'react';
import UnifiedLayout from '@/components/shared/UnifiedLayout';
import { UnifiedCalculator } from '@/features/valuation/components/UnifiedCalculator';
import { V2_META_CONFIG } from '@/features/valuation/configs/calculator.configs';
import LanguageSelector from '@/components/i18n/LanguageSelector';
import { I18nProvider, useI18n } from '@/shared/i18n/I18nProvider';
import CapittalBrief from '@/components/landing/CapittalBrief';
import ConfidentialityBlock from '@/components/landing/ConfidentialityBlock';

const LandingCalculatorMetaInner = () => {
  const { t } = useI18n();

  // SEO dinámico (igual que la landing actual)
  useEffect(() => {
    const title = t('landing.title');
    const description = t('landing.description');
    const canonicalUrl = 'https://capittal.es/lp/calculadora-meta'; // NUEVO: URL específica
    const imageUrl = 'https://capittal.es/src/assets/calculadora-social-preview.jpg';

    document.title = title;

    const setMetaTag = (selector: string, content: string, attr: string = 'content') => {
      let meta = document.querySelector(selector);
      if (!meta) {
        meta = document.createElement('meta');
        const [key, value] = selector.match(/\[([^=]+)="([^"]+)"\]/)?.slice(1) || [];
        if (key && value) meta.setAttribute(key, value);
        document.head.appendChild(meta);
      }
      meta.setAttribute(attr, content);
    };

    // Meta tags básicos
    setMetaTag('meta[name="description"]', description);
    setMetaTag('meta[property="og:title"]', title);
    setMetaTag('meta[property="og:description"]', description);
    setMetaTag('meta[property="og:type"]', 'website');
    setMetaTag('meta[property="og:url"]', canonicalUrl);
    setMetaTag('meta[property="og:image"]', imageUrl);
    setMetaTag('meta[name="twitter:card"]', 'summary_large_image');
    setMetaTag('meta[name="twitter:title"]', title);
    setMetaTag('meta[name="twitter:description"]', description);
    setMetaTag('meta[name="twitter:image"]', imageUrl);

    // Canonical link
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);

    // Hreflang links
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
  }, [t]);

  return (
    <UnifiedLayout variant="landing">
      <div className="max-w-6xl mx-auto px-4 flex justify-end">
        <LanguageSelector />
      </div>
      <h1 className="sr-only">{t('landing.h1')}</h1>
      {/* NUEVO: Usar V2_META_CONFIG que redirige al calcular */}
      <UnifiedCalculator config={V2_META_CONFIG} />
      <ConfidentialityBlock />
      <CapittalBrief />
    </UnifiedLayout>
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
