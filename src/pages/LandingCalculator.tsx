import React, { useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ValuationCalculator from '@/components/ValuationCalculator';

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

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="pt-20">
        {/* H1 único para SEO, oculto visualmente */}
        <h1 className="sr-only">Calculadora de Valoración de Empresas</h1>
        <ValuationCalculator />
      </main>
      <Footer />
    </div>
  );
};

export default LandingCalculator;
