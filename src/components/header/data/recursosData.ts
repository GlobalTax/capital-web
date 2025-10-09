
import { MenuCategory } from '../types';

export const recursosData: MenuCategory[] = [
  {
    title: "Contenido y Herramientas",
    items: [
      {
        id: "blog",
        label: "Blog",
        href: "/recursos/blog",
        icon: 'newspaper',
        description: "Últimas noticias y análisis del mercado M&A"
      },
      {
        id: "case-studies",
        label: "Case Studies",
        href: "/recursos/case-studies",
        icon: 'book-open',
        description: "Casos de éxito reales de nuestros clientes"
      },
      {
        id: "marketplace",
        label: "Marketplace",
        href: "/oportunidades",
        icon: 'store',
        description: "Explora oportunidades de compra y venta de empresas"
      },
      {
        id: "empleos",
        label: "Empleos",
        href: "/oportunidades/empleo",
        icon: 'briefcase',
        description: "Ofertas de trabajo en el sector M&A"
      }
    ]
  },
  {
    title: "Herramientas Interactivas",
    items: [
      {
        id: "calculadora-valoracion",
        label: "Calculadora de Valoración",
        href: "/lp/calculadora",
        icon: 'calculator',
        description: "Herramienta gratuita para valorar tu empresa"
      },
      // {
      //   id: "documentacion-ma",
      //   label: "Documentación M&A",
      //   href: "/documentacion-ma",
      //   icon: 'file-text',
      //   description: "Guías completas sobre M&A"
      // },
      {
        id: "newsletter",
        label: "Newsletter",
        href: "/recursos/newsletter",
        icon: 'mail',
        description: "Suscríbete a nuestro boletín mensual"
      },
      {
        id: "webinars",
        label: "Webinars",
        href: "/recursos/webinars",
        icon: 'video',
        description: "Seminarios web con expertos"
      }
    ]
  }
];
