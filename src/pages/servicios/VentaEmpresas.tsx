import React, { useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import VentaEmpresasHero from '@/components/venta-empresas/VentaEmpresasHero';
import VentaEmpresasProcess from '@/components/venta-empresas/VentaEmpresasProcess';
import VentaEmpresasBenefits from '@/components/venta-empresas/VentaEmpresasBenefits';
import VentaEmpresasValuation from '@/components/venta-empresas/VentaEmpresasValuation';
import VentaEmpresasCaseStudies from '@/components/venta-empresas/VentaEmpresasCaseStudies';
import VentaEmpresasValuationFactors from '@/components/venta-empresas/VentaEmpresasValuationFactors';
import VentaEmpresasFAQ from '@/components/venta-empresas/VentaEmpresasFAQ';
import VentaEmpresasCTA from '@/components/venta-empresas/VentaEmpresasCTA';
import AccessibilityTools from '@/components/AccessibilityTools';
import NotificationCenter from '@/components/NotificationCenter';

const VentaEmpresas = () => {
  useEffect(() => {
    // SEO Meta Tags
    document.title = 'Venta de Empresas | Asesoramiento M&A Completo | Capittal';
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Servicio completo de venta de empresas. Valoración, due diligence, negociación y cierre. Más de 200 operaciones exitosas. Contacta ahora.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Servicio completo de venta de empresas. Valoración, due diligence, negociación y cierre. Más de 200 operaciones exitosas. Contacta ahora.';
      document.head.appendChild(meta);
    }

    // Keywords meta tag
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', 'venta empresa, M&A, asesoramiento financiero, due diligence, valoración empresarial, fusiones adquisiciones');
    } else {
      const keywordsMeta = document.createElement('meta');
      keywordsMeta.name = 'keywords';
      keywordsMeta.content = 'venta empresa, M&A, asesoramiento financiero, due diligence, valoración empresarial, fusiones adquisiciones';
      document.head.appendChild(keywordsMeta);
    }

    return () => {
      // Cleanup meta tags on unmount
      const desc = document.querySelector('meta[name="description"]');
      const keywords = document.querySelector('meta[name="keywords"]');
      if (desc) desc.remove();
      if (keywords) keywords.remove();
    };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main role="main" className="pt-16">
        <VentaEmpresasHero />
        <VentaEmpresasProcess />
        <VentaEmpresasBenefits />
        <VentaEmpresasValuation />
        <VentaEmpresasCaseStudies />
        <VentaEmpresasValuationFactors />
        <VentaEmpresasFAQ />
        <VentaEmpresasCTA />
      </main>
      <Footer />
      <AccessibilityTools />
      <NotificationCenter className="mr-16" />
      <div 
        aria-live="polite" 
        aria-atomic="true" 
        className="sr-only"
        id="accessibility-announcements"
      />
    </div>
  );
};

export default VentaEmpresas;