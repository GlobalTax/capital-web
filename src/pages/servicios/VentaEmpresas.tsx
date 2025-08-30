import React, { useEffect } from 'react';
import HomeLayout from '@/components/shared/HomeLayout';
import VentaEmpresasHeroService from '@/components/venta-empresas/VentaEmpresasHeroService';
import VentaEmpresasProcess from '@/components/venta-empresas/VentaEmpresasProcess';
import VentaEmpresasBenefits from '@/components/venta-empresas/VentaEmpresasBenefits';
import VentaEmpresasValuation from '@/components/venta-empresas/VentaEmpresasValuation';
import VentaEmpresasServiceIntegration from '@/components/venta-empresas/VentaEmpresasServiceIntegration';
import VentaEmpresasValuationFactors from '@/components/venta-empresas/VentaEmpresasValuationFactors';
import VentaEmpresasFAQ from '@/components/venta-empresas/VentaEmpresasFAQ';
import VentaEmpresasCTA from '@/components/venta-empresas/VentaEmpresasCTA';

const VentaEmpresas = () => {
  useEffect(() => {
    // SEO Meta Tags - Professional service focus
    document.title = 'Servicio de Venta de Empresas | M&A Profesional | Capittal';
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Servicio profesional integral de M&A para venta de empresas. Metodología probada, due diligence completo, negociación experta. Parte de nuestros servicios financieros.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Servicio profesional integral de M&A para venta de empresas. Metodología probada, due diligence completo, negociación experta. Parte de nuestros servicios financieros.';
      document.head.appendChild(meta);
    }

    // Service-focused keywords
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', 'servicio M&A profesional, asesoramiento venta empresas, metodología M&A, due diligence empresas, servicios financieros Capittal');
    } else {
      const keywordsMeta = document.createElement('meta');
      keywordsMeta.name = 'keywords';
      keywordsMeta.content = 'servicio M&A profesional, asesoramiento venta empresas, metodología M&A, due diligence empresas, servicios financieros Capittal';
      document.head.appendChild(keywordsMeta);
    }

    return () => {
      document.title = "Capittal";
    };
  }, []);

  return (
    <HomeLayout>
      <VentaEmpresasHeroService />
      <VentaEmpresasProcess />
      <VentaEmpresasBenefits />
      <VentaEmpresasValuation />
      <VentaEmpresasServiceIntegration />
      <VentaEmpresasValuationFactors />
      <VentaEmpresasFAQ />
      <VentaEmpresasCTA />
    </HomeLayout>
  );
};

export default VentaEmpresas;