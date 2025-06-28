
import { 
  Building, 
  Calculator, 
  Scale, 
  FileText, 
  Target,
  Gavel
} from "lucide-react";
import { MenuCategory } from '../types';

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
