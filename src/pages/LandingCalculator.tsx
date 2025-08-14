import React, { useEffect } from 'react';
import LandingHeaderMinimal from '@/components/landing/LandingHeaderMinimal';
import LandingFooterMinimal from '@/components/landing/LandingFooterMinimal';
import ValuationCalculator from '@/components/ValuationCalculator';
import { supabase } from '@/integrations/supabase/client';
import { generateValuationPDFWithReactPDF } from '@/utils/reactPdfGenerator';
import { useLocation } from 'react-router-dom';
import LanguageSelector from '@/components/i18n/LanguageSelector';
import { getPreferredLang } from '@/shared/i18n/locale';
import { I18nProvider, useI18n } from '@/shared/i18n/I18nProvider';
import CapittalBrief from '@/components/landing/CapittalBrief';
import ConfidentialityBlock from '@/components/landing/ConfidentialityBlock';

const LandingCalculatorInner = () => {
  const location = useLocation();
  const { t } = useI18n();

  // SEO dinámico según idioma
  useEffect(() => {
    const title = t('landing.title');
    const description = t('landing.description');

    document.title = title;

    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', description);

    const canonicalHref = window.location.href;
    let link = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', canonicalHref);
  }, [t]);

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
            email: 'samuel@capittal.es',
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
          const pdfBase64: string = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              const dataUrl = reader.result as string;
              resolve((dataUrl.split(',')[1]) || '');
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
          const pdfFilename = 'Capittal-Valoracion-Prueba.pdf';

          const { data, error } = await supabase.functions.invoke('send-valuation-email', {
            body: {
              recipientEmail: 'samuel@capittal.es',
              companyData,
              result,
              pdfBase64,
              pdfFilename,
              agendaUrl: `${window.location.origin}/contacto`,
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
          // Replicar metadatos hacia sync-leads si tenemos URL del PDF
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
    <div className="min-h-screen bg-white">
      <LandingHeaderMinimal />
      <main className="pt-20">
        {/* Selector de idioma */}
        <div className="max-w-6xl mx-auto px-4 flex justify-end">
          <LanguageSelector />
        </div>
        {/* H1 único para SEO, oculto visualmente */}
        <h1 className="sr-only">{t('landing.h1')}</h1>
        <ValuationCalculator />
        {/* Confidencialidad y privacidad de la herramienta */}
        <ConfidentialityBlock />
        {/* Breve descripción de Capittal */}
        <CapittalBrief />
      </main>
      <LandingFooterMinimal />
    </div>
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
