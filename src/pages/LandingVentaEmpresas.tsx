import React, { useEffect } from 'react';
import UnifiedLayout from '@/components/shared/UnifiedLayout';
import VentaEmpresasHeroLanding from '@/components/venta-empresas/VentaEmpresasHeroLanding';
import VentaEmpresasBenefitsLanding from '@/components/venta-empresas/VentaEmpresasBenefitsLanding';
import VentaEmpresasProcessLanding from '@/components/venta-empresas/VentaEmpresasProcessLanding';
import VentaEmpresasCaseStudies from '@/components/venta-empresas/VentaEmpresasCaseStudies';
import VentaEmpresasFAQLanding from '@/components/venta-empresas/VentaEmpresasFAQLanding';
import VentaEmpresasConversionCTA from '@/components/venta-empresas/VentaEmpresasConversionCTA';
import VentaEmpresasTestimonials from '@/components/venta-empresas/VentaEmpresasTestimonials';
import VentaEmpresasComparison from '@/components/venta-empresas/VentaEmpresasComparison';

const LandingVentaEmpresas = () => {
  useEffect(() => {
    // SEO optimization for Landing Page - Focused on conversion
    document.title = "¡Vende Tu Empresa Ahora! | Máximo Precio Garantizado | Capittal";
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 
        '🚀 ¡Vende tu empresa al MÁXIMO precio! +200 operaciones exitosas. Consulta GRATUITA en 48h. Proceso confidencial 100%. ¡Empieza HOY!'
      );
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = '🚀 ¡Vende tu empresa al MÁXIMO precio! +200 operaciones exitosas. Consulta GRATUITA en 48h. Proceso confidencial 100%. ¡Empieza HOY!';
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

    // Open Graph meta tags
    const setOgTag = (property: string, content: string) => {
      let tag = document.querySelector(`meta[property="${property}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('property', property);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    setOgTag('og:title', '¡Vende Tu Empresa Ahora! | Máximo Precio Garantizado');
    setOgTag('og:description', '🚀 +200 operaciones exitosas. Valoración GRATUITA en 48h. Confidencialidad 100%');
    setOgTag('og:type', 'website');
    setOgTag('og:url', 'https://capittal.es/lp/venta-empresas');

    // Schema.org JSON-LD
    const schemaScript = document.createElement('script');
    schemaScript.type = 'application/ld+json';
    schemaScript.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Service",
      "name": "Venta de Empresas",
      "description": "Servicio profesional de venta de empresas con máximo precio garantizado",
      "provider": {
        "@type": "Organization",
        "name": "Capittal",
        "url": "https://capittal.es"
      },
      "areaServed": "ES",
      "offers": {
        "@type": "Offer",
        "description": "Valoración gratuita de empresa en 48 horas"
      }
    });
    document.head.appendChild(schemaScript);

    return () => {
      document.title = "Capittal";
      if (schemaScript.parentNode) {
        schemaScript.parentNode.removeChild(schemaScript);
      }
    };
  }, []);

  return (
    <UnifiedLayout variant="home">
      <VentaEmpresasHeroLanding />
      <VentaEmpresasBenefitsLanding />
      
      <VentaEmpresasProcessLanding />
      <VentaEmpresasComparison />
      <VentaEmpresasCaseStudies />
      <VentaEmpresasTestimonials />
      <VentaEmpresasFAQLanding />
      <VentaEmpresasConversionCTA />
    </UnifiedLayout>
  );
};

export default LandingVentaEmpresas;