import React from 'react';
import UnifiedLayout from '@/components/shared/UnifiedLayout';
import VentaEmpresasHero from '@/components/venta-empresas/VentaEmpresasHero';
import VentaEmpresasBenefits from '@/components/venta-empresas/VentaEmpresasBenefits';
import VentaEmpresasProcess from '@/components/venta-empresas/VentaEmpresasProcess';
import VentaEmpresasValuation from '@/components/venta-empresas/VentaEmpresasValuation';
import VentaEmpresasFAQ from '@/components/venta-empresas/VentaEmpresasFAQ';
import VentaEmpresasCTA from '@/components/venta-empresas/VentaEmpresasCTA';
import { SEOHead } from '@/components/seo';
import { getServiceSchema } from '@/utils/seo/schemas';

const VentaEmpresas = () => {
  return (
    <>
      <SEOHead 
        title="Venta de Empresas - Asesoramiento Profesional | Capittal"
        description="Servicios profesionales de venta de empresas. Asesoramiento integral, valoración experta y acompañamiento completo en el proceso de compraventa empresarial."
        canonical="https://capittal.es/venta-empresas"
        keywords="venta empresas, asesoramiento empresarial, valoración empresas, compraventa empresarial, M&A España"
        structuredData={getServiceSchema(
          "Venta de Empresas",
          "Asesoramiento profesional en venta de empresas",
          "Business Sale Service"
        )}
      />
      <UnifiedLayout variant="home">
        <VentaEmpresasHero />
        <VentaEmpresasBenefits />
        <VentaEmpresasProcess />
        <VentaEmpresasValuation />
        <VentaEmpresasFAQ />
        <VentaEmpresasCTA />
      </UnifiedLayout>
    </>
  );
};

export default VentaEmpresas;
