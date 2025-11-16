import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AcquisitionHero from '@/components/landing/AcquisitionHero';
import GrowthStrategy from '@/components/landing/GrowthStrategy';
import AcquisitionProcess from '@/components/landing/AcquisitionProcess';
import WhyChooseUs from '@/components/landing/WhyChooseUs';
import SuccessStories from '@/components/landing/SuccessStories';
import Contact from '@/components/Contact';
import { SEOHead } from '@/components/seo';
import { getServiceSchema, getWebPageSchema } from '@/utils/seo/schemas';
import { useI18n } from '@/shared/i18n/I18nProvider';

const CompraEmpresas = () => {
  const { t, setLang } = useI18n();
  const location = useLocation();
  
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/compra-empreses')) {
      setLang('ca');
    } else if (path.includes('/buy-companies')) {
      setLang('en');
    } else {
      setLang('es');
    }
  }, [location.pathname, setLang]);

  useEffect(() => {
    const hreflangUrls = {
      'es': 'https://capittal.es/compra-empresas',
      'ca': 'https://capittal.es/compra-empreses',
      'en': 'https://capittal.es/buy-companies',
      'x-default': 'https://capittal.es/compra-empresas'
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
        title={t('compraEmpresas.seo.title')}
        description={t('compraEmpresas.seo.description')}
        canonical="https://capittal.es/compra-empresas"
        keywords={t('compraEmpresas.seo.keywords')}
        structuredData={[
          getServiceSchema(
            t('compraEmpresas.seo.title'),
            t('compraEmpresas.seo.description'),
            "Business Acquisition Service"
          ),
          getWebPageSchema(
            t('compraEmpresas.seo.title'),
            t('compraEmpresas.seo.description'),
            "https://capittal.es/compra-empresas"
          )
        ]}
      />
      <div className="min-h-screen bg-white">
        <Header />
        <div className="pt-16">
          <AcquisitionHero />
          <GrowthStrategy />
          <AcquisitionProcess />
          <WhyChooseUs />
          <SuccessStories />
          <Contact 
            id="contact"
            pageOrigin="compra-empresas"
            variant="compra"
          />
        </div>
        <Footer />
      </div>
    </>
  );
};

export default CompraEmpresas;
