import React, { useEffect } from 'react';
import UnifiedLayout from '@/components/shared/UnifiedLayout';
import { AdvisorCalculator } from '@/components/valuation-advisor/AdvisorCalculator';
import { Badge } from '@/components/ui/badge';
import { Toaster } from '@/components/ui/sonner';
import { useI18n } from '@/shared/i18n/I18nProvider';

const LandingCalculadoraAsesores = () => {
  const { t } = useI18n();

  useEffect(() => {
    const title = 'Calculadora de Valoración para Asesores - Capittal';
    const description = 'Herramienta profesional de valoración con múltiples métricas: Facturación, EBITDA y Resultado Neto. Análisis completo para asesores financieros.';

    document.title = title;

    // Meta description
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', description);

    // Canonical URL (fijo)
    const canonicalUrl = 'https://capittal.es/lp/calculadora-asesores';
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);

    // Hreflang links
    const hreflangUrls = {
      'es': 'https://capittal.es/lp/calculadora-asesores',
      'ca': 'https://capittal.es/lp/calculadora-asesores',
      'val': 'https://capittal.es/lp/calculadora-asesores',
      'gl': 'https://capittal.es/lp/calculadora-asesores',
      'x-default': 'https://capittal.es/lp/calculadora-asesores'
    };

    Object.entries(hreflangUrls).forEach(([lang, url]) => {
      let link = document.querySelector(`link[hreflang="${lang}"]`);
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'alternate');
        link.setAttribute('hreflang', lang);
        document.head.appendChild(link);
      }
      link.setAttribute('href', url);
    });

    // Open Graph tags
    const ogTags = {
      'og:title': title,
      'og:description': description,
      'og:url': canonicalUrl,
      'og:type': 'website',
      'og:locale': 'es_ES'
    };

    Object.entries(ogTags).forEach(([property, content]) => {
      let ogMeta = document.querySelector(`meta[property="${property}"]`);
      if (!ogMeta) {
        ogMeta = document.createElement('meta');
        ogMeta.setAttribute('property', property);
        document.head.appendChild(ogMeta);
      }
      ogMeta.setAttribute('content', content);
    });

    // Twitter Card tags
    const twitterTags = {
      'twitter:card': 'summary_large_image',
      'twitter:title': title,
      'twitter:description': description
    };

    Object.entries(twitterTags).forEach(([name, content]) => {
      let twitterMeta = document.querySelector(`meta[name="${name}"]`);
      if (!twitterMeta) {
        twitterMeta = document.createElement('meta');
        twitterMeta.setAttribute('name', name);
        document.head.appendChild(twitterMeta);
      }
      twitterMeta.setAttribute('content', content);
    });
  }, []);

  return (
    <UnifiedLayout variant="landing">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="sr-only">Calculadora de Valoración para Asesores Profesionales</h1>
        
        {/* Badge destacado */}
        <div className="flex justify-center mb-6">
          <Badge variant="secondary" className="text-sm px-4 py-2 bg-primary/10 text-primary">
            🎯 {t('advisor.badge')}
          </Badge>
        </div>

        {/* Calculadora principal */}
        <AdvisorCalculator />
      </div>
      <Toaster />
    </UnifiedLayout>
  );
};

export default LandingCalculadoraAsesores;
