import React, { useEffect } from 'react';
import UnifiedLayout from '@/components/shared/UnifiedLayout';
import { AdvisorCalculator } from '@/components/valuation-advisor/AdvisorCalculator';
import { Badge } from '@/components/ui/badge';
import { Toaster } from '@/components/ui/sonner';
import { I18nProvider, useI18n } from '@/shared/i18n/I18nProvider';
import ConfidentialityBlock from '@/components/landing/ConfidentialityBlock';
import CapittalBrief from '@/components/landing/CapittalBrief';
import { SEOHead } from '@/components/seo';
import { getServiceSchema, getWebPageSchema } from '@/utils/seo/schemas';

const LandingCalculadoraAsesoresInner = () => {
  const { t } = useI18n();

  useEffect(() => {
    const existingHreflang = document.querySelectorAll('link[rel="alternate"][hreflang]');
    existingHreflang.forEach(link => link.remove());

    const hreflangUrls = {
      'es': 'https://capittal.es/lp/calculadora-asesores',
      'ca': 'https://capittal.es/lp/calculadora-asesores',
      'val': 'https://capittal.es/lp/calculadora-asesores',
      'gl': 'https://capittal.es/lp/calculadora-asesores',
      'x-default': 'https://capittal.es/lp/calculadora-asesores'
    };

    Object.entries(hreflangUrls).forEach(([lang, url]) => {
      const link = document.createElement('link');
      link.setAttribute('rel', 'alternate');
      link.setAttribute('hreflang', lang);
      link.setAttribute('href', url);
      document.head.appendChild(link);
    });

    return () => {
      const links = document.querySelectorAll('link[rel="alternate"][hreflang]');
      links.forEach(link => link.remove());
    };
  }, []);

  return (
    <>
      <SEOHead 
        title={t('advisor.seo.title')}
        description={t('advisor.seo.description')}
        canonical="https://capittal.es/lp/calculadora-asesores"
        keywords={t('advisor.seo.keywords')}
        structuredData={[
          getServiceSchema(
            "Calculadora de Valoración para Asesores",
            "Herramienta profesional de valoración empresarial para asesores financieros",
            "Business Advisory Service"
          ),
          getWebPageSchema(
            "Calculadora Asesores",
            "Herramienta profesional de valoración con múltiples métricas",
            "https://capittal.es/lp/calculadora-asesores"
          )
        ]}
      />
      <UnifiedLayout variant="landing">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <h1 className="sr-only">Calculadora de Valoración para Asesores Profesionales</h1>
          
          <div className="flex justify-center mb-6">
            <Badge variant="secondary" className="text-sm px-4 py-2 bg-primary/10 text-primary">
              🎯 {t('advisor.badge')}
            </Badge>
          </div>

          <AdvisorCalculator />
        </div>
        
        <ConfidentialityBlock />
        <CapittalBrief />
        
        <Toaster />
      </UnifiedLayout>
    </>
  );
};

const LandingCalculadoraAsesores = () => (
  <I18nProvider>
    <LandingCalculadoraAsesoresInner />
  </I18nProvider>
);

export default LandingCalculadoraAsesores;
