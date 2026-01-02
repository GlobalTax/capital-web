import React from 'react';
import UnifiedLayout from '@/components/shared/UnifiedLayout';
import { TaxCalculator } from '@/components/tax-calculator/TaxCalculator';
import { Toaster } from '@/components/ui/sonner';
import { SEOHead } from '@/components/seo';
import { getServiceSchema, getWebPageSchema } from '@/utils/seo/schemas';

const LandingCalculadoraFiscal = () => {
  return (
    <>
      <SEOHead 
        title="Calculadora Fiscal de Venta de Empresas (España) | Capittal"
        description="Calcula el impacto fiscal orientativo en la venta de tu empresa en España: IRPF, Impuesto de Sociedades, coeficientes de abatimiento y beneficios por reinversión."
        canonical="https://capittal.es/lp/calculadora-fiscal"
        keywords="calculadora fiscal empresa, impuestos venta empresa, fiscalidad venta empresarial España, IRPF venta participaciones, impuesto sociedades"
        structuredData={[
          getServiceSchema(
            "Calculadora Fiscal de Venta de Empresas",
            "Herramienta para calcular el impacto fiscal en la venta de empresas en España: ganancia patrimonial, IRPF, IS y beneficios fiscales",
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
        <TaxCalculator />
        <Toaster />
      </UnifiedLayout>
    </>
  );
};

export default LandingCalculadoraFiscal;
