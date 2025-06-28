
import {
  LayoutDashboard,
  FileText,
  Building2,
  PenTool,
  BarChart3,
  TrendingUp,
  Users,
  MessageSquare,
  Star,
  Image,
} from 'lucide-react';
import { NavigationItem, NavigationGroup } from './types';

export const dashboardItems: NavigationItem[] = [
  {
    title: 'Dashboard',
    url: '/admin',
    icon: LayoutDashboard,
    exact: true,
  },
];

export const navigationGroups: NavigationGroup[] = [
  {
    title: 'Contenido',
    items: [
      {
        title: 'Casos de Éxito',
        url: '/admin/case-studies',
        icon: FileText,
      },
      {
        title: 'Operaciones',
        url: '/admin/operations',
        icon: Building2,
      },
      {
        title: 'Blog Posts',
        url: '/admin/blog',
        icon: PenTool,
      },
    ],
  },
  {
    title: 'Datos',
    items: [
      {
        title: 'Múltiplos',
        url: '/admin/multiples',
        icon: BarChart3,
      },
      {
        title: 'Estadísticas',
        url: '/admin/statistics',
        icon: TrendingUp,
      },
    ],
  },
  {
    title: 'Usuarios',
    items: [
      {
        title: 'Equipo',
        url: '/admin/team',
        icon: Users,
      },
      {
        title: 'Testimonios',
        url: '/admin/testimonials',
        icon: MessageSquare,
      },
      {
        title: 'Test. Carrusel',
        url: '/admin/carousel-testimonials',
        icon: Star,
      },
    ],
  },
  {
    title: 'Visuales',
    items: [
      {
        title: 'Logos Carrusel',
        url: '/admin/carousel-logos',
        icon: Image,
      },
    ],
  },
];
