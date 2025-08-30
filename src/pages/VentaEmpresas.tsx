
import React, { useEffect } from 'react';
import LandingLayout from '@/components/shared/LandingLayout';
import VentaEmpresasHero from '@/components/venta-empresas/VentaEmpresasHero';
import VentaEmpresasProcess from '@/components/venta-empresas/VentaEmpresasProcess';
import VentaEmpresasBenefits from '@/components/venta-empresas/VentaEmpresasBenefits';
import VentaEmpresasValuation from '@/components/venta-empresas/VentaEmpresasValuation';
import VentaEmpresasCaseStudies from '@/components/venta-empresas/VentaEmpresasCaseStudies';
import VentaEmpresasValuationFactors from '@/components/venta-empresas/VentaEmpresasValuationFactors';
import VentaEmpresasFAQ from '@/components/venta-empresas/VentaEmpresasFAQ';
import VentaEmpresasCTA from '@/components/venta-empresas/VentaEmpresasCTA';
import StickyNavigation from '@/components/venta-empresas/StickyNavigation';

const VentaEmpresas = () => {
  useEffect(() => {
    // SEO optimization for Google Ads
    document.title = "Venta de Empresas en España | Capittal M&A";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 
        'Vende tu empresa al mejor precio con Capittal. Asesoría M&A especializada, +200 operaciones, confidencialidad total. Solicita valoración gratuita.'
      );
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Vende tu empresa al mejor precio con Capittal. Asesoría M&A especializada, +200 operaciones, confidencialidad total. Solicita valoración gratuita.';
      document.head.appendChild(meta);
    }

    // Keywords meta tag
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute('content', 'vender empresa, venta de empresas, M&A España, asesoría empresarial, valoración empresas, capittal');

    return () => {
      document.title = "Capittal";
    };
  }, []);

  return (
    <LandingLayout>
      <StickyNavigation />
      <VentaEmpresasHero />
      <VentaEmpresasBenefits />
      <VentaEmpresasProcess />
      <VentaEmpresasCaseStudies />
      <VentaEmpresasValuationFactors />
      <VentaEmpresasValuation />
      <VentaEmpresasFAQ />
      <VentaEmpresasCTA />
    </LandingLayout>
  );
};

export default VentaEmpresas;
