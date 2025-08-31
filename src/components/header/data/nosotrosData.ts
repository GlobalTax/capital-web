
import { MenuCategory } from '../types';

export const nosotrosData: MenuCategory[] = [
  {
    title: "Conócenos",
    items: [
      {
        id: "de-looper-a-capittal",
        label: "De Looper a Capittal",
        href: "/de-looper-a-capittal",
        icon: 'refresh-ccw',
        description: "Nuestra evolución y mejoras"
      },
      {
        id: "por-que-elegirnos",
        label: "Por Qué Elegirnos",
        href: "/por-que-elegirnos",
        icon: 'award',
        description: "Nuestra experiencia y metodología única"
      },
      {
        id: "casos-exito",
        label: "Casos de Éxito",
        href: "/casos-exito",
        icon: 'trending-up',
        description: "Historias de éxito de nuestros clientes"
      },
      {
        id: "equipo",
        label: "Equipo",
        href: "/equipo",
        icon: 'users',
        description: "Conoce a nuestro equipo de expertos"
      },
      {
        id: "nosotros",
        label: "Nosotros",
        href: "/nosotros",
        icon: 'building',
        description: "Historia y valores de Capittal"
      }
    ]
  }
];
