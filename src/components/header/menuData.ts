
import { 
  Building, 
  Calculator, 
  Scale, 
  FileText, 
  TrendingUp, 
  ArrowRightLeft,
  Gavel,
  Hospital,
  Factory,
  ShoppingBag,
  Computer,
  Newspaper,
  BookOpen,
  BarChart3,
  Mail,
  Video,
  Users,
  Award,
  Target,
  UserPlus
} from "lucide-react";

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon?: any;
  description?: string;
  image?: string;
}

export interface MenuCategory {
  title: string;
  items: NavItem[];
}

export const serviciosData: MenuCategory[] = [
  {
    title: "Servicios Principales",
    items: [
      {
        id: "venta-empresas",
        label: "Venta de Empresas",
        href: "/venta-empresas",
        icon: Building,
        description: "Asesoramiento completo para la venta de tu empresa",
        image: "/lovable-uploads/20da2e90-43c8-4c44-a119-a68b49bf41c0.png"
      },
      {
        id: "compra-empresas",
        label: "Compra de Empresas",
        href: "/compra-empresas",
        icon: Target,
        description: "Identificación y adquisición de oportunidades estratégicas",
        image: "/lovable-uploads/3aeb6303-e888-4dde-846f-88ec5c6606ae.png"
      },
      {
        id: "valoraciones",
        label: "Valoraciones",
        href: "/servicios/valoraciones",
        icon: Calculator,
        description: "Valoraciones precisas y profesionales de empresas",
        image: "/lovable-uploads/5459d292-9157-404f-915b-a1608e1f4779.png"
      }
    ]
  },
  {
    title: "Servicios Especializados",
    items: [
      {
        id: "asesoramiento-legal",
        label: "Asesoramiento Legal en Compraventas",
        href: "/servicios/asesoramiento-legal",
        icon: Scale,
        description: "Asesoramiento jurídico integral en operaciones M&A"
      },
      {
        id: "planificacion-fiscal",
        label: "Planificación Fiscal",
        href: "/servicios/planificacion-fiscal",
        icon: Calculator,
        description: "Optimización tributaria en operaciones empresariales"
      },
      {
        id: "due-diligence",
        label: "Due Diligence",
        href: "/servicios/due-diligence",
        icon: FileText,
        description: "Análisis exhaustivo de riesgos y oportunidades"
      },
      {
        id: "reestructuraciones",
        label: "Reestructuraciones",
        href: "/servicios/reestructuraciones",
        icon: Gavel,
        description: "Reestructuración empresarial y financiera"
      }
    ]
  }
];

export const sectoresData: MenuCategory[] = [
  {
    title: "Sectores de Especialización",
    items: [
      {
        id: "financial-services",
        label: "Financial Services",
        href: "/sectores/financial-services",
        icon: Scale,
        description: "Especialistas en el sector financiero"
      },
      {
        id: "healthcare",
        label: "Healthcare",
        href: "/sectores/healthcare",
        icon: Hospital,
        description: "Sector sanitario y farmacéutico"
      },
      {
        id: "industrial",
        label: "Industrial",
        href: "/sectores/industrial",
        icon: Factory,
        description: "Sector industrial y manufactura"
      },
      {
        id: "retail-consumer",
        label: "Retail & Consumer",
        href: "/sectores/retail-consumer",
        icon: ShoppingBag,
        description: "Comercio y bienes de consumo"
      },
      {
        id: "tecnologia",
        label: "Tecnología",
        href: "/sectores/tecnologia",
        icon: Computer,
        description: "Sector tecnológico y digital"
      }
    ]
  }
];

export const recursosData: MenuCategory[] = [
  {
    title: "Contenido y Herramientas",
    items: [
      {
        id: "blog",
        label: "Blog",
        href: "/recursos/blog",
        icon: Newspaper,
        description: "Últimas noticias y análisis del mercado M&A"
      },
      {
        id: "case-studies",
        label: "Case Studies",
        href: "/recursos/case-studies",
        icon: BookOpen,
        description: "Casos de éxito reales de nuestros clientes"
      },
      {
        id: "market-reports",
        label: "Market Reports",
        href: "/recursos/market-reports",
        icon: BarChart3,
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
        href: "/calculadora-valoracion",
        icon: Calculator,
        description: "Herramienta gratuita para valorar tu empresa"
      },
      {
        id: "documentacion-ma",
        label: "Documentación M&A",
        href: "/documentacion-ma",
        icon: FileText,
        description: "Guías completas sobre M&A"
      },
      {
        id: "newsletter",
        label: "Newsletter",
        href: "/recursos/newsletter",
        icon: Mail,
        description: "Suscríbete a nuestro boletín mensual"
      },
      {
        id: "webinars",
        label: "Webinars",
        href: "/recursos/webinars",
        icon: Video,
        description: "Seminarios web con expertos"
      }
    ]
  }
];

export const nosotrosData: MenuCategory[] = [
  {
    title: "Conócenos",
    items: [
      {
        id: "por-que-elegirnos",
        label: "Por Qué Elegirnos",
        href: "/por-que-elegirnos",
        icon: Award,
        description: "Nuestra experiencia y metodología única"
      },
      {
        id: "casos-exito",
        label: "Casos de Éxito",
        href: "/casos-exito",
        icon: TrendingUp,
        description: "Historias de éxito de nuestros clientes"
      },
      {
        id: "equipo",
        label: "Equipo",
        href: "/equipo",
        icon: Users,
        description: "Conoce a nuestro equipo de expertos"
      },
      {
        id: "nosotros",
        label: "Nosotros",
        href: "/nosotros",
        icon: Building,
        description: "Historia y valores de Capittal"
      }
    ]
  }
];

export const colaboradoresData: NavItem[] = [
  {
    id: "programa-colaboradores",
    label: "Programa de Colaboradores",
    href: "/programa-colaboradores",
    icon: UserPlus,
    description: "Únete a nuestra red de colaboradores"
  }
];

// Mantener compatibilidad con el código existente
export const menuData = {
  serviciosItems: serviciosData.flatMap(category => category.items),
  sectoresItems: sectoresData.flatMap(category => category.items),
  recursosItems: recursosData.flatMap(category => category.items),
  nosotrosItems: nosotrosData.flatMap(category => category.items),
  navItems: colaboradoresData,
};
