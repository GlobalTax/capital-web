
import { MenuCategory } from '../types';

export const nosotrosData: MenuCategory[] = [
  {
    title: "Conócenos",
    items: [
      {
        id: "por-que-elegirnos",
        label: "Por Qué Elegirnos",
        href: "/por-que-elegirnos",
        icon: 'Award',
        description: "Nuestra experiencia y metodología única"
      },
      {
        id: "casos-exito",
        label: "Casos de Éxito",
        href: "/casos-exito",
        icon: 'TrendingUp',
        description: "Historias de éxito de nuestros clientes"
      },
      {
        id: "equipo",
        label: "Equipo",
        href: "/equipo",
        icon: 'Users',
        description: "Conoce a nuestro equipo de expertos"
      },
      {
        id: "nosotros",
        label: "Nosotros",
        href: "/nosotros",
        icon: 'Building',
        description: "Historia y valores de Capittal"
      }
    ]
  }
];
