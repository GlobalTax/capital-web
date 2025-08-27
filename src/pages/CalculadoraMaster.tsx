import React, { useEffect } from 'react';
import ValuationCalculatorMaster from '@/components/ValuationCalculatorMaster';
import { LeadTrackingProvider } from '@/components/LeadTrackingProvider';
import { Toaster } from '@/components/ui/sonner';

const CalculadoraMaster: React.FC = () => {
  useEffect(() => {
    // SEO meta tags
    document.title = 'Calculadora Master de Valoración de Empresas | Capittal';
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Calculadora completa y detallada para la valoración de empresas. Análisis exhaustivo con múltiples parámetros y resultados profesionales.');
    }

    // Canonical URL
    const canonicalUrl = 'https://capittal.es/calculadora-master';
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);
  }, []);

  return (
    <LeadTrackingProvider>
      <main className="min-h-screen">
        <h1 className="sr-only">Calculadora Master de Valoración de Empresas</h1>
        <ValuationCalculatorMaster />
      </main>
      
      <Toaster />
    </LeadTrackingProvider>
  );
};

export default CalculadoraMaster;