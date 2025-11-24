import React from 'react';
import { I18nProvider } from '@/shared/i18n/I18nProvider';
import { TypeformCalculator } from '@/components/valuation-typeform/TypeformCalculator';
import { SEOHead } from '@/components/seo';

const LandingCalculatorB = () => {
  return (
    <I18nProvider>
      <SEOHead 
        title="¿Cuánto vale tu empresa? | Calculadora Gratuita"
        description="Descubre el valor de tu empresa en 3 minutos. Sin compromisos."
        canonical="https://capittal.es/lp/calculadora-b"
        keywords="valoración empresas, cuanto vale mi empresa, calculadora valoración gratis"
      />
      <TypeformCalculator />
    </I18nProvider>
  );
};

export default LandingCalculatorB;
