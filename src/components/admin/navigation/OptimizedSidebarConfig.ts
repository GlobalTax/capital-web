import { 
  LayoutDashboard, 
  Sparkles,
  FileText, 
  Award,
  Zap,
  BarChart3,
  Building2,
  TrendingUp,
  Users,
  MessageSquare,
  Settings,
  Target,
  Eye,
  Megaphone,
  Calculator,
  FileSignature
} from 'lucide-react';
import { LucideIcon } from 'lucide-react';

export interface OptimizedSidebarItem {
  title: string;
  icon: LucideIcon;
  url: string;
  badge?: 'NEW' | 'AI' | 'HOT';
  description?: string;
  visible?: boolean;
}

export interface OptimizedSidebarSection {
  title: string;
  description: string;
  items: OptimizedSidebarItem[];
  workflow?: 'create' | 'manage' | 'analyze';
}

export const optimizedSidebarSections: OptimizedSidebarSection[] = [
  {
    title: "📊 DASHBOARD",
    description: "Panel principal",
    workflow: 'analyze',
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
    workflow: 'create',
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
        title: "Calculadora Meta", 
        url: "/lp/calculadora-meta", 
        icon: Calculator,
        badge: "NEW",
        description: "Herramienta de valoración Meta Ads"
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
    workflow: 'manage',
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
      { 
        title: "Banners", 
        url: "/admin/banners", 
        icon: Megaphone,
        badge: "NEW",
        description: "Gestión de banners"
      },
    ]
  },
  {
    title: "📈 ANALIZAR LEADS",
    description: "Gestión de prospectos",
    workflow: 'analyze',
    items: [
      { 
        title: "Contactos",
        url: "/admin/contacts", 
        icon: Users,
        description: "Base de contactos"
      },
    ]
  },
  {
    title: "⚙️ CONFIGURACIÓN",
    description: "Ajustes del sistema",
    workflow: 'manage',
    items: [
      { 
        title: "Usuarios Admin", 
        url: "/admin/admin-users", 
        icon: Users,
        description: "Gestión de administradores"
      },
      { 
        title: "Firma PDF", 
        url: "/admin/configuracion/firma-pdf", 
        icon: FileSignature,
        badge: "NEW",
        description: "Firma de informes de valoración"
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

// Quick actions for dashboard
export const quickActions: OptimizedSidebarItem[] = [
  {
    title: "Nuevo Lead Magnet",
    url: "/admin/lead-magnets",
    icon: Zap,
    badge: "AI"
  },
  {
    title: "Crear Contenido",
    url: "/admin/content-studio", 
    icon: Sparkles,
    badge: "NEW"
  },
  {
    title: "Ver Performance",
    url: "/admin/content-performance",
    icon: Eye
  }
];

// Workflow-based navigation
export const workflowSections = {
  create: {
    title: "Crear Recursos",
    color: "text-green-600",
    items: optimizedSidebarSections.filter(s => s.workflow === 'create').flatMap(s => s.items)
  },
  manage: {
    title: "Gestionar Datos", 
    color: "text-blue-600",
    items: optimizedSidebarSections.filter(s => s.workflow === 'manage').flatMap(s => s.items)
  },
  analyze: {
    title: "Analizar Results",
    color: "text-purple-600", 
    items: optimizedSidebarSections.filter(s => s.workflow === 'analyze').flatMap(s => s.items)
  }
};