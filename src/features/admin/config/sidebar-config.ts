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
  Newspaper,
  Search,
  Globe,
  ShoppingCart,
  PanelLeft,
  Landmark,
  RefreshCw,
  Calendar
} from 'lucide-react';
import { LucideIcon } from 'lucide-react';

export interface SidebarItem {
  title: string;
  icon: LucideIcon;
  url: string;
  badge?: 'URGENTE' | 'AI';
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
        title: "Calendario Editorial", 
        url: "/admin/content-calendar", 
        icon: Calendar,
        description: "Calendario de contenido editorial"
      },
      { 
        title: "Valoraciones & Recovery", 
        url: "/admin/valuation-analytics", 
        icon: Activity,
        description: "Analytics de valoraciones"
      },
      { 
        title: "Search Analytics", 
        url: "/admin/search-analytics", 
        icon: Search,
        description: "Análisis de búsquedas"
      },
    ]
  },
  {
    title: "🔥 LEADS",
    description: "Centro de gestión de leads",
    items: [
      { 
        title: "Gestión de Leads", 
        url: "/admin/contacts", 
        icon: Target,
        badge: "URGENTE",
        description: "Todos los leads del embudo"
      },
      { 
        title: "Pipeline",
        url: "/admin/leads-pipeline", 
        icon: Kanban,
        description: "Tablero Kanban de leads"
      },
    ]
  },
  {
    title: "💼 CRM",
    description: "Gestión de prospectos y oportunidades",
    items: [
      { 
        title: "Gestión de Prospectos", 
        url: "/admin/prospectos", 
        icon: Target,
        description: "Leads avanzados con perfil de empresa"
      },
    ]
  },
  {
    title: "✨ CREAR CONTENIDO",
    description: "Herramientas de creación",
    items: [
      { 
        title: "Calendario Editorial", 
        url: "/admin/content-calendar", 
        icon: Calendar,
        description: "Planificación editorial"
      },
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
        description: "Herramienta de valoración para asesores"
      },
      { 
        title: "Landing Pages", 
        url: "/admin/landing-pages-unified", 
        icon: LayoutDashboard,
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
        description: "Múltiplos para calculadora de asesores"
      },
      { 
        title: "Documentos ROD",
        url: "/admin/rod-documents", 
        icon: FileText,
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
        description: "Contenido landing venta empresas"
      },
      { 
        title: "Logos Carousel", 
        url: "/admin/carousel-logos", 
        icon: Image,
        description: "Gestión de logos del carrusel"
      },
      { 
        title: "Banners", 
        url: "/admin/banners", 
        icon: Megaphone,
        description: "Gestión de banners del sitio"
      },
      { 
        title: "Hero Slides", 
        url: "/admin/hero-slides", 
        icon: Image,
        description: "Imágenes y textos del hero principal"
      },
      { 
        title: "Áreas de Práctica", 
        url: "/admin/practice-areas", 
        icon: Palette,
        description: "Tarjetas de servicios de la home"
      },
      { 
        title: "La Firma", 
        url: "/admin/la-firma", 
        icon: Building2,
        description: "Foto y contenido de la sección La Firma"
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
    title: "🌐 WEB INTELLIGENCE",
    description: "Empresas visitantes de la web",
    items: [
      { 
        title: "Apollo Visitors", 
        url: "/admin/apollo-visitors", 
        icon: Eye,
        description: "Importar visitantes desde Apollo"
      },
      { 
        title: "Dealsuite Sync", 
        url: "/admin/dealsuite", 
        icon: RefreshCw,
        description: "Sincronizar deals desde Dealsuite"
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
        description: "Introducir leads de Meta/externos"
      },
      { 
        title: "Valoraciones Pro", 
        url: "/admin/valoraciones-pro", 
        icon: Calculator,
        description: "Sistema de valoración profesional"
      },
      { 
        title: "Campañas Outbound",
        url: "/admin/campanas-valoracion", 
        icon: Megaphone,
        description: "Campañas masivas de valoración por sector"
      },
      { 
        title: "Pipeline de Leads",
        url: "/admin/leads-pipeline", 
        icon: Kanban,
        description: "Tablero Kanban de leads"
      },
      { 
        title: "Reservas Llamadas",
        url: "/admin/bookings", 
        icon: CalendarDays,
        description: "Gestión de reservas de llamadas"
      },
      { 
        title: "Leads (Todos)",
        url: "/admin/contacts", 
        icon: Target,
        description: "Vista completa de todos los leads"
      },
      { 
        title: "Contactos Compra",
        url: "/admin/buyer-contacts", 
        icon: ShoppingCart,
        description: "Contactos campaña compras"
      },
      { 
        title: "Empresas",
        url: "/admin/empresas", 
        icon: Building2,
        description: "Base de datos de empresas"
      },
      { 
        title: "Leads Inversores (ROD)",
        url: "/admin/investor-leads", 
        icon: TrendingUp,
        description: "Gestión de leads ROD"
      },
      { 
        title: "Documentos Fase 0",
        url: "/admin/documentos-fase0", 
        icon: Shield,
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
        description: "Importar personas desde Apollo"
      },
      { 
        title: "Directorio CR", 
        url: "/admin/cr-directory", 
        icon: Briefcase,
        description: "Fondos y personas PE/VC"
      },
      { 
        title: "Portfolio CR", 
        url: "/admin/cr-portfolio-list", 
        icon: Building2,
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
        title: "Operaciones SF",
        url: "/admin/sf-acquisitions", 
        icon: Briefcase,
        description: "Listado de adquisiciones de Search Funds"
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
    title: "🏢 CORPORATIVOS",
    description: "Compradores estratégicos",
    items: [
      { 
        title: "Directorio Corporativos", 
        url: "/admin/corporate-buyers", 
        icon: Landmark,
        description: "Compradores corporativos y estratégicos"
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
        description: "Importar boutiques desde Apollo"
      },
      { 
        title: "Directorio Boutiques", 
        url: "/admin/mna-directory", 
        icon: Building2,
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
        description: "Análisis CAC Meta Ads y Google Ads"
      },
      { 
        title: "Newsletter Semanal", 
        url: "/admin/newsletter", 
        icon: Mail,
        description: "Envío de newsletters a suscriptores"
      },
      { 
        title: "Importar Brevo", 
        url: "/admin/brevo-import", 
        icon: Users,
        description: "Importar contactos desde Brevo"
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
      { 
        title: "Navegación Sidebar", 
        url: "/admin/settings/sidebar", 
        icon: PanelLeft,
        description: "Configurar secciones e items del menú lateral"
      },
    ]
  }
];
