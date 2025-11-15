import React from 'react';
import UnifiedLayout from '@/components/shared/UnifiedLayout';
import { UnifiedCalculator } from '@/features/valuation/components/UnifiedCalculator';
import { V2_META_CONFIG } from '@/features/valuation/configs/calculator.configs';
import { Toaster } from '@/components/ui/sonner';
import { SEOHead } from '@/components/seo';
import { getServiceSchema, getWebPageSchema } from '@/utils/seo/schemas';

const LandingCalculadoraFiscal = () => {
  return (
    <>
      <SEOHead 
        title="Calculadora Fiscal de Venta de Empresas (España) | Capittal"
        description="Calcula el impacto fiscal orientativo en la venta de tu empresa en España junto a la valoración estimada."
        canonical="https://capittal.es/lp/calculadora-fiscal"
        keywords="calculadora fiscal empresa, impuestos venta empresa, fiscalidad venta empresarial España"
        structuredData={[
          getServiceSchema(
            "Calculadora Fiscal de Venta de Empresas",
            "Herramienta para calcular el impacto fiscal en la venta de empresas en España",
            "Tax Calculation Service"
          ),
          getWebPageSchema(
            "Calculadora Fiscal",
            "Calcula el impacto fiscal orientativo en la venta de tu empresa",
            "https://capittal.es/lp/calculadora-fiscal"
          )
        ]}
      />
      <UnifiedLayout>
        <h1 className="sr-only">Calculadora Fiscal de Venta de Empresas en España</h1>
        <UnifiedCalculator config={V2_META_CONFIG} />
        <Toaster />
      </UnifiedLayout>
    </>
  );
};

export default LandingCalculadoraFiscal;
