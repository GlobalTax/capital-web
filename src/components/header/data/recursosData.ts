import { MenuCategory } from '../types';

export const recursosData: MenuCategory[] = [
  {
    title: "Herramientas Gratuitas",
    items: [
      {
        id: "calculadora-valoracion",
        label: "Calculadora de Valoración",
        href: "/lp/calculadora",
        icon: 'calculator',
        description: "Obtén una valoración inicial de tu empresa"
      },
      {
        id: "test-exit-ready",
        label: "Test Exit-Ready",
        href: "/recursos/test-exit-ready",
        icon: 'clipboard-check',
        description: "¿Está tu empresa preparada para la venta?"
      },
      {
        id: "calculadora-fiscal",
        label: "Calculadora Fiscal",
        href: "/lp/calculadora-fiscal",
        icon: 'receipt',
        description: "Calcula el impacto fiscal de la venta"
      }
    ]
  },
  {
    title: "Contenido",
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
      },
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
