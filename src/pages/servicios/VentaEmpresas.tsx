import React from 'react';
import UnifiedLayout from '@/components/shared/UnifiedLayout';
import VentaEmpresasHeroService from '@/components/venta-empresas/VentaEmpresasHeroService';
import VentaEmpresasProcess from '@/components/venta-empresas/VentaEmpresasProcess';
import VentaEmpresasBenefits from '@/components/venta-empresas/VentaEmpresasBenefits';
import VentaEmpresasValuation from '@/components/venta-empresas/VentaEmpresasValuation';
import VentaEmpresasServiceIntegration from '@/components/venta-empresas/VentaEmpresasServiceIntegration';
import VentaEmpresasValuationFactors from '@/components/venta-empresas/VentaEmpresasValuationFactors';
import VentaEmpresasFAQ from '@/components/venta-empresas/VentaEmpresasFAQ';
import VentaEmpresasCTA from '@/components/venta-empresas/VentaEmpresasCTA';
import { SEOHead } from '@/components/seo';
import { getServiceSchema } from '@/utils/seo';
import { useHreflang } from '@/hooks/useHreflang';

const VentaEmpresas = () => {
  useHreflang();
  
  return (
    <>
      <SEOHead 
        title="Servicio de Venta de Empresas | M&A Profesional | Capittal"
        description="Servicio profesional integral de M&A para venta de empresas. Metodología probada, due diligence completo, negociación experta. Parte de nuestros servicios financieros."
        canonical="https://capittal.es/servicios/venta-empresas"
        keywords="servicio M&A profesional, asesoramiento venta empresas, metodología M&A, due diligence empresas, servicios financieros Capittal"
        structuredData={getServiceSchema(
          "Servicio de Venta de Empresas M&A",
          "Servicio profesional integral de M&A para venta de empresas con metodología probada y due diligence completo.",
          "Mergers and Acquisitions"
        )}
      />
      <UnifiedLayout variant="home">
      <VentaEmpresasHeroService />
      <VentaEmpresasProcess />
      <VentaEmpresasBenefits />
      <VentaEmpresasValuation />
      <VentaEmpresasServiceIntegration />
      <VentaEmpresasValuationFactors />
      <VentaEmpresasFAQ />
      <VentaEmpresasCTA />
      </UnifiedLayout>
    </>
  );
};

export default VentaEmpresas;