import React, { useEffect } from 'react';
import LandingHeaderMinimal from '@/components/landing/LandingHeaderMinimal';
import LandingFooterMinimal from '@/components/landing/LandingFooterMinimal';
import ValuationCalculatorV4 from '@/components/ValuationCalculatorV4';
import { CompanyDataV4 } from '@/types/valuationV4';
import { Toaster } from '@/components/ui/sonner';

const LandingCalculadoraFiscal = () => {
  // Initial data for V4 calculator focused on fiscal calculations
  const initialCompanyData: CompanyDataV4 = {
    contactName: '',
    companyName: '',
    email: '',
    phone: '',
    industry: '',
    revenue: 0,
    ebitda: 0,
    baseValuation: 0,
    whatsapp_opt_in: false
  };

  useEffect(() => {
    const title = 'Calculadora Fiscal de Venta de Empresas (España) | Capittal';
    const description = 'Calcula el impacto fiscal orientativo en la venta de tu empresa en España junto a la valoración estimada.';

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
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <LandingHeaderMinimal />
      <main className="pt-20">
        <h1 className="sr-only">Calculadora Fiscal de Venta de Empresas en España</h1>
        <ValuationCalculatorV4 companyData={initialCompanyData} fiscalMode={true} />
      </main>
      <LandingFooterMinimal />
      <Toaster />
    </div>
  );
};

export default LandingCalculadoraFiscal;
