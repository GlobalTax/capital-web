
import { 
  Scale, 
  Hospital, 
  Factory, 
  ShoppingBag, 
  Computer 
} from "lucide-react";
import { MenuCategory } from '../types';

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
