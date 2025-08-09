import { MenuCategory } from '../types';

export const calculadorasData: MenuCategory[] = [
  {
    title: "Calculadoras Especializadas",
    items: [
      {
        id: "calc-general",
        label: "Calculadora General",
        description: "Valoración rápida y gratuita para cualquier tipo de empresa",
        icon: "Calculator",
        href: "/calculadora-gratuita"
      },
      {
        id: "calc-sectores",
        label: "Por Sectores",
        description: "Calculadoras especializadas con múltiplos específicos de cada industria",
        icon: "Building",
        href: "/calculadoras"
      },
      {
        id: "calc-tecnologia",
        label: "Tecnología",
        description: "Especializada en SaaS, software y empresas tecnológicas",
        icon: "Computer",
        href: "/calculadora/tecnologia"
      },
      {
        id: "calc-retail",
        label: "Retail & E-commerce",
        description: "Para comercio minorista, distribución y e-commerce",
        icon: "ShoppingBag",
        href: "/calculadora/retail"
      },
      {
        id: "calc-manufactura",
        label: "Manufactura",
        description: "Industria manufacturera, maquinaria y productos industriales",
        icon: "Factory",
        href: "/calculadora/manufactura"
      },
      {
        id: "calc-servicios",
        label: "Servicios",
        description: "Servicios profesionales, consultoría y outsourcing",
        icon: "Users",
        href: "/calculadora/servicios"
      }
    ]
  }
];