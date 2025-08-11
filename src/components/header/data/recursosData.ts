
import { MenuCategory } from '../types';

export const recursosData: MenuCategory[] = [
  {
    title: "Contenido y Herramientas",
    items: [
      {
        id: "blog",
        label: "Blog",
        href: "/recursos/blog",
        icon: 'Newspaper',
        description: "Últimas noticias y análisis del mercado M&A"
      },
      {
        id: "case-studies",
        label: "Case Studies",
        href: "/recursos/case-studies",
        icon: 'BookOpen',
        description: "Casos de éxito reales de nuestros clientes"
      },
      {
        id: "market-reports",
        label: "Market Reports",
        href: "/recursos/market-reports",
        icon: 'BarChart3',
        description: "Informes detallados del mercado"
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
        icon: 'Calculator',
        description: "Herramienta gratuita para valorar tu empresa"
      },
      {
        id: "documentacion-ma",
        label: "Documentación M&A",
        href: "/documentacion-ma",
        icon: 'FileText',
        description: "Guías completas sobre M&A"
      },
      {
        id: "newsletter",
        label: "Newsletter",
        href: "/recursos/newsletter",
        icon: 'Mail',
        description: "Suscríbete a nuestro boletín mensual"
      },
      {
        id: "webinars",
        label: "Webinars",
        href: "/recursos/webinars",
        icon: 'Video',
        description: "Seminarios web con expertos"
      }
    ]
  }
];
