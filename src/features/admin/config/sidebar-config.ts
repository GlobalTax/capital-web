// ============= ADMIN SIDEBAR CONFIGURATION =============
// Configuración centralizada para la navegación del admin

import { 
  LayoutDashboard, 
  Target, 
  Settings, 
  Users, 
  BarChart3,
  FileText,
  Award,
  Building2,
  TrendingUp,
  Zap,
  MessageSquare,
  Sparkles,
  Activity,
  Eye,
  Palette,
  Play,
  ClipboardList,
  Tags,
  Image,
  Calculator,
  Megaphone,
  Briefcase
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
    title: "📊 DASHBOARD",
    description: "Panel principal",
    items: [
      { 
        title: "Vista General", 
        url: "/admin", 
        icon: LayoutDashboard,
        description: "Dashboard principal"
      },
    ]
  },
  {
    title: "✨ CREAR CONTENIDO",
    description: "Herramientas de creación",
    items: [
      { 
        title: "Content Studio", 
        url: "/admin/content-studio", 
        icon: Sparkles, 
        badge: "AI",
        description: "Creación con IA",
        visible: false
      },
      { 
        title: "Lead Magnets",
        url: "/admin/lead-magnets", 
        icon: Zap,
        description: "Recursos descargables",
        visible: false
      },
      { 
        title: "Calculadora Meta",
        url: "/lp/calculadora-meta", 
        icon: Calculator,
        badge: "NEW",
        description: "Herramienta de valoración Meta Ads"
      },
      { 
        title: "Calculadora Asesores",
        url: "/lp/calculadora-asesores", 
        icon: Calculator,
        badge: "NEW",
        description: "Herramienta de valoración para asesores"
      },
      { 
        title: "Landing Pages", 
        url: "/admin/landing-pages-unified", 
        icon: LayoutDashboard,
        badge: "NEW",
        description: "Todas las landing pages"
      },
      { 
        title: "Blog & Contenido", 
        url: "/admin/blog-v2", 
        icon: FileText,
        description: "Posts y artículos"
      },
      { 
        title: "Casos de Éxito", 
        url: "/admin/case-studies", 
        icon: Award,
        description: "Casos de clientes"
      },
    ]
  },
  {
    title: "🏢 GESTIONAR DATOS",
    description: "Información corporativa",
    items: [
      { 
        title: "Sectores", 
        url: "/admin/sectors", 
        icon: Tags,
        badge: "NEW",
        description: "Gestión de sectores empresariales"
      },
      { 
        title: "Market Reports", 
        url: "/admin/market-reports", 
        icon: FileText,
        badge: "NEW",
        description: "Gestión de informes de mercado",
        visible: false
      },
      { 
        title: "Operaciones", 
        url: "/admin/operations", 
        icon: Building2,
        description: "Transacciones y deals"
      },
      { 
        title: "Múltiplos", 
        url: "/admin/multiples", 
        icon: TrendingUp,
        description: "Datos de valoración"
      },
      { 
        title: "Múltiplos Asesores", 
        url: "/admin/advisor-multiples", 
        icon: Calculator,
        badge: "NEW",
        description: "Múltiplos para calculadora de asesores"
      },
      { 
        title: "Documentos ROD",
        url: "/admin/rod-documents", 
        icon: FileText,
        badge: "NEW",
        description: "Gestión de ROD"
      },
      { 
        title: "Equipo", 
        url: "/admin/team", 
        icon: Users,
        description: "Perfiles del equipo"
      },
      { 
        title: "Testimonios", 
        url: "/admin/testimonials", 
        icon: MessageSquare,
        description: "Reseñas de clientes"
      },
      { 
        title: "Logos Carousel", 
        url: "/admin/carousel-logos", 
        icon: Image,
        badge: "NEW",
        description: "Gestión de logos del carrusel"
      },
      { 
        title: "Banners", 
        url: "/admin/banners", 
        icon: Megaphone,
        badge: "NEW",
        description: "Gestión de banners del sitio"
      },
    ]
  },
  {
    title: "💼 EMPLEO",
    description: "Gestión de ofertas de trabajo",
    items: [
      { 
        title: "Ofertas de Trabajo",
        url: "/admin/jobs", 
        icon: Briefcase,
        description: "Gestionar job posts"
      },
      { 
        title: "Aplicaciones",
        url: "/admin/job-applications", 
        icon: Users,
        badge: "NEW",
        description: "Revisar candidatos"
      },
      { 
        title: "Categorías",
        url: "/admin/job-categories", 
        icon: Tags,
        description: "Gestionar categorías"
      },
    ]
  },
  {
    title: "📈 ANALIZAR LEADS",
    description: "Gestión de prospectos",
    items: [
      { 
        title: "Contactos",
        url: "/admin/contacts", 
        icon: Users,
        description: "Base de contactos"
      },
      { 
        title: "Leads Inversores (ROD)",
        url: "/admin/investor-leads", 
        icon: TrendingUp,
        badge: "NEW",
        description: "Gestión de leads ROD"
      },
    ]
  },
  {
    title: "⚙️ CONFIGURACIÓN",
    description: "Configuración del sistema",
    items: [
      { 
        title: "Usuarios Admin", 
        url: "/admin/admin-users", 
        icon: Users,
        description: "Gestión de administradores"
      },
      { 
        title: "Ajustes", 
        url: "/admin/settings", 
        icon: Settings,
        description: "Configuración general"
      },
    ]
  }
];