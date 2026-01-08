import React, { useEffect } from 'react';
import { SEOHead } from '@/components/seo';
import LandingHeaderMinimal from '@/components/landing/LandingHeaderMinimal';
import LandingFooterMinimal from '@/components/landing/LandingFooterMinimal';
import {
  HubVentaHero,
  HubVentaBenefits,
  HubVentaProcess,
  HubVentaProfiles,
  HubVentaSectors,
  HubVentaCases,
  HubVentaFAQ,
  HubVentaFinalCTA,
  HubVentaStickyMobile,
} from '@/components/hub-venta';
import { useHubVentaTracking } from '@/hooks/useHubVentaTracking';

const HubVentaEmpresa: React.FC = () => {
  const { trackPageView } = useHubVentaTracking();

  useEffect(() => {
    trackPageView();
  }, [trackPageView]);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Servicio de Venta de Empresas",
    "description": "Asesoría especializada en M&A para la venta de empresas. Valoración gratuita, confidencialidad total y acompañamiento integral.",
    "provider": {
      "@type": "Organization",
      "name": "Capittal",
      "url": "https://capittal.es"
    },
    "areaServed": {
      "@type": "Country",
      "name": "España"
    },
    "serviceType": "Business Sale Advisory",
    "offers": {
      "@type": "Offer",
      "name": "Valoración Gratuita",
      "price": "0",
      "priceCurrency": "EUR"
    }
  };

  return (
    <>
      <SEOHead 
        title="Vende Tu Empresa | Asesoría M&A Especializada | Capittal"
        description="¿Quieres vender tu empresa? Te ayudamos a conseguir el mejor precio. Valoración gratuita, confidencialidad total y acompañamiento integral. Solicita información sin compromiso."
        canonical="https://capittal.es/venta-de-empresa"
        keywords="vender empresa, venta de empresas, asesores M&A, valoración de empresas, compraventa de empresas"
        structuredData={structuredData}
      />
      
      <div className="min-h-screen bg-background">
        <LandingHeaderMinimal />
        
        <main className="pt-16">
          <HubVentaHero />
          <HubVentaBenefits />
          <HubVentaProcess />
          <HubVentaProfiles />
          <HubVentaSectors />
          <HubVentaCases />
          <HubVentaFAQ />
          <HubVentaFinalCTA />
        </main>

        <LandingFooterMinimal />
        <HubVentaStickyMobile />
      </div>
    </>
  );
};

export default HubVentaEmpresa;
