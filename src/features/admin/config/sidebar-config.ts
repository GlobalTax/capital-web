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
  Calculator
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
        title: "Landing Pages", 
        url: "/admin/landing-pages", 
        icon: LayoutDashboard,
        badge: "NEW",
        description: "Páginas de conversión",
        visible: false
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
        description: "Gestión de informes de mercado"
      },
      { 
        title: "Calculadoras Sectoriales", 
        url: "/admin/sector-calculators", 
        icon: Calculator,
        badge: "NEW",
        description: "Configuración de calculadoras por sector"
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
    ]
  },
  {
    title: "📈 ANALIZAR LEADS",
    description: "Gestión de prospectos",
    items: [
      { 
        title: "Lead Scoring", 
        url: "/admin/lead-scoring", 
        icon: Target,
        badge: "URGENTE",
        description: "Calificación de leads"
      },
      { 
        title: "Contactos", 
        url: "/admin/contacts", 
        icon: Users,
        description: "Base de contactos"
      },
      { 
        title: "Form Submissions", 
        url: "/admin/form-submissions", 
        icon: ClipboardList,
        badge: "NEW",
        description: "Gestión de formularios"
      },
      { 
        title: "Leads Externos", 
        url: "/admin/external-leads", 
        icon: Activity,
        badge: "NEW",
        description: "Leads del CRM secundario"
      },
    ]
  },
  {
    title: "📊 SEGUIMIENTO",
    description: "Analytics y tracking",
    items: [
      { 
        title: "Dashboard Tracking", 
        url: "/admin/tracking-dashboard", 
        icon: Activity,
        badge: "NEW",
        description: "Métricas unificadas"
      },
      { 
        title: "Configuración", 
        url: "/admin/tracking-config", 
        icon: Eye,
        description: "Config de seguimiento"
      },
    ]
  },
  {
    title: "🔗 INTEGRACIONES",
    description: "Conexiones y APIs externas",
    items: [
      { 
        title: "Panel Integraciones", 
        url: "/admin/integrations", 
        icon: Activity,
        badge: "NEW",
        description: "Apollo, Google Ads, LinkedIn"
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
        title: "Recursos de Diseño", 
        url: "/admin/design-resources", 
        icon: Palette,
        description: "Materiales y assets web"
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