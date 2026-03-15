import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import UnifiedLayout from '@/components/shared/UnifiedLayout';
import VentaEmpresasHero from '@/components/venta-empresas/VentaEmpresasHero';
import VentaEmpresasBenefits from '@/components/venta-empresas/VentaEmpresasBenefits';
import VentaEmpresasProcess from '@/components/venta-empresas/VentaEmpresasProcess';
import VentaEmpresasValuation from '@/components/venta-empresas/VentaEmpresasValuation';
import VentaEmpresasFAQ from '@/components/venta-empresas/VentaEmpresasFAQ';
import VentaEmpresasCTA from '@/components/venta-empresas/VentaEmpresasCTA';
import ServiceClosedOperations from '@/components/shared/ServiceClosedOperations';
import { SEOHead } from '@/components/seo';
import { getServiceSchema, getBreadcrumbSchema, getFAQSchema } from '@/utils/seo/schemas';
import { useI18n } from '@/shared/i18n/I18nProvider';

const VENTA_FAQ_DATA = [
  {
    question: '¿Cuánto tiempo tarda el proceso de venta?',
    answer: 'El proceso completo suele durar entre 6 y 12 meses, dependiendo de la complejidad de la empresa, las condiciones del mercado y la disponibilidad de compradores cualificados. Empresas más pequeñas pueden venderse en 6-8 meses, mientras que operaciones más complejas pueden requerir 10-12 meses.'
  },
  {
    question: '¿Cuáles son vuestros honorarios?',
    answer: 'Trabajamos con una estructura basada en resultados, cobrando un porcentaje del precio final de venta que varía entre el 3% y el 8% dependiendo del tamaño y complejidad de la operación.'
  },
  {
    question: '¿Cómo se mantiene la confidencialidad?',
    answer: 'La confidencialidad es fundamental en nuestro proceso. Utilizamos acuerdos de confidencialidad (NDAs) con todos los potenciales compradores, creamos memorandos anónimos inicialmente, y solo revelamos la identidad de tu empresa tras confirmar el interés serio y la capacidad financiera del comprador.'
  },
  {
    question: '¿Qué documentación necesito preparar?',
    answer: 'Necesitarás estados financieros de los últimos 3-5 años, información detallada sobre clientes y contratos principales, estructura organizativa, activos principales, y cualquier documentación legal relevante. Nosotros te ayudamos a preparar y organizar toda esta información de manera profesional.'
  },
  {
    question: '¿Puedo seguir dirigiendo la empresa durante el proceso?',
    answer: 'Absolutamente. Es esencial que mantengas el foco en el negocio durante el proceso de venta. Nosotros nos encargamos de la mayor parte del trabajo de marketing, identificación de compradores y negociación inicial, minimizando las distracciones en tu día a día.'
  },
  {
    question: '¿Qué sucede con mis empleados?',
    answer: 'La retención del equipo es crucial para el éxito de la venta. Trabajamos con compradores que valoran el capital humano y buscamos estructuras que incentiven la continuidad del equipo clave. También podemos ayudar a diseñar planes de retención durante el proceso.'
  }
];

const VentaEmpresas = () => {
  const { t, setLang } = useI18n();
  const location = useLocation();
  
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
        canonical={`https://capittal.es${location.pathname}`}
        keywords={t('ventaEmpresas.seo.keywords')}
        structuredData={[
          getServiceSchema(
            t('ventaEmpresas.seo.title'),
            t('ventaEmpresas.seo.description'),
            "Business Sale Service"
          ),
          getBreadcrumbSchema([
            { name: 'Inicio', url: 'https://capittal.es/' },
            { name: 'Servicios', url: 'https://capittal.es/servicios' },
            { name: 'Venta de Empresas', url: 'https://capittal.es/venta-empresas' }
          ]),
          getFAQSchema(VENTA_FAQ_DATA)
        ]}
      />
      <UnifiedLayout variant="home">
        <VentaEmpresasHero />
        <VentaEmpresasBenefits />
        <VentaEmpresasProcess />
        <VentaEmpresasValuation />
        <ServiceClosedOperations
          subtitle="Empresas que han confiado en nosotros para maximizar el valor de su venta"
        />
        <VentaEmpresasFAQ />
        <VentaEmpresasCTA />
      </UnifiedLayout>
    </>
  );
};

export default VentaEmpresas;
