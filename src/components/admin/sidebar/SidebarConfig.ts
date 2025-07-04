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
  Eye
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
      { 
        title: "Performance", 
        url: "/admin/content-performance", 
        icon: BarChart3,
        badge: "NEW",
        description: "Métricas de contenido"
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
        description: "Creación con IA"
      },
      { 
        title: "Lead Magnets", 
        url: "/admin/lead-magnets", 
        icon: Zap,
        description: "Recursos descargables"
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