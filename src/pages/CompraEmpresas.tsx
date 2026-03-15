import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import UnifiedLayout from '@/components/shared/UnifiedLayout';
import AcquisitionHero from '@/components/landing/AcquisitionHero';
import GrowthStrategy from '@/components/landing/GrowthStrategy';
import AcquisitionProcess from '@/components/landing/AcquisitionProcess';
import WhyChooseUs from '@/components/landing/WhyChooseUs';
import SuccessStories from '@/components/landing/SuccessStories';
import CompraEmpresasFAQ from '@/components/landing/CompraEmpresasFAQ';
import Contact from '@/components/Contact';
import { SEOHead } from '@/components/seo';
import { getServiceSchema, getWebPageSchema, getBreadcrumbSchema, getFAQSchema } from '@/utils/seo/schemas';
import { useI18n } from '@/shared/i18n/I18nProvider';

const COMPRA_FAQ_DATA = [
  {
    question: '¿Qué tipo de empresas puedo adquirir con Capittal?',
    answer: 'Asesoramos en la adquisición de PYMES y mid-market en España, con facturación desde €1M hasta €50M+. Trabajamos en todos los sectores: industrial, tecnología, servicios, distribución, alimentación, construcción y más. Identificamos oportunidades que se ajusten a tus criterios de inversión específicos.'
  },
  {
    question: '¿Cuánto cuesta el proceso de compra de una empresa?',
    answer: 'Nuestros honorarios se basan en una estructura de éxito (success fee) alineada con tus intereses: solo cobramos si la operación se cierra. El porcentaje varía entre el 2% y el 5% del valor de la transacción, dependiendo del tamaño y complejidad. La consulta inicial es gratuita.'
  },
  {
    question: '¿Cuánto tiempo tarda el proceso de adquisición?',
    answer: 'El proceso completo suele durar entre 6 y 12 meses: identificación de targets (1-3 meses), negociación y LOI (1-2 meses), due diligence (2-3 meses), y documentación legal y cierre (1-2 meses). Operaciones más complejas o con múltiples targets pueden requerir más tiempo.'
  },
  {
    question: '¿Cómo identificáis las empresas objetivo?',
    answer: 'Utilizamos una combinación de nuestra base de datos propietaria con más de 5.000 empresas, análisis sectorial, red de contactos con intermediarios y brokers, y herramientas de inteligencia de mercado. Filtramos por criterios como sector, tamaño, rentabilidad, ubicación y potencial de crecimiento.'
  },
  {
    question: '¿Qué financiación necesito para comprar una empresa?',
    answer: 'Típicamente necesitarás entre el 30% y el 50% del precio en equity propio. El resto puede financiarse con deuda bancaria, vendor financing, o inversores externos. Te ayudamos a estructurar la financiación óptima y te conectamos con bancos y fondos especializados en M&A.'
  },
  {
    question: '¿Realizáis también el due diligence?',
    answer: 'Sí, ofrecemos un servicio integral que incluye due diligence financiera, legal, comercial y operativa. Coordinamos todo el proceso con nuestro equipo multidisciplinar para que tengas una visión completa de la empresa antes de tomar la decisión de compra.'
  }
];

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
    <UnifiedLayout variant="home">
      <SEOHead 
        title={t('compraEmpresas.seo.title')}
        description={t('compraEmpresas.seo.description')}
        canonical={`https://capittal.es${location.pathname}`}
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
            `https://capittal.es${location.pathname}`
          ),
          getBreadcrumbSchema([
            { name: 'Inicio', url: 'https://capittal.es/' },
            { name: 'Servicios', url: 'https://capittal.es/servicios' },
            { name: 'Compra de Empresas', url: 'https://capittal.es/compra-empresas' }
          ]),
          getFAQSchema(COMPRA_FAQ_DATA)
        ]}
      />
      <AcquisitionHero />
      <GrowthStrategy />
      <AcquisitionProcess />
      <WhyChooseUs />
      <SuccessStories />
      <CompraEmpresasFAQ />
      <Contact 
        id="contact"
        pageOrigin="compra-empresas"
        variant="compra"
      />
    </UnifiedLayout>
  );
};

export default CompraEmpresas;
