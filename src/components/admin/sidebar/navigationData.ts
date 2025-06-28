
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
  Calendar,
  Clock,
  Settings,
  HelpCircle,
  Zap
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
    title: 'Gestión de Contenido',
    items: [
      {
        title: 'AI Content Studio Pro',
        url: '/admin/blog-v2',
        icon: PenTool,
        badge: 'NEW'
      },
      {
        title: 'Blog Posts',
        url: '/admin/blog',
        icon: FileText,
      },
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
    title: 'CRM & Leads',
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
    title: 'Datos y Métricas',
    items: [
      {
        title: 'Múltiplos de Valoración',
        url: '/admin/multiples',
        icon: BarChart3,
      },
      {
        title: 'Estadísticas Clave',
        url: '/admin/statistics',
        icon: TrendingUp,
      },
    ],
  },
  {
    title: 'Equipo y Testimonios',
    items: [
      {
        title: 'Miembros del Equipo',
        url: '/admin/team',
        icon: Users,
      },
      {
        title: 'Testimonios',
        url: '/admin/testimonials',
        icon: MessageSquare,
      },
      {
        title: 'Testimonios Carrusel',
        url: '/admin/carousel-testimonials',
        icon: Star,
      },
    ],
  },
  {
    title: 'Recursos Visuales',
    items: [
      {
        title: 'Logos Carrusel',
        url: '/admin/carousel-logos',
        icon: Image,
      },
    ],
  },
];
