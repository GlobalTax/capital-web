import React, { useEffect, useMemo } from 'react';
import UnifiedLayout from '@/components/shared/UnifiedLayout';
import { UnifiedCalculator } from '@/features/valuation/components/UnifiedCalculator';
import { V2_CONFIG } from '@/features/valuation/configs/calculator.configs';
import { supabase } from '@/integrations/supabase/client';
import { generateValuationPDFWithReactPDF } from '@/utils/reactPdfGenerator';
import { useLocation } from 'react-router-dom';
import LanguageSelector from '@/components/i18n/LanguageSelector';
import { getPreferredLang } from '@/shared/i18n/locale';
import { I18nProvider, useI18n } from '@/shared/i18n/I18nProvider';
import CapittalBrief from '@/components/landing/CapittalBrief';
import ConfidentialityBlock from '@/components/landing/ConfidentialityBlock';
import { SEOHead } from '@/components/seo';
import { getServiceSchema, getWebPageSchema } from '@/utils/seo/schemas';
import { blobToBase64 } from '@/utils/blobToBase64';

const LandingCalculatorInner = () => {
  const location = useLocation();
  const { t } = useI18n();

  // Capture source=web from query string
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const sourceParam = searchParams.get('source');

  // Persist source in sessionStorage to maintain during multi-step flow
  useEffect(() => {
    if (sourceParam === 'web') {
      sessionStorage.setItem('valuation_source', 'web');
    }
  }, [sourceParam]);

  // Build extraMetadata if source=web (from URL or sessionStorage)
  const extraMetadata = useMemo(() => {
    const persistedSource = sessionStorage.getItem('valuation_source');
    if (sourceParam === 'web' || persistedSource === 'web') {
      return { leadSource: 'web' };
    }
    return undefined;
  }, [sourceParam]);

  // Hreflang management for multilanguage support
  useEffect(() => {
    const existingHreflang = document.querySelectorAll('link[rel="alternate"][hreflang]');
    existingHreflang.forEach(link => link.remove());

    const hreflangUrls = {
      'es': 'https://capittal.es/lp/calculadora',
      'ca': 'https://capittal.es/lp/calculadora',
      'val': 'https://capittal.es/lp/calculadora',
      'gl': 'https://capittal.es/lp/calculadora',
      'en': 'https://capittal.es/lp/calculadora?lang=en',
      'x-default': 'https://capittal.es/lp/calculadora'
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

  // Disparador temporal de prueba por query param ?sendTest=1
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('sendTest') === '1') {
      (async () => {
        try {
          const companyData = {
            contactName: 'Prueba',
            companyName: 'Empresa Demo S.L.',
            cif: 'B12345678',
            email: 'info@capittal.es',
            phone: '600 000 000',
            industry: 'Tecnología',
            yearsOfOperation: 5,
            employeeRange: '11-50',
            revenue: 1200000,
            ebitda: 240000,
            netProfitMargin: 12,
            growthRate: 8,
            location: 'Madrid',
            ownershipParticipation: 'alta',
            competitiveAdvantage: 'Base de clientes fidelizada y tecnología propia'
          } as any;

          const result = {
            finalValuation: 1800000,
            valuationRange: { min: 1600000, max: 2000000 },
            multiples: { ebitdaMultipleUsed: 7.5 }
          } as any;
          const lang = getPreferredLang();
          const blob = await generateValuationPDFWithReactPDF(companyData, result, lang);
          const pdfBase64 = await blobToBase64(blob);
          const pdfFilename = 'Capittal-Valoracion-Prueba.pdf';

          const { data, error } = await supabase.functions.invoke('send-valuation-email', {
            body: {
              recipientEmail: 'info@capittal.es',
              companyData,
              result,
              pdfBase64,
              pdfFilename,
              
              enlaces: {
                escenariosUrl: `${window.location.origin}/lp/calculadora`,
                calculadoraFiscalUrl: `${window.location.origin}/lp/calculadora-fiscal`
              },
              sender: {
                nombre: 'Equipo Capittal',
                cargo: 'M&A',
                firma: 'Capittal · Carrer Ausias March, 36 Principal · P.º de la Castellana, 11, B - A, Chamberí, 28046 Madrid'
              },
              subjectOverride: 'Valoración · PDF, escenarios y calculadora fiscal',
              lang
            }
          });

          console.log('Prueba de envío ejecutada', { data, error });

          try {
            const pdfUrl = (data as any)?.pdfUrl;
            if (pdfUrl) {
              const { data: syncData, error: syncErr } = await supabase.functions.invoke('sync-leads', {
                body: {
                  type: 'valuation_pdf',
                  data: {
                    pdf_url: pdfUrl,
                    company: companyData,
                    result,
                    source: 'landing-test',
                    timestamp: new Date().toISOString()
                  }
                }
              });
              if (syncErr) {
                console.error('sync-leads error (test):', syncErr);
              } else {
                console.log('sync-leads OK (test):', syncData);
              }
            }
          } catch (e) {
            console.error('Excepción sync-leads (test):', e);
          }
        } catch (e) {
          console.error('Error en prueba de envío', e);
        } finally {
          params.delete('sendTest');
          const url = window.location.pathname + (params.toString() ? `?${params.toString()}` : '');
          window.history.replaceState({}, '', url);
        }
      })();
    }
  }, [location.search]);

  return (
    <>
      <SEOHead 
        title={t('landing.title')}
        description={t('landing.description')}
        canonical="https://capittal.es/lp/calculadora"
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
            "https://capittal.es/lp/calculadora"
          )
        ]}
      />
      <UnifiedLayout variant="landing">
        <div className="max-w-6xl mx-auto px-4 flex justify-end">
          <LanguageSelector />
        </div>
        <h1 className="sr-only">{t('landing.h1')}</h1>
        <UnifiedCalculator config={V2_CONFIG} extraMetadata={extraMetadata} />
        <ConfidentialityBlock />
        <CapittalBrief />
      </UnifiedLayout>
    </>
  );
};

const LandingCalculator = () => {
  return (
    <I18nProvider>
      <LandingCalculatorInner />
    </I18nProvider>
  );
};

export default LandingCalculator;