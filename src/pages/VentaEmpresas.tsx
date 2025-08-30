
import React, { useEffect } from 'react';
import LandingLayout from '@/components/shared/LandingLayout';
import VentaEmpresasHeroLanding from '@/components/venta-empresas/VentaEmpresasHeroLanding';
import VentaEmpresasBenefitsLanding from '@/components/venta-empresas/VentaEmpresasBenefitsLanding';
import VentaEmpresasProcessLanding from '@/components/venta-empresas/VentaEmpresasProcessLanding';
import VentaEmpresasCaseStudies from '@/components/venta-empresas/VentaEmpresasCaseStudies';
import VentaEmpresasValuationLanding from '@/components/venta-empresas/VentaEmpresasValuationLanding';
import VentaEmpresasFAQLanding from '@/components/venta-empresas/VentaEmpresasFAQLanding';
import VentaEmpresasConversionCTA from '@/components/venta-empresas/VentaEmpresasConversionCTA';
import StickyNavigationLanding from '@/components/venta-empresas/StickyNavigationLanding';

const VentaEmpresas = () => {
  useEffect(() => {
    // SEO optimization for Landing Page - Focused on conversion
    document.title = "¡Vende Tu Empresa Ahora! | Máximo Precio Garantizado | Capittal";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 
        '🚀 ¡Vende tu empresa al MÁXIMO precio! +200 operaciones exitosas. Valoración GRATUITA en 48h. Confidencialidad 100%. ¡Empieza HOY!'
      );
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = '🚀 ¡Vende tu empresa al MÁXIMO precio! +200 operaciones exitosas. Valoración GRATUITA en 48h. Confidencialidad 100%. ¡Empieza HOY!';
      document.head.appendChild(meta);
    }

    // Landing page keywords - more conversion-focused
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute('content', 'vender empresa rápido, máximo precio empresa, valoración gratuita, venta empresa exitosa, capittal landing');

    return () => {
      document.title = "Capittal";
    };
  }, []);

  return (
    <LandingLayout>
      <StickyNavigationLanding />
      <VentaEmpresasHeroLanding />
      <VentaEmpresasBenefitsLanding />
      <VentaEmpresasProcessLanding />
      <VentaEmpresasCaseStudies />
      <VentaEmpresasValuationLanding />
      <VentaEmpresasFAQLanding />
      <VentaEmpresasConversionCTA />
    </LandingLayout>
  );
};

export default VentaEmpresas;
