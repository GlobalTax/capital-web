import React, { useEffect } from 'react';
import { HomeLayout } from '@/shared';
import BasicValuationForm from '@/components/BasicValuationForm';
import { Toaster } from '@/components/ui/sonner';

const LandingCalculadoraFiscal = () => {
  // Basic calculator for fiscal calculations

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
    <HomeLayout>
      <h1 className="sr-only">Calculadora Fiscal de Venta de Empresas en España</h1>
      <BasicValuationForm />
      <Toaster />
    </HomeLayout>
  );
};

export default LandingCalculadoraFiscal;
