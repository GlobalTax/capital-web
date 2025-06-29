
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
  Mail,
  UserPlus,
  BookOpen,
} from 'lucide-react';
import { NavigationItem, NavigationGroup } from './types';

export const dashboardItems: NavigationItem[] = [
  {
    title: 'Inicio',
    url: '/admin',
    icon: LayoutDashboard,
    exact: true,
  },
];

export const navigationGroups: NavigationGroup[] = [
  {
    title: 'Contenido IA',
    items: [
      {
        title: 'AI Content Studio Pro',
        url: '/admin/blog-v2',
        icon: PenTool,
        badge: 'NEW'
      },
      {
        title: 'Reports Sectoriales IA',
        url: '/admin/sector-reports',
        icon: BookOpen,
        badge: 'NEW'
      },
    ],
  },
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
    title: 'Leads',
    items: [
      {
        title: 'Leads de Contacto',
        url: '/admin/contact-leads',
        icon: Mail,
      },
      {
        title: 'Solicitudes Colaboradores',
        url: '/admin/collaborator-applications',
        icon: UserPlus,
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
