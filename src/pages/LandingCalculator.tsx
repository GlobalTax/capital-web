import React, { useEffect } from 'react';
import LandingLayout from '@/components/shared/LandingLayout';
import ValuationCalculatorV4 from '@/components/ValuationCalculatorV4';
import { CompanyDataV4 } from '@/types/valuationV4';
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

  // Datos por defecto para la calculadora
  const defaultCompanyData: CompanyDataV4 = {
    id: 'landing-demo',
    contactName: 'Demo Calculadora',
    companyName: 'Tu Empresa S.L.',
    email: 'demo@capittal.es',
    phone: '600 000 000',
    industry: 'Servicios',
    revenue: 1000000,
    ebitda: 200000,
    baseValuation: 1500000,
    whatsapp_opt_in: false
  };

  // SEO dinámico según idioma con canonical fijo y hreflang
  useEffect(() => {
    const title = t('landing.title');
    const description = t('landing.description');

    document.title = title;

    // Meta description
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', description);

    // Canonical link fijo
    const canonicalUrl = 'https://capittal.es/lp/calculadora';
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);

    // Limpiar hreflang existentes para evitar duplicados
    const existingHreflang = document.querySelectorAll('link[rel="alternate"][hreflang]');
    existingHreflang.forEach(link => link.remove());

    // Hreflang links para idiomas soportados
    const hreflangUrls = {
      'es': 'https://capittal.es/lp/calculadora',
      'ca': 'https://capittal.es/lp/calculadora',
      'val': 'https://capittal.es/lp/calculadora', 
      'gl': 'https://capittal.es/lp/calculadora',
      'en': 'https://capittal.es/lp/calculadora?lang=en', // Para futuro soporte inglés
      'x-default': 'https://capittal.es/lp/calculadora'
    };

    // Crear hreflang links
    Object.entries(hreflangUrls).forEach(([hreflang, href]) => {
      const hreflangLink = document.createElement('link');
      hreflangLink.setAttribute('rel', 'alternate');
      hreflangLink.setAttribute('hreflang', hreflang);
      hreflangLink.setAttribute('href', href);
      document.head.appendChild(hreflangLink);
    });

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
              agendaUrl: `${window.location.origin}/lp/reservar-cita?contactName=${encodeURIComponent(companyData.contactName)}&contactEmail=${encodeURIComponent(companyData.email)}&contactPhone=${encodeURIComponent(companyData.phone || '')}&companyName=${encodeURIComponent(companyData.companyName)}`,
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
    <LandingLayout>
      {/* Selector de idioma */}
      <div className="max-w-6xl mx-auto px-4 flex justify-end">
        <LanguageSelector />
      </div>
      {/* H1 único para SEO, oculto visualmente */}
      <h1 className="sr-only">{t('landing.h1')}</h1>
      <ValuationCalculatorV4 companyData={defaultCompanyData} />
      {/* Confidencialidad y privacidad de la herramienta */}
      <ConfidentialityBlock />
      {/* Breve descripción de Capittal */}
      <CapittalBrief />
    </LandingLayout>
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
