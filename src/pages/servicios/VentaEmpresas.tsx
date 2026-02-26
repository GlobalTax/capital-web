import React from 'react';
import { useLocation } from 'react-router-dom';
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
import { getServiceSchema, getBreadcrumbSchema } from '@/utils/seo';
import { useHreflang } from '@/hooks/useHreflang';

const VentaEmpresas = () => {
  const location = useLocation();
  useHreflang();
  
  return (
    <>
      <SEOHead 
        title="Servicio de Venta de Empresas | M&A Profesional | Capittal"
        description="Servicio profesional integral de M&A para venta de empresas. Metodología probada, due diligence completo, negociación experta. Parte de nuestros servicios financieros."
        canonical={`https://capittal.es${location.pathname}`}
        keywords="servicio M&A profesional, asesoramiento venta empresas, metodología M&A, due diligence empresas, servicios financieros Capittal"
        structuredData={[
          getServiceSchema(
            "Servicio de Venta de Empresas M&A",
            "Servicio profesional integral de M&A para venta de empresas con metodología probada y due diligence completo.",
            "Mergers and Acquisitions"
          ),
          getBreadcrumbSchema([
            { name: 'Inicio', url: 'https://capittal.es/' },
            { name: 'Servicios', url: 'https://capittal.es/servicios' },
            { name: 'Venta de Empresas', url: 'https://capittal.es/servicios/venta-empresas' }
          ])
        ]}
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