import { 
  LayoutDashboard, 
  Target, 
  Settings, 
  Users, 
  BarChart3,
  Mail,
  UserPlus,
  Workflow,
  Brain,
  PieChart,
  Globe,
  FileText,
  Database,
  Award,
  Building2,
  TrendingUp,
  Zap,
  MessageSquare,
  TestTube,
  Image,
  AlertCircle,
  List,
  Contact
} from 'lucide-react';
import { LucideIcon } from 'lucide-react';

export interface SidebarItem {
  title: string;
  icon: LucideIcon;
  url: string;
  badge?: 'URGENTE' | 'AI' | 'NEW';
  description?: string;
  visible?: boolean;
}

export interface SidebarSection {
  title: string;
  description: string;
  items: SidebarItem[];
}

export const sidebarSections: SidebarSection[] = [
  {
    title: "Dashboard",
    description: "Panel principal",
    items: [
      { 
        title: "Panel Principal", 
        url: "/admin", 
        icon: LayoutDashboard,
        description: "Vista general de la plataforma"
      },
    ]
  },
  {
    title: "🎯 LEADS & WORKFLOWS",
    description: "Gestión completa del proceso desde lead hasta reunión",
    items: [
      { 
        title: "Lead Scoring", 
        url: "/admin/lead-scoring", 
        icon: Target, 
        badge: "URGENTE",
        description: "Priorización de leads y alertas urgentes"
      },
      { 
        title: "Reglas de Scoring", 
        url: "/admin/lead-scoring-rules", 
        icon: BarChart3,
        description: "Configuración de reglas de puntuación"
      },
      { 
        title: "Contactos", 
        url: "/admin/contacts", 
        icon: Contact,
        badge: "NEW",
        description: "Vista unificada de todos los contactos"
      },
      { 
        title: "Listas y Segmentación", 
        url: "/admin/contact-lists", 
        icon: List,
        description: "Organiza y segmenta contactos"
      },
      { 
        title: "Solicitudes Colaboradores", 
        url: "/admin/collaborator-applications", 
        icon: UserPlus,
        description: "Gestión de solicitudes de colaboradores"
      },
      { 
        title: "Alertas", 
        url: "/admin/alerts", 
        icon: AlertCircle, 
        badge: "URGENTE",
        description: "Notificaciones y eventos críticos"
      },
      { 
        title: "Propuestas Honorarios", 
        url: "/admin/proposals", 
        icon: FileText, 
        badge: "NEW",
        description: "Gestión de propuestas de honorarios"
      },
    ]
  },
  {
    title: "✉️ EMAIL MARKETING",
    description: "Campañas y automatizaciones de email",
    items: [
      {
        title: "Campañas de Email",
        url: "/admin/email-marketing",
        icon: Mail,
        description: "Gestión de campañas de email"
      },
      {
        title: "Marketing Automation",
        url: "/admin/marketing-automation",
        icon: Workflow,
        description: "Secuencias y workflows automatizados"
      }
    ]
  },
  {
    title: "🎨 GESTIÓN DE CONTENIDO",
    description: "Gestión de todo el contenido web",
    items: [
      { 
        title: "AI Content Studio Pro", 
        url: "/admin/blog-v2", 
        icon: FileText, 
        badge: "AI",
        description: "Generación de contenido con IA"
      },
      { 
        title: "Reports Sectoriales IA", 
        url: "/admin/sector-reports", 
        icon: Database, 
        badge: "AI",
        description: "Generación de reportes sectoriales"
      },
      { 
        title: "Casos de Éxito", 
        url: "/admin/case-studies", 
        icon: Award,
        description: "Gestión de casos de éxito"
      },
      { 
        title: "Lead Magnets", 
        url: "/admin/lead-magnets", 
        icon: Zap,
        description: "Gestión de lead magnets"
      },
    ]
  },
  {
    title: "🏢 DATOS DE EMPRESA",
    description: "Información y métricas empresariales",
    items: [
      { 
        title: "Operaciones", 
        url: "/admin/operations", 
        icon: Building2,
        description: "Gestión de operaciones"
      },
      { 
        title: "Múltiplos", 
        url: "/admin/multiples", 
        icon: TrendingUp,
        description: "Gestión de múltiplos de valoración"
      },
      { 
        title: "Estadísticas", 
        url: "/admin/statistics", 
        icon: BarChart3,
        description: "Métricas y estadísticas"
      },
    ]
  },
  {
    title: "👥 EQUIPO & TESTIMONIOS",
    description: "Gestión de equipo y testimonios",
    items: [
      { 
        title: "Equipo", 
        url: "/admin/team", 
        icon: Users,
        description: "Gestión del equipo"
      },
      { 
        title: "Testimonios", 
        url: "/admin/testimonials", 
        icon: MessageSquare,
        description: "Gestión de testimonios"
      },
      { 
        title: "Test. Carrusel", 
        url: "/admin/carousel-testimonials", 
        icon: TestTube,
        description: "Testimonios en carrusel"
      },
      { 
        title: "Logos Carrusel", 
        url: "/admin/carousel-logos", 
        icon: Image,
        description: "Logos en carrusel"
      },
    ]
  },
  {
    title: "📊 ANALYTICS & INTELLIGENCE",
    description: "Análisis avanzado e insights con IA",
    items: [
      { 
        title: "Marketing Intelligence", 
        url: "/admin/marketing-intelligence", 
        icon: Brain, 
        badge: "AI",
        description: "Análisis predictivo y insights"
      },
      { 
        title: "Marketing Hub", 
        url: "/admin/marketing-hub", 
        icon: PieChart,
        description: "Dashboard completo de métricas"
      },
      { 
        title: "Integraciones", 
        url: "/admin/integrations", 
        icon: Globe, 
        badge: "NEW",
        description: "Apollo, Google Ads, LinkedIn y más"
      },
    ]
  },
  {
    title: "⚙️ CONFIGURACIÓN",
    description: "Configuración general del sistema",
    items: [
      { 
        title: "Usuarios Admin", 
        url: "/admin/admin-users", 
        icon: Users, 
        badge: "NEW",
        description: "Gestión de usuarios administradores"
      },
      { 
        title: "Ajustes", 
        url: "/admin/settings", 
        icon: Settings,
        description: "Ajustes generales de la plataforma"
      },
    ]
  }
];