
import React, { useEffect } from 'react';
import HomeLayout from '@/components/shared/HomeLayout';
import VentaEmpresasHero from '@/components/venta-empresas/VentaEmpresasHero';
import VentaEmpresasBenefits from '@/components/venta-empresas/VentaEmpresasBenefits';
import VentaEmpresasProcess from '@/components/venta-empresas/VentaEmpresasProcess';
import VentaEmpresasValuation from '@/components/venta-empresas/VentaEmpresasValuation';
import VentaEmpresasFAQ from '@/components/venta-empresas/VentaEmpresasFAQ';
import VentaEmpresasCTA from '@/components/venta-empresas/VentaEmpresasCTA';

const VentaEmpresas = () => {
  useEffect(() => {
    // SEO optimization for classic company sales page
    document.title = "Venta de Empresas - Asesoramiento Profesional | Capittal";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 
        'Servicios profesionales de venta de empresas. Asesoramiento integral, valoración experta y acompañamiento completo en el proceso de compraventa empresarial.'
      );
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Servicios profesionales de venta de empresas. Asesoramiento integral, valoración experta y acompañamiento completo en el proceso de compraventa empresarial.';
      document.head.appendChild(meta);
    }

    // Professional keywords for main site
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute('content', 'venta empresas, asesoramiento empresarial, valoración empresas, compraventa empresarial, M&A España');

    return () => {
      document.title = "Capittal";
    };
  }, []);

  return (
    <HomeLayout>
      <VentaEmpresasHero />
      <VentaEmpresasBenefits />
      <VentaEmpresasProcess />
      <VentaEmpresasValuation />
      <VentaEmpresasFAQ />
      <VentaEmpresasCTA />
    </HomeLayout>
  );
};

export default VentaEmpresas;
