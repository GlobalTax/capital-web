import React from 'react';
import UnifiedLayout from '@/components/shared/UnifiedLayout';
import VentaEmpresasHeroWithForm from '@/components/venta-empresas/VentaEmpresasHeroWithForm';
import VentaEmpresasBenefitsLanding from '@/components/venta-empresas/VentaEmpresasBenefitsLanding';
import VentaEmpresasProcessLanding from '@/components/venta-empresas/VentaEmpresasProcessLanding';
import VentaEmpresasCaseStudies from '@/components/venta-empresas/VentaEmpresasCaseStudies';
import VentaEmpresasFAQLanding from '@/components/venta-empresas/VentaEmpresasFAQLanding';
import VentaEmpresasTestimonials from '@/components/venta-empresas/VentaEmpresasTestimonials';
import VentaEmpresasComparison from '@/components/venta-empresas/VentaEmpresasComparison';
import { SEOHead } from '@/components/seo';
import { getServiceSchema } from '@/utils/seo/schemas';

const LandingVentaEmpresasV2 = () => {
  return (
    <>
      <SEOHead 
        title="¡Vende Tu Empresa Ahora! | Máximo Precio Garantizado | Capittal"
        description="🚀 ¡Vende tu empresa al MÁXIMO precio! +200 operaciones exitosas. Consulta GRATUITA en 48h. Proceso confidencial 100%. ¡Empieza HOY!"
        canonical="https://capittal.es/lp/venta-empresas-v2"
        keywords="vender empresa rápido, máximo precio empresa, valoración gratuita, venta empresa exitosa"
        structuredData={getServiceSchema(
          "Venta de Empresas",
          "Servicio profesional de venta de empresas con máximo precio garantizado",
          "Business Sale Service"
        )}
      />
      <UnifiedLayout variant="landing">
        {/* Hero con formulario above the fold (fondo negro) */}
        <VentaEmpresasHeroWithForm />
        
        {/* Resto de secciones */}
        <VentaEmpresasBenefitsLanding />
        <VentaEmpresasProcessLanding />
        <VentaEmpresasComparison />
        <VentaEmpresasCaseStudies />
        <VentaEmpresasTestimonials />
        <VentaEmpresasFAQLanding />
        {/* NO incluimos VentaEmpresasConversionCTA - el form ya está arriba */}
      </UnifiedLayout>
    </>
  );
};

export default LandingVentaEmpresasV2;
