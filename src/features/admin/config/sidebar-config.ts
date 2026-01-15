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
  Briefcase,
  FolderOpen,
  Store,
  Mail,
  Kanban,
  CalendarDays,
  Bell,
  UserPlus,
  Shield,
  Newspaper
} from 'lucide-react';
import { LucideIcon } from 'lucide-react';

export interface SidebarItem {
  title: string;
  icon: LucideIcon;
  url: string;
  badge?: 'URGENTE' | 'AI' | 'NEW';
  badgeAddedDate?: string; // ISO date for NEW badge expiration
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
        title: "Valoraciones & Recovery", 
        url: "/admin/valuation-analytics", 
        icon: Activity,
        badge: "NEW",
        description: "Analytics de valoraciones"
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
        title: "Sector Dossiers", 
        url: "/admin/sector-dossiers", 
        icon: FolderOpen,
        badge: "AI",
        description: "Análisis competitivo por sector con IA"
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
        title: "LP Venta Empresas", 
        url: "/admin/venta-empresas-content", 
        icon: Store,
        badge: "NEW",
        description: "Contenido landing venta empresas"
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
        title: "Entrada Manual Leads",
        url: "/admin/calculadora-manual", 
        icon: UserPlus,
        badge: "NEW",
        description: "Introducir leads de Meta/externos"
      },
      { 
        title: "Valoraciones Pro", 
        url: "/admin/valoraciones-pro", 
        icon: Calculator,
        badge: "NEW",
        description: "Sistema de valoración profesional"
      },
      { 
        title: "Pipeline de Leads",
        url: "/admin/leads-pipeline", 
        icon: Kanban,
        badge: "NEW",
        description: "Tablero Kanban de leads"
      },
      { 
        title: "Reservas Llamadas",
        url: "/admin/bookings", 
        icon: CalendarDays,
        badge: "NEW",
        description: "Gestión de reservas de llamadas"
      },
      { 
        title: "Contactos",
        url: "/admin/contacts", 
        icon: Users,
        description: "Base de contactos"
      },
      { 
        title: "Empresas",
        url: "/admin/empresas", 
        icon: Building2,
        badge: "NEW",
        description: "Base de datos de empresas"
      },
      { 
        title: "Leads Inversores (ROD)",
        url: "/admin/investor-leads", 
        icon: TrendingUp,
        badge: "NEW",
        description: "Gestión de leads ROD"
      },
      { 
        title: "Documentos Fase 0",
        url: "/admin/documentos-fase0", 
        icon: Shield,
        badge: "NEW",
        description: "NDA y Propuestas de Mandato"
      },
    ]
  },
  {
    title: "📰 NOTICIAS M&A",
    description: "Gestión de noticias automatizadas",
    items: [
      { 
        title: "Noticias M&A",
        url: "/admin/noticias", 
        icon: Newspaper,
        badge: "NEW",
        description: "Moderar y publicar noticias"
      },
    ]
  },
  {
    title: "💼 CAPITAL RIESGO",
    description: "CRM de fondos PE/VC",
    items: [
      { 
        title: "Apollo Import", 
        url: "/admin/cr-apollo-import", 
        icon: Users,
        badge: "NEW",
        description: "Importar personas desde Apollo"
      },
      { 
        title: "Directorio CR", 
        url: "/admin/cr-directory", 
        icon: Briefcase,
        badge: "NEW",
        description: "Fondos y personas PE/VC"
      },
      { 
        title: "Portfolio CR", 
        url: "/admin/cr-portfolio-list", 
        icon: Building2,
        badge: "NEW",
        description: "Empresas en cartera de fondos PE/VC"
      },
      { 
        title: "Inteligencia CR", 
        url: "/admin/fund-intelligence?type=cr", 
        icon: Eye,
        badge: "AI",
        description: "Scraping y noticias de fondos PE/VC"
      },
    ]
  },
  {
    title: "🔍 SEARCH FUNDS",
    description: "Gestión y matching de Search Funds",
    items: [
      { 
        title: "Apollo Import", 
        url: "/admin/sf-apollo-import", 
        icon: Users,
        badge: "NEW",
        description: "Importar personas desde Apollo"
      },
      { 
        title: "Radar SF", 
        url: "/admin/sf-radar", 
        icon: Target,
        badge: "AI",
        description: "Búsqueda automática de searchers"
      },
      { 
        title: "Directorio SF", 
        url: "/admin/sf-directory", 
        icon: Building2,
        description: "Directorio de Search Funds"
      },
      { 
        title: "Portfolio SF", 
        url: "/admin/sf-portfolio-list", 
        icon: Building2,
        badge: "NEW",
        description: "Empresas adquiridas por Search Funds"
      },
      { 
        title: "Backers", 
        url: "/admin/sf-backers", 
        icon: Users,
        description: "Gestión de backers e inversores"
      },
      { 
        title: "Matching Inbox", 
        url: "/admin/sf-matches", 
        icon: Target,
        description: "Matches pendientes de revisar"
      },
      { 
        title: "Inteligencia SF", 
        url: "/admin/fund-intelligence?type=sf", 
        icon: Eye,
        badge: "AI",
        description: "Scraping y noticias de Search Funds"
      },
    ]
  },
  {
    title: "🏛️ BOUTIQUES M&A",
    description: "Directorio de competencia",
    items: [
      { 
        title: "Apollo Import", 
        url: "/admin/mna-apollo-import", 
        icon: Users,
        badge: "NEW",
        description: "Importar boutiques desde Apollo"
      },
      { 
        title: "Directorio Boutiques", 
        url: "/admin/mna-directory", 
        icon: Building2,
        badge: "NEW",
        description: "Competidores y asesores M&A"
      },
    ]
  },
  {
    title: "📚 RECURSOS",
    description: "Gestión de recursos y herramientas",
    items: [
      { 
        title: "Test Exit-Ready",
        url: "/admin/recursos/exit-ready", 
        icon: ClipboardList,
        badge: "NEW",
        description: "Tests de preparación para venta"
      },
    ]
  },
  {
    title: "📧 MARKETING",
    description: "Comunicación con leads",
    items: [
      { 
        title: "Costes Campañas", 
        url: "/admin/campaign-costs", 
        icon: TrendingUp,
        badge: "NEW",
        description: "Análisis CAC Meta Ads y Google Ads"
      },
      { 
        title: "Newsletter Semanal", 
        url: "/admin/newsletter", 
        icon: Mail,
        badge: "NEW",
        description: "Envío de newsletters a suscriptores"
      },
    ]
  },
  {
    title: "⚙️ CONFIGURACIÓN",
    description: "Configuración del sistema",
    items: [
      { 
        title: "Notificaciones", 
        url: "/admin/notifications", 
        icon: Bell,
        badge: "NEW",
        description: "Centro de notificaciones"
      },
      { 
        title: "Usuarios Admin", 
        url: "/admin/admin-users", 
        icon: Users,
        description: "Gestión de administradores"
      },
      { 
        title: "Workflow Fase 0", 
        url: "/admin/configuracion/workflow-templates", 
        icon: Settings,
        badge: "NEW",
        description: "Configurar tareas del workflow de leads"
      },
      { 
        title: "Destinatarios Email", 
        url: "/admin/configuracion/destinatarios-email", 
        icon: Target,
        description: "Gestión de destinatarios de emails"
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