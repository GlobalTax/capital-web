import React, { useEffect } from 'react';
import LandingHeaderMinimal from '@/components/landing/LandingHeaderMinimal';
import LandingFooterMinimal from '@/components/landing/LandingFooterMinimal';
import ValuationCalculator from '@/components/ValuationCalculator';
import { supabase } from '@/integrations/supabase/client';
import { generateValuationPDFWithReactPDF } from '@/utils/reactPdfGenerator';

const LandingCalculator = () => {
  // SEO básico para la landing
  useEffect(() => {
    const title = 'Calculadora de Valoración de Empresas | Capittal';
    const description = 'Calculadora de valoración con múltiplos de mercado: estimación rápida y orientativa. Recibe resultados gratuitos al instante.';

    document.title = title;

    // Meta description
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', description);

    // Canonical
    const canonicalHref = window.location.href;
    let link = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', canonicalHref);
  }, []);

  // Disparador temporal de prueba por query param ?sendTest=1
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('sendTest') === '1') {
      (async () => {
        try {
          const companyData = {
            contactName: 'Prueba',
            companyName: 'Empresa Demo S.L.',
            cif: 'B12345678',
            email: 'samuel@capittal.es',
            phone: '+34 600 000 000',
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

          const blob = await generateValuationPDFWithReactPDF(companyData, result);
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
              subjectOverride: 'Valoración · PDF, escenarios y calculadora fiscal'
            }
          });

          console.log('Prueba de envío ejecutada', { data, error });
        } catch (e) {
          console.error('Error en prueba de envío', e);
        } finally {
          params.delete('sendTest');
          const url = window.location.pathname + (params.toString() ? `?${params.toString()}` : '');
          window.history.replaceState({}, '', url);
        }
      })();
    }
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <LandingHeaderMinimal />
      <main className="pt-20">
        {/* H1 único para SEO, oculto visualmente */}
        <h1 className="sr-only">Calculadora de Valoración de Empresas</h1>
        <ValuationCalculator />
      </main>
      <LandingFooterMinimal />
    </div>
  );
};

export default LandingCalculator;
