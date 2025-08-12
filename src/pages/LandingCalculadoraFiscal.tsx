import React, { useEffect } from 'react';
import LandingHeaderMinimal from '@/components/landing/LandingHeaderMinimal';
import LandingFooterMinimal from '@/components/landing/LandingFooterMinimal';
import ValuationCalculator from '@/components/ValuationCalculator';
import { Toaster } from '@/components/ui/sonner';

const LandingCalculadoraFiscal = () => {
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
        <ValuationCalculator />
      </main>
      <LandingFooterMinimal />
      <Toaster />
    </div>
  );
};

export default LandingCalculadoraFiscal;
