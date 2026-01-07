import { MenuCategory } from '../types';

export interface SearchFundsFeatured {
  title: string;
  description: string;
  href: string;
  cta: string;
}

export interface SearchFundsData {
  featured: SearchFundsFeatured;
  categories: MenuCategory[];
}

export const searchFundsData: SearchFundsData = {
  featured: {
    title: "¿Es tu empresa ideal para un Search Fund?",
    description: "Descubre en 2 minutos si tu empresa encaja con el perfil de adquisición de los Search Funds",
    href: "/servicios/search-funds#calculadora",
    cta: "Hacer el Test"
  },
  categories: [
    {
      title: "Para Empresarios",
      items: [
        {
          id: "calculadora-fit",
          label: "Calculadora de Fit",
          href: "/servicios/search-funds#calculadora",
          icon: 'calculator',
          description: "Evalúa si tu empresa es ideal para un Search Fund"
        },
        {
          id: "valoracion-sf",
          label: "Valoración Search Funds",
          href: "/search-funds/recursos/valoracion",
          icon: 'trending-up',
          description: "Cómo valoran los Search Funds tu empresa"
        },
        {
          id: "negociacion-sf",
          label: "Negociación",
          href: "/search-funds/recursos/negociacion",
          icon: 'handshake',
          description: "Estrategias para negociar con un Searcher"
        }
      ]
    },
    {
      title: "Para Searchers",
      items: [
        {
          id: "registro-searcher",
          label: "Registrarme como Searcher",
          href: "/search-funds/registro-searcher",
          icon: 'user-plus',
          description: "Accede a nuestro deal flow cualificado"
        },
        {
          id: "sourcing",
          label: "Guía de Sourcing",
          href: "/search-funds/recursos/sourcing",
          icon: 'search',
          description: "Cómo encontrar empresas objetivo"
        }
      ]
    },
    {
      title: "Aprende",
      items: [
        {
          id: "guia-completa",
          label: "Guía Completa",
          href: "/search-funds/recursos/guia",
          icon: 'book-open',
          description: "Todo sobre el modelo Search Fund"
        },
        {
          id: "glosario-ma",
          label: "Glosario M&A",
          href: "/search-funds/recursos/glosario",
          icon: 'library',
          description: "52 términos esenciales del sector"
        },
        {
          id: "casos-exito",
          label: "Casos de Éxito",
          href: "/search-funds/recursos/casos",
          icon: 'trophy',
          description: "Historias reales de adquisiciones"
        },
        {
          id: "centro-recursos",
          label: "Centro de Recursos",
          href: "/search-funds/recursos",
          icon: 'folder',
          description: "Biblioteca completa de Search Funds"
        }
      ]
    }
  ]
};
