import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import UnifiedLayout from '@/components/shared/UnifiedLayout';
import VentaEmpresasHero from '@/components/venta-empresas/VentaEmpresasHero';
import VentaEmpresasBenefits from '@/components/venta-empresas/VentaEmpresasBenefits';
import VentaEmpresasProcess from '@/components/venta-empresas/VentaEmpresasProcess';
import VentaEmpresasValuation from '@/components/venta-empresas/VentaEmpresasValuation';
import VentaEmpresasFAQ from '@/components/venta-empresas/VentaEmpresasFAQ';
import VentaEmpresasCTA from '@/components/venta-empresas/VentaEmpresasCTA';
import { SEOHead } from '@/components/seo';
import { getServiceSchema } from '@/utils/seo/schemas';
import { useI18n } from '@/shared/i18n/I18nProvider';

const VentaEmpresas = () => {
  const { t, setLang } = useI18n();
  const location = useLocation();
  
  // Detect language from URL
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/venda-empreses')) {
      setLang('ca');
    } else if (path.includes('/sell-companies')) {
      setLang('en');
    } else {
      setLang('es');
    }
  }, [location.pathname, setLang]);
  
  // Add hreflang links
  useEffect(() => {
    const hreflangUrls = {
      'es': 'https://capittal.es/venta-empresas',
      'ca': 'https://capittal.es/venda-empreses',
      'en': 'https://capittal.es/sell-companies',
      'x-default': 'https://capittal.es/venta-empresas'
    };
    
    document.querySelectorAll('link[rel="alternate"]').forEach(link => link.remove());
    Object.entries(hreflangUrls).forEach(([lang, url]) => {
      const link = document.createElement('link');
      link.rel = 'alternate';
      link.hreflang = lang;
      link.href = url;
      document.head.appendChild(link);
    });
  }, []);
  
  return (
    <>
      <SEOHead 
        title={t('ventaEmpresas.seo.title')}
        description={t('ventaEmpresas.seo.description')}
        canonical="https://capittal.es/venta-empresas"
        keywords={t('ventaEmpresas.seo.keywords')}
        structuredData={getServiceSchema(
          t('ventaEmpresas.seo.title'),
          t('ventaEmpresas.seo.description'),
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
